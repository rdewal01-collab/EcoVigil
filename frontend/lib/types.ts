export type RiskLevel = "low" | "moderate" | "high" | "critical" | "unknown";
export type ConfidenceLevel = "low" | "medium" | "high";

export type HazardCategory =
  | "disease_outbreak"
  | "water_contamination"
  | "algal_bloom"
  | "tick_borne"
  | "ncd_signal"
  | "allergy_signal";

export interface Region {
  id: string;
  name: string;
  jurisdiction: string;
  state: string;
  lat: number;
  lon: number;
  population: number;
  officialAdvisoryUrl: string;
}

export interface HazardAssessment {
  regionId: string;
  observedDate: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: ConfidenceLevel;
  primaryCategory: HazardCategory;
  activeSignals: HazardCategory[];
  nndssSignal: number;
  waterSignal: number;
  bloomSignal: number;
  tickSignal: number;
  ncdSignal: number;
  allergySignal: number;
  reportVolume7d: number;
  modelVersion: string;
  topFeatures: { name: string; contribution: number }[];
}

export interface FieldReport {
  id: string;
  regionId: string;
  description: string;
  tags: HazardCategory[];
  lat: number;
  lon: number;
  verified: boolean;
  createdAt: string;
}

export interface RegionWithAssessment extends Region {
  assessment: HazardAssessment;
}

export interface PublicGuidance {
  residents: string;
  clinicians: string;
  authorities: string;
}

export interface HazardExplanation {
  observation: string;
  evidence: string;
  context: string;
  action: string;
}
