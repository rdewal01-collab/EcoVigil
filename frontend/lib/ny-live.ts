import { getAllRegionsWithAssessments, getDashboardStats, getHighestRiskRegions } from "./data";
import { scoreToRiskLevel } from "./risk";
import type {
  HazardAssessment,
  LiveSourceStatus,
  NyLiveDashboard,
  RegionWithAssessment,
} from "./types";

const NOAA_ALERTS_URL = "https://api.weather.gov/alerts/active?area=NY";
const USGS_NY_IV_URL =
  "https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd=NY&parameterCd=00010,00060,00065&siteStatus=active";
const NY_HEALTH_CATALOG_URL =
  "https://api.us.socrata.com/api/catalog/v1?domains=health.data.ny.gov&search_context=health.data.ny.gov";

type NoaaAlert = {
  properties?: {
    areaDesc?: string;
    event?: string;
    severity?: string;
    sent?: string;
  };
};

type UsgsSeries = {
  sourceInfo?: {
    siteName?: string;
    geoLocation?: { geogLocation?: { latitude?: number; longitude?: number } };
  };
  values?: Array<{ value?: Array<{ value?: string; dateTime?: string }> }>;
};

type SocrataCatalogResult = {
  resource?: {
    id?: string;
    name?: string;
    updatedAt?: string;
  };
};

type LiveSignals = {
  noaaAlerts: NoaaAlert[];
  usgsSeries: UsgsSeries[];
  catalogs: {
    disease: SocrataCatalogResult[];
    ncd: SocrataCatalogResult[];
    allergy: SocrataCatalogResult[];
  };
  sources: LiveSourceStatus[];
};

export async function getNyLiveDashboard(): Promise<NyLiveDashboard> {
  const fallbackRegions = getAllRegionsWithAssessments();
  const signals = await fetchNySignals();
  const regions = applyLiveSignals(fallbackRegions, signals);
  const highestRisk = [...regions]
    .sort((a, b) => b.assessment.riskScore - a.assessment.riskScore)
    .slice(0, 4);

  return {
    regions,
    highestRisk,
    stats: buildStats(regions),
    sources: signals.sources,
  };
}

export async function fetchNySignals(): Promise<LiveSignals> {
  const [alertsResult, usgsResult, diseaseCatalog, ncdCatalog, allergyCatalog] = await Promise.allSettled([
    fetchJson<{ features?: NoaaAlert[] }>(NOAA_ALERTS_URL),
    fetchJson<{ value?: { timeSeries?: UsgsSeries[] } }>(USGS_NY_IV_URL),
    fetchCatalog("lyme disease communicable disease"),
    fetchCatalog("asthma chronic disease county"),
    fetchCatalog("allergy asthma pollen emergency department"),
  ]);

  const noaaAlerts = alertsResult.status === "fulfilled" ? alertsResult.value.features ?? [] : [];
  const usgsSeries = usgsResult.status === "fulfilled" ? usgsResult.value.value?.timeSeries ?? [] : [];
  const catalogs = {
    disease: diseaseCatalog.status === "fulfilled" ? diseaseCatalog.value : [],
    ncd: ncdCatalog.status === "fulfilled" ? ncdCatalog.value : [],
    allergy: allergyCatalog.status === "fulfilled" ? allergyCatalog.value : [],
  };

  return {
    noaaAlerts,
    usgsSeries,
    catalogs,
    sources: [
      {
        id: "noaa-alerts",
        name: "NOAA/NWS NY active alerts",
        url: NOAA_ALERTS_URL,
        status: alertsResult.status === "fulfilled" ? "live" : "fallback",
        summary:
          alertsResult.status === "fulfilled"
            ? `${noaaAlerts.length} active NY weather/environment alerts loaded.`
            : "NOAA alerts unavailable; local fallback risk stays active.",
        recordCount: noaaAlerts.length,
      },
      {
        id: "usgs-water",
        name: "USGS NY water observations",
        url: USGS_NY_IV_URL,
        status: usgsResult.status === "fulfilled" ? "live" : "fallback",
        summary:
          usgsResult.status === "fulfilled"
            ? `${usgsSeries.length} NY monitoring time series loaded for streamflow, stage, or temperature.`
            : "USGS water observations unavailable; local fallback risk stays active.",
        recordCount: usgsSeries.length,
      },
      {
        id: "ny-health-disease",
        name: "NY Health Data disease catalog",
        url: `${NY_HEALTH_CATALOG_URL}&search=lyme%20disease%20communicable%20disease`,
        status: catalogs.disease.length > 0 ? "live" : "degraded",
        summary:
          catalogs.disease.length > 0
            ? `${catalogs.disease.length} NY Health Data disease datasets discovered.`
            : "NY Health disease datasets not discovered from catalog search.",
        recordCount: catalogs.disease.length,
      },
      {
        id: "ny-health-ncd-allergy",
        name: "NY Health Data NCD/allergy catalog",
        url: `${NY_HEALTH_CATALOG_URL}&search=asthma%20chronic%20disease`,
        status: catalogs.ncd.length + catalogs.allergy.length > 0 ? "live" : "degraded",
        summary:
          catalogs.ncd.length + catalogs.allergy.length > 0
            ? `${catalogs.ncd.length + catalogs.allergy.length} NCD/allergy datasets discovered.`
            : "NY Health NCD/allergy datasets not discovered from catalog search.",
        recordCount: catalogs.ncd.length + catalogs.allergy.length,
      },
    ],
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 900 },
    headers: {
      Accept: "application/json",
      "User-Agent": "VigiReal/0.1 public-health-dashboard",
    },
  });

  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchCatalog(search: string): Promise<SocrataCatalogResult[]> {
  const url = `${NY_HEALTH_CATALOG_URL}&limit=5&search=${encodeURIComponent(search)}`;
  const result = await fetchJson<{ results?: SocrataCatalogResult[] }>(url);
  return result.results ?? [];
}

function applyLiveSignals(
  regions: RegionWithAssessment[],
  signals: LiveSignals
): RegionWithAssessment[] {
  return regions.map((region) => {
    const alertHits = signals.noaaAlerts.filter((alert) => matchesRegion(alert, region));
    const nearbyWaterSeries = countNearbyWaterSeries(signals.usgsSeries, region);
    const diseaseCatalogBoost = signals.catalogs.disease.length > 0 ? 0.04 : 0;
    const ncdCatalogBoost = signals.catalogs.ncd.length > 0 ? 0.03 : 0;
    const allergyCatalogBoost = signals.catalogs.allergy.length > 0 ? 0.03 : 0;
    const alertBoost = Math.min(0.18, alertHits.length * 0.04);
    const waterBoost = Math.min(0.16, nearbyWaterSeries * 0.015);
    const score = clamp(region.assessment.riskScore + alertBoost + waterBoost + diseaseCatalogBoost);
    const assessment: HazardAssessment = {
      ...region.assessment,
      observedDate: new Date().toISOString().slice(0, 10),
      riskScore: score,
      riskLevel: scoreToRiskLevel(score),
      confidence: signals.sources.some((source) => source.status === "live") ? "high" : "medium",
      nndssSignal: clamp(region.assessment.nndssSignal + diseaseCatalogBoost + alertBoost / 2),
      waterSignal: clamp(region.assessment.waterSignal + waterBoost),
      ncdSignal: clamp(region.assessment.ncdSignal + ncdCatalogBoost),
      allergySignal: clamp(region.assessment.allergySignal + allergyCatalogBoost),
      reportVolume7d: region.assessment.reportVolume7d + alertHits.length,
      topFeatures: [
        { name: "noaa_active_alerts", contribution: alertBoost },
        { name: "usgs_water_observations", contribution: waterBoost },
        ...region.assessment.topFeatures,
      ]
        .filter((feature) => feature.contribution > 0)
        .slice(0, 3),
    };

    return { ...region, assessment };
  });
}

function matchesRegion(alert: NoaaAlert, region: RegionWithAssessment): boolean {
  const haystack = `${alert.properties?.areaDesc ?? ""} ${alert.properties?.event ?? ""}`.toLowerCase();
  const regionTokens = [region.name, region.jurisdiction]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((token) => token.length > 4);

  return regionTokens.some((token) => haystack.includes(token));
}

function countNearbyWaterSeries(series: UsgsSeries[], region: RegionWithAssessment): number {
  return series.filter((item) => {
    const point = item.sourceInfo?.geoLocation?.geogLocation;
    if (point?.latitude === undefined || point.longitude === undefined) return false;
    return distanceKm(region.lat, region.lon, point.latitude, point.longitude) <= 120;
  }).length;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const radiusKm = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return radiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildStats(regions: RegionWithAssessment[]) {
  const fallback = getDashboardStats();
  const elevated = regions.filter((region) =>
    ["high", "critical"].includes(region.assessment.riskLevel)
  );
  const low = regions.filter((region) => region.assessment.riskLevel === "low");
  const highConfidence = regions.filter((region) => region.assessment.confidence === "high");

  return {
    monitored: regions.length,
    elevatedCount: elevated.length,
    lowCount: low.length,
    reportCount: fallback.reportCount,
    highConfidencePercent: regions.length
      ? Math.round((highConfidence.length / regions.length) * 100)
      : 0,
  };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}
