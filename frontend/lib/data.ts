import assessmentsData from "@/public/data/assessments.json";
import regionsData from "@/public/data/regions.json";
import reportsData from "@/public/data/reports.json";
import type {
  FieldReport,
  HazardAssessment,
  Region,
  RegionWithAssessment,
  RiskLevel,
} from "./types";
import { haversineKm } from "./risk";

const regions = regionsData as Region[];
const assessments = assessmentsData as HazardAssessment[];
const reports = reportsData as FieldReport[];

export function getRegions(): Region[] {
  return regions;
}

export function getAssessments(): HazardAssessment[] {
  return assessments;
}

export function getReports(): FieldReport[] {
  return reports;
}

export function getRegionById(id: string): Region | undefined {
  return regions.find((region) => region.id === id);
}

export function getAssessmentForRegion(regionId: string): HazardAssessment | undefined {
  return assessments.find((assessment) => assessment.regionId === regionId);
}

export function getRegionWithAssessment(regionId: string): RegionWithAssessment | undefined {
  const region = getRegionById(regionId);
  const assessment = getAssessmentForRegion(regionId);
  if (!region || !assessment) return undefined;
  return { ...region, assessment };
}

export function getAllRegionsWithAssessments(): RegionWithAssessment[] {
  return assessments
    .map((assessment) => {
      const region = getRegionById(assessment.regionId);
      if (!region) return null;
      return { ...region, assessment };
    })
    .filter((region): region is RegionWithAssessment => region !== null);
}

export function getReportsForRegion(regionId: string): FieldReport[] {
  return reports
    .filter((report) => report.regionId === regionId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getNearbyRegions(lat: number, lon: number, limit = 10): RegionWithAssessment[] {
  return getAllRegionsWithAssessments()
    .sort((a, b) => haversineKm(lat, lon, a.lat, a.lon) - haversineKm(lat, lon, b.lat, b.lon))
    .slice(0, limit);
}

export function getHighestRiskRegions(limit = 5): RegionWithAssessment[] {
  return getAllRegionsWithAssessments()
    .sort((a, b) => b.assessment.riskScore - a.assessment.riskScore)
    .slice(0, limit);
}

export function getDashboardStats() {
  const all = getAllRegionsWithAssessments();
  const elevated = all.filter((region) =>
    ["high", "critical"].includes(region.assessment.riskLevel)
  );
  const low = all.filter((region) => region.assessment.riskLevel === "low");
  const highConfidence = all.filter((region) => region.assessment.confidence === "high");

  return {
    monitored: all.length,
    elevatedCount: elevated.length,
    lowCount: low.length,
    reportCount: reports.length,
    highConfidencePercent: all.length ? Math.round((highConfidence.length / all.length) * 100) : 0,
  };
}

export function countByRisk(): Record<RiskLevel, number> {
  return getAllRegionsWithAssessments().reduce<Record<RiskLevel, number>>(
    (counts, region) => {
      counts[region.assessment.riskLevel] += 1;
      return counts;
    },
    { low: 0, moderate: 0, high: 0, critical: 0, unknown: 0 }
  );
}

export function getDataSourcePlan() {
  return [
    {
      name: "NY Health Data catalog",
      status: "Connected",
      purpose:
        "Discovers disease, chronic disease, asthma, and allergy datasets from the NY Health Data catalog.",
    },
    {
      name: "USGS NY water observations",
      status: "Connected",
      purpose:
        "Loads NY streamflow, gage height, and water temperature observations for water-risk context.",
    },
    {
      name: "NOAA/NWS NY alerts",
      status: "Connected",
      purpose: "Loads active New York weather and environmental alerts as live exposure context.",
    },
    {
      name: "Tick and vector risk",
      status: "NY catalog discovery",
      purpose:
        "Uses NY disease dataset discovery plus regional vector-risk context until a dedicated vector feed is added.",
    },
    {
      name: "NCD and allergy datasets",
      status: "NY catalog discovery",
      purpose:
        "Discovers asthma, chronic disease, and allergy-related NY Health datasets as planning modifiers.",
    },
  ];
}
