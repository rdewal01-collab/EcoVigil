import Link from "next/link";
import { CalendarDays, ChevronRight, MapPin, RadioTower } from "lucide-react";
import type { RegionWithAssessment } from "@/lib/types";
import { daysSince, haversineKm, HAZARD_LABELS, RISK_DESCRIPTIONS } from "@/lib/risk";
import { RiskBadge } from "./RiskBadge";

export function LakeList({
  regions,
  userLat,
  userLon,
  limit,
}: {
  regions: RegionWithAssessment[];
  userLat?: number;
  userLon?: number;
  limit?: number;
}) {
  const sorted = [...regions]
    .sort((a, b) => {
      if (userLat !== undefined && userLon !== undefined) {
        return haversineKm(userLat, userLon, a.lat, a.lon) - haversineKm(userLat, userLon, b.lat, b.lon);
      }
      return b.assessment.riskScore - a.assessment.riskScore;
    })
    .slice(0, limit ?? regions.length);

  return (
    <ul className="divide-y divide-slate-200">
      {sorted.map((region) => {
        const distance =
          userLat !== undefined && userLon !== undefined
            ? haversineKm(userLat, userLon, region.lat, region.lon)
            : null;
        const age = daysSince(region.assessment.observedDate);

        return (
          <li key={region.id}>
            <Link
              href={`/region/${region.id}`}
              className="group grid gap-3 rounded-lg px-2 py-4 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 sm:grid-cols-[1fr_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-slate-950">{region.name}</p>
                  <RiskBadge
                    level={region.assessment.riskLevel}
                    score={region.assessment.riskScore}
                    size="sm"
                  />
                </div>
                <p className="mt-1 text-sm text-slate-600">{region.jurisdiction}</p>
                <p className="mt-2 text-sm text-slate-500">
                  {RISK_DESCRIPTIONS[region.assessment.riskLevel]}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <RadioTower className="h-3.5 w-3.5" />
                    {HAZARD_LABELS[region.assessment.primaryCategory]}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {age === 0 ? "Updated today" : `${age}d old`}
                  </span>
                  {distance !== null && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {distance.toFixed(1)} km
                    </span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 self-center text-slate-400 transition group-hover:translate-x-0.5" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
