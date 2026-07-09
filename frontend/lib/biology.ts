import type { HazardAssessment, HazardExplanation, Region } from "./types";
import { HAZARD_LABELS, formatFeatureName } from "./risk";

export function generateHazardExplanation(
  assessment: HazardAssessment,
  region: Region
): HazardExplanation {
  const strongestFeature = assessment.topFeatures[0]?.name;

  return {
    observation: `${region.name} is currently led by ${HAZARD_LABELS[assessment.primaryCategory].toLowerCase()} with a ${Math.round(
      assessment.riskScore * 100
    )}% composite risk score.`,
    evidence: strongestFeature
      ? `The strongest contributor is ${formatFeatureName(strongestFeature).toLowerCase()}.`
      : "No dominant contributor is available yet.",
    context:
      "VigiReal combines official surveillance, environmental exposure data, field reports, and vulnerability layers. Context layers do not replace official advisories.",
    action:
      assessment.riskLevel === "critical" || assessment.riskLevel === "high"
        ? "Prioritize verification, targeted sampling, and agency-facing review."
        : "Keep the region in routine monitoring unless signals rise or field reports cluster.",
  };
}

export const LEARN_MODULES = [
  {
    id: "nndss",
    title: "NNDSS Disease Surveillance",
    summary: "Notifiable disease feeds anchor outbreak interpretation.",
    content:
      "CDC NNDSS-compatible signals should be reconciled with state and local public-health workflows before public action.",
  },
  {
    id: "water",
    title: "Water Contamination",
    summary: "Water risk needs environmental and agency confirmation.",
    content:
      "Sampling, advisories, weather events, sanitation context, and field reports together help prioritize contaminated water investigations.",
  },
  {
    id: "vectors",
    title: "Vector Risk",
    summary: "Tick-borne risk is geographic and seasonal.",
    content:
      "Tick surveillance benefits from vector habitat, weather, case trends, and exposure reports rather than symptoms alone.",
  },
  {
    id: "vulnerability",
    title: "NCD and Allergy Context",
    summary: "Chronic and allergy signals modify response planning.",
    content:
      "NCD and allergy datasets are best used as vulnerability and burden layers, not direct outbreak proof.",
  },
];
