import { DatabaseZap } from "lucide-react";
import { getDataSourcePlan } from "@/lib/data";

export function EnvVariablesPanel() {
  const sources = getDataSourcePlan();

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <DatabaseZap className="h-5 w-5 text-slate-700" />
        <h2 className="text-lg font-semibold text-slate-950">Dataset Roadmap</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {sources.map((source) => (
          <div key={source.name} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="font-semibold text-slate-950">{source.name}</p>
              <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                {source.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{source.purpose}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
