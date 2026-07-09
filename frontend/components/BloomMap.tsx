"use client";

import Link from "next/link";
import L from "leaflet";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import type { RegionWithAssessment, RiskLevel } from "@/lib/types";
import { HAZARD_LABELS, RISK_COLORS, RISK_LABELS } from "@/lib/risk";
import { RiskBadge } from "./RiskBadge";

const defaultCenter: [number, number] = [42.35, -75.4];

export function HazardMap({
  regions,
  center = defaultCenter,
  zoom = 6,
  height = "560px",
}: {
  regions: RegionWithAssessment[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className="w-full"
      style={{ height }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {regions.map((region) => {
        const color = RISK_COLORS[region.assessment.riskLevel];
        const radius = 12 + Math.round(region.assessment.riskScore * 18);

        return (
          <CircleMarker
            key={region.id}
            center={[region.lat, region.lon]}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.3, weight: 2 }}
            radius={radius}
            eventHandlers={{
              mouseover: (event) => event.target.openPopup(),
            }}
          >
            <Popup>
              <div className="min-w-56 space-y-2">
                <div>
                  <p className="font-semibold text-slate-950">{region.name}</p>
                  <p className="text-xs text-slate-500">{region.jurisdiction}</p>
                </div>
                <RiskBadge
                  level={region.assessment.riskLevel}
                  score={region.assessment.riskScore}
                  size="sm"
                />
                <p className="text-xs text-slate-600">
                  Primary: {HAZARD_LABELS[region.assessment.primaryCategory]}
                </p>
                <Link
                  href={`/region/${region.id}`}
                  className="inline-flex rounded-md bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Open region
                </Link>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}

export function MapLegend() {
  const levels: RiskLevel[] = ["low", "moderate", "high", "critical", "unknown"];

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
      {levels.map((level) => (
        <span key={level} className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: RISK_COLORS[level] }}
          />
          {RISK_LABELS[level]}
        </span>
      ))}
    </div>
  );
}

delete (L.Icon.Default.prototype as L.Icon.Default & { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
