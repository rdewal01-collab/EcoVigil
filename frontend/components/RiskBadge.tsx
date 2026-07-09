import type { RiskLevel } from "@/lib/types";
import { RISK_COLORS, RISK_LABELS } from "@/lib/risk";

export function RiskBadge({
  level,
  score,
  size = "md",
}: {
  level: RiskLevel;
  score?: number;
  size?: "sm" | "md";
}) {
  const compact = size === "sm";

  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full font-semibold",
        compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
      ].join(" ")}
      style={{ backgroundColor: `${RISK_COLORS[level]}18`, color: RISK_COLORS[level] }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS[level] }} />
      {RISK_LABELS[level]}
      {score !== undefined && (
        <span className="tabular-nums opacity-80">{Math.round(score * 100)}%</span>
      )}
    </span>
  );
}
