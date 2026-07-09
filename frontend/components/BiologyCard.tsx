import type { HazardAssessment } from "@/lib/types";
import { formatFeatureName, HAZARD_LABELS } from "@/lib/risk";

export function BiologyCard({ assessment }: { assessment: HazardAssessment }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Signal explanation</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">
            {HAZARD_LABELS[assessment.primaryCategory]} is the leading signal.
          </h2>
        </div>
        <p className="text-sm text-slate-500">Model {assessment.modelVersion}</p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {assessment.topFeatures.map((feature) => (
          <div key={feature.name} className="rounded-lg border border-slate-200 p-4">
            <p className="text-sm font-semibold text-slate-950">{formatFeatureName(feature.name)}</p>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-slate-900"
                style={{ width: `${Math.round(feature.contribution * 100)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {Math.round(feature.contribution * 100)}% contribution
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
