"use client";

import dynamic from "next/dynamic";
import type { RegionWithAssessment } from "@/lib/types";

const HazardMapInner = dynamic(() => import("./BloomMap").then((module) => module.HazardMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500">
      Loading map...
    </div>
  ),
});

const MapLegendInner = dynamic(() => import("./BloomMap").then((module) => module.MapLegend), {
  ssr: false,
});

export function MapView({
  regions,
  center,
  zoom,
  height,
}: {
  regions: RegionWithAssessment[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}) {
  return (
    <div className="space-y-3">
      <HazardMapInner regions={regions} center={center} zoom={zoom} height={height} />
      <MapLegendInner />
    </div>
  );
}
