import type { ConfidenceLevel, HazardCategory, PublicGuidance, RiskLevel } from "./types";

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  critical: "Critical",
  unknown: "Unknown",
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#15803d",
  moderate: "#b45309",
  high: "#c2410c",
  critical: "#b91c1c",
  unknown: "#475569",
};

export const RISK_DESCRIPTIONS: Record<RiskLevel, string> = {
  low: "No strong cross-signal biohazard pattern is present in current feeds.",
  moderate: "One or more indicators are elevated and should be watched.",
  high: "Multiple indicators are aligned; local response teams should triage the area.",
  critical: "Strong multi-source signal. Escalate verification and public guidance workflows.",
  unknown: "Recent evidence is incomplete, so the risk estimate should be treated cautiously.",
};

export const HAZARD_LABELS: Record<HazardCategory, string> = {
  disease_outbreak: "Disease outbreak",
  water_contamination: "Contaminated water",
  algal_bloom: "Algal bloom",
  tick_borne: "Tick-borne illness",
  ncd_signal: "NCD signal",
  allergy_signal: "Allergy signal",
};

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score < 0.25) return "low";
  if (score < 0.5) return "moderate";
  if (score < 0.75) return "high";
  return "critical";
}

export function getPublicGuidance(level: RiskLevel): PublicGuidance {
  switch (level) {
    case "critical":
      return {
        residents: "Follow local health department instructions, avoid flagged water or exposure zones, and seek care for severe or unusual symptoms.",
        clinicians: "Increase syndrome-specific screening, report notifiable conditions quickly, and capture exposure history.",
        authorities: "Activate field verification, issue targeted advisories, and reconcile reports with CDC NNDSS or state surveillance feeds.",
      };
    case "high":
      return {
        residents: "Reduce exposure in flagged locations and watch for official advisories.",
        clinicians: "Monitor compatible symptoms and report clusters through normal public-health channels.",
        authorities: "Prioritize sampling, vector checks, and data quality review for the active signal mix.",
      };
    case "moderate":
      return {
        residents: "Stay alert to local notices and avoid visibly contaminated water or high-risk tick habitat.",
        clinicians: "Track unusual volumes by syndrome and geography.",
        authorities: "Keep the region on watch and schedule verification if the signal persists.",
      };
    case "unknown":
      return {
        residents: "Use official advisories as the source of truth while evidence is incomplete.",
        clinicians: "Use routine reporting and document suspected exposures.",
        authorities: "Fill missing data feeds before making operational decisions.",
      };
    case "low":
    default:
      return {
        residents: "No special action is suggested beyond normal public-health precautions.",
        clinicians: "Continue routine surveillance and reporting.",
        authorities: "Maintain baseline monitoring.",
      };
  }
}

export function formatConfidence(confidence: ConfidenceLevel): string {
  return confidence.charAt(0).toUpperCase() + confidence.slice(1);
}

export function daysSince(dateStr: string): number {
  const observed = new Date(dateStr);
  const now = new Date();
  return Math.max(0, Math.floor((now.getTime() - observed.getTime()) / 86_400_000));
}

export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
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

export function formatFeatureName(name: string): string {
  const labels: Record<string, string> = {
    nndss_signal: "NNDSS notifiable disease signal",
    water_signal: "Water contamination signal",
    bloom_signal: "Algal bloom signal",
    tick_signal: "Tick-borne illness signal",
    ncd_signal: "NCD burden signal",
    allergy_signal: "Allergy and pollen signal",
    report_volume_7d: "7-day field report volume",
    wastewater_trend: "Wastewater trend",
    vector_density: "Vector density",
    noaa_active_alerts: "NOAA active alerts",
    usgs_water_observations: "USGS water observations",
  };

  return labels[name] ?? name.replace(/_/g, " ");
}
