import type { ReactNode } from "react";
import { Building2, Stethoscope, Users } from "lucide-react";
import type { RiskLevel } from "@/lib/types";
import { getPublicGuidance } from "@/lib/risk";

export function HealthGuidanceCard({ level }: { level: RiskLevel }) {
  const guidance = getPublicGuidance(level);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Operational Guidance</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <GuidanceItem icon={<Users className="h-4 w-4" />} title="Residents" text={guidance.residents} />
        <GuidanceItem
          icon={<Stethoscope className="h-4 w-4" />}
          title="Clinicians"
          text={guidance.clinicians}
        />
        <GuidanceItem
          icon={<Building2 className="h-4 w-4" />}
          title="Authorities"
          text={guidance.authorities}
        />
      </div>
    </section>
  );
}

function GuidanceItem({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 font-semibold text-slate-950">
        {icon}
        {title}
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
