import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, RadioTower, Users } from "lucide-react";
import { BiologyCard } from "@/components/BiologyCard";
import { HealthGuidanceCard } from "@/components/HealthGuidanceCard";
import { RiskBadge } from "@/components/RiskBadge";
import { getAllRegionsWithAssessments, getRegionWithAssessment, getReportsForRegion } from "@/lib/data";
import { formatConfidence, HAZARD_LABELS } from "@/lib/risk";

export function generateStaticParams() {
  return getAllRegionsWithAssessments().map((region) => ({ id: region.id }));
}

export default function RegionPage({ params }: { params: { id: string } }) {
  const region = getRegionWithAssessment(params.id);
  if (!region) notFound();

  const reports = getReportsForRegion(region.id);
  const assessment = region.assessment;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-slate-600 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to map
      </Link>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="text-sm font-semibold text-slate-500">{region.jurisdiction}</p>
          <h1 className="mt-2 text-4xl font-bold tracking-normal text-slate-950">{region.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <RiskBadge level={assessment.riskLevel} score={assessment.riskScore} />
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
              {formatConfidence(assessment.confidence)} confidence
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
              Updated {assessment.observedDate}
            </span>
          </div>
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Primary signal</p>
          <div className="mt-3 flex items-center gap-3">
            <RadioTower className="h-5 w-5 text-slate-700" />
            <p className="font-semibold text-slate-950">{HAZARD_LABELS[assessment.primaryCategory]}</p>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Population context: {region.population.toLocaleString()} people.
          </p>
          <a
            href={region.officialAdvisoryUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-950 hover:underline"
          >
            Official guidance
            <ExternalLink className="h-4 w-4" />
          </a>
        </aside>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <Signal label="NNDSS disease" value={assessment.nndssSignal} />
        <Signal label="Water contamination" value={assessment.waterSignal} />
        <Signal label="Algal bloom" value={assessment.bloomSignal} />
        <Signal label="Tick-borne" value={assessment.tickSignal} />
        <Signal label="NCD burden" value={assessment.ncdSignal} />
        <Signal label="Allergy" value={assessment.allergySignal} />
      </section>

      <div className="mt-6 grid gap-6">
        <BiologyCard assessment={assessment} />
        <HealthGuidanceCard level={assessment.riskLevel} />
      </div>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-950">Recent Field Reports</h2>
        </div>
        <div className="mt-4 divide-y divide-slate-200">
          {reports.length === 0 ? (
            <p className="text-sm text-slate-500">No reports for this region yet.</p>
          ) : (
            reports.map((report) => (
              <article key={report.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  {report.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {HAZARD_LABELS[tag]}
                    </span>
                  ))}
                  <span className="text-xs text-slate-500">
                    {report.verified ? "Verified" : "Needs verification"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-700">{report.description}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function Signal({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <p className="text-sm font-bold tabular-nums text-slate-950">{Math.round(value * 100)}%</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-slate-950" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
    </div>
  );
}
