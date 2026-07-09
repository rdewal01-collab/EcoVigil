"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bug,
  Droplets,
  FilterX,
  HeartPulse,
  Search,
  ShieldCheck,
  Siren,
  SlidersHorizontal,
  ThermometerSun,
  Users,
  Waves,
} from "lucide-react";
import type { HazardCategory, RegionWithAssessment, RiskLevel } from "@/lib/types";
import { HAZARD_LABELS } from "@/lib/risk";
import { LakeList } from "@/components/LakeList";
import { MapView } from "@/components/MapView";
import { RiskBadge } from "@/components/RiskBadge";
import { EnvVariablesPanel } from "@/components/EnvVariablesPanel";

type DashboardStats = {
  monitored: number;
  elevatedCount: number;
  lowCount: number;
  reportCount: number;
  highConfidencePercent?: number;
};

type SortMode = "risk" | "name" | "recent" | "confidence";

const riskOptions: Array<{ value: "all" | RiskLevel; label: string }> = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "moderate", label: "Moderate" },
  { value: "low", label: "Low" },
];

const hazardOptions: Array<{ value: "all" | HazardCategory; label: string }> = [
  { value: "all", label: "All hazards" },
  { value: "disease_outbreak", label: "Disease" },
  { value: "water_contamination", label: "Water" },
  { value: "algal_bloom", label: "Algal bloom" },
  { value: "tick_borne", label: "Ticks" },
  { value: "ncd_signal", label: "NCD" },
  { value: "allergy_signal", label: "Allergy" },
];

const confidenceRank = { high: 3, medium: 2, low: 1 };

export function DashboardWorkspace({
  regions,
  highestRisk,
  stats,
}: {
  regions: RegionWithAssessment[];
  highestRisk: RegionWithAssessment[];
  stats: DashboardStats;
}) {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | RiskLevel>("all");
  const [hazardFilter, setHazardFilter] = useState<"all" | HazardCategory>("all");
  const [sortMode, setSortMode] = useState<SortMode>("risk");

  const riskCounts = useMemo(() => {
    return regions.reduce<Record<"all" | RiskLevel, number>>(
      (counts, region) => {
        counts.all += 1;
        counts[region.assessment.riskLevel] += 1;
        return counts;
      },
      { all: 0, low: 0, moderate: 0, high: 0, critical: 0, unknown: 0 }
    );
  }, [regions]);

  const filteredRegions = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return regions
      .filter((region) => {
        const matchesQuery =
          normalized.length === 0 ||
          region.name.toLowerCase().includes(normalized) ||
          region.jurisdiction.toLowerCase().includes(normalized);
        const matchesRisk = riskFilter === "all" || region.assessment.riskLevel === riskFilter;
        const matchesHazard =
          hazardFilter === "all" || region.assessment.activeSignals.includes(hazardFilter);

        return matchesQuery && matchesRisk && matchesHazard;
      })
      .sort((a, b) => {
        if (sortMode === "name") return a.name.localeCompare(b.name);
        if (sortMode === "recent") {
          return (
            new Date(b.assessment.observedDate).getTime() -
            new Date(a.assessment.observedDate).getTime()
          );
        }
        if (sortMode === "confidence") {
          return confidenceRank[b.assessment.confidence] - confidenceRank[a.assessment.confidence];
        }
        return b.assessment.riskScore - a.assessment.riskScore;
      });
  }, [hazardFilter, query, regions, riskFilter, sortMode]);

  const hasFilters = query.trim().length > 0 || riskFilter !== "all" || hazardFilter !== "all";
  const topRegion = highestRisk[0];

  return (
    <main className="mx-auto max-w-7xl overflow-hidden px-4 py-6 sm:px-6 lg:py-8">
      <section className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-600">Biohazard mapping workspace</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
            VigiReal maps outbreak, water, bloom, tick, NCD, and allergy risk in one operational view.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            VigiReal combines disease surveillance, environmental exposure signals, field reports, and
            vulnerability layers into a multi-source public-health surveillance console. CDC NNDSS is treated
            as the priority disease dataset; NCD and allergy feeds act as planning and burden layers.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="#risk-map" className="btn-primary">
              <Siren className="h-4 w-4" />
              Open map
            </a>
            <Link href="/report" className="btn-secondary">
              <Users className="h-4 w-4" />
              Add field report
            </Link>
          </div>
        </div>

        <aside className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Highest priority</p>
          {topRegion && (
            <Link
              href={`/region/${topRegion.id}`}
              className="mt-4 block rounded-lg border border-red-200 bg-red-50 p-4 transition hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-950">{topRegion.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{topRegion.jurisdiction}</p>
                </div>
                <RiskBadge
                  level={topRegion.assessment.riskLevel}
                  score={topRegion.assessment.riskScore}
                  size="sm"
                />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                Primary layer: {HAZARD_LABELS[topRegion.assessment.primaryCategory]}.
              </p>
            </Link>
          )}
          <div className="mt-4 divide-y divide-slate-200">
            {highestRisk.slice(1, 4).map((region) => (
              <Link
                key={region.id}
                href={`/region/${region.id}`}
                className="flex items-center justify-between gap-3 py-3 transition hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{region.name}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {HAZARD_LABELS[region.assessment.primaryCategory]}
                  </p>
                </div>
                <span className="text-sm font-bold tabular-nums text-slate-950">
                  {Math.round(region.assessment.riskScore * 100)}%
                </span>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-6 grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-4">
        <Metric
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Elevated regions"
          value={String(stats.elevatedCount)}
          detail="High or critical"
        />
        <Metric
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Monitored regions"
          value={String(stats.monitored)}
          detail="With current assessments"
        />
        <Metric
          icon={<Users className="h-4 w-4" />}
          label="Field reports"
          value={String(stats.reportCount)}
          detail="Community and staff signals"
        />
        <Metric
          icon={<SlidersHorizontal className="h-4 w-4" />}
          label="High confidence"
          value={`${stats.highConfidencePercent ?? 0}%`}
          detail="Assessment coverage"
        />
      </section>

      <section id="risk-map" className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
        <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Live workspace</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Risk Map</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredRegions.length} of {regions.length} regions shown.
            </p>
          </div>
          <Controls
            query={query}
            setQuery={setQuery}
            riskFilter={riskFilter}
            setRiskFilter={setRiskFilter}
            hazardFilter={hazardFilter}
            setHazardFilter={setHazardFilter}
            sortMode={sortMode}
            setSortMode={setSortMode}
            riskCounts={riskCounts}
            clearFilters={() => {
              setQuery("");
              setRiskFilter("all");
              setHazardFilter("all");
            }}
            hasFilters={hasFilters}
          />
        </div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
          <MapView regions={filteredRegions} height="640px" />
          <aside className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-start justify-between gap-3 px-1">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Region Queue</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Sorted by {sortLabel(sortMode).toLowerCase()}.
                </p>
              </div>
            </div>
            <div className="min-h-0 overflow-auto rounded-lg bg-white">
              <LakeList regions={filteredRegions} />
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <HazardLayer icon={<Siren />} title="Outbreaks" text="NNDSS and syndrome anomaly tracking." />
        <HazardLayer icon={<Droplets />} title="Water" text="Drinking and recreational contamination." />
        <HazardLayer icon={<Waves />} title="Algal blooms" text="Satellite context plus field observations." />
        <HazardLayer icon={<Bug />} title="Ticks" text="Vector, habitat, climate, and case signals." />
        <HazardLayer icon={<HeartPulse />} title="NCD burden" text="Chronic disease as vulnerability context." />
        <HazardLayer icon={<ThermometerSun />} title="Allergies" text="Pollen, air quality, and complaint patterns." />
      </section>

      <section className="mt-6">
        <EnvVariablesPanel />
      </section>
    </main>
  );
}

function Controls({
  query,
  setQuery,
  riskFilter,
  setRiskFilter,
  hazardFilter,
  setHazardFilter,
  sortMode,
  setSortMode,
  riskCounts,
  clearFilters,
  hasFilters,
}: {
  query: string;
  setQuery: (query: string) => void;
  riskFilter: "all" | RiskLevel;
  setRiskFilter: (risk: "all" | RiskLevel) => void;
  hazardFilter: "all" | HazardCategory;
  setHazardFilter: (hazard: "all" | HazardCategory) => void;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  riskCounts: Record<"all" | RiskLevel, number>;
  clearFilters: () => void;
  hasFilters: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 xl:items-end">
      <label className="relative block w-full xl:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search region or jurisdiction"
          className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {riskOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setRiskFilter(option.value)}
            className={[
              "rounded-lg border px-3 py-2 text-sm font-semibold transition",
              riskFilter === option.value
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400",
            ].join(" ")}
          >
            {option.label} {riskCounts[option.value] ?? ""}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {hazardOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setHazardFilter(option.value)}
            className={[
              "rounded-lg border px-3 py-2 text-sm font-semibold transition",
              hazardFilter === option.value
                ? "border-emerald-900 bg-emerald-900 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={sortMode}
          onChange={(event) => setSortMode(event.target.value as SortMode)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        >
          <option value="risk">Sort by risk</option>
          <option value="recent">Sort by recency</option>
          <option value="confidence">Sort by confidence</option>
          <option value="name">Sort by name</option>
        </select>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
          >
            <FilterX className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="border-slate-200 p-4 odd:border-r lg:border-r lg:last:border-r-0">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-3xl font-bold tracking-normal text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function HazardLayer({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function sortLabel(mode: SortMode) {
  if (mode === "recent") return "recency";
  if (mode === "confidence") return "confidence";
  if (mode === "name") return "name";
  return "risk";
}
