"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { HAZARD_LABELS } from "@/lib/risk";
import type { HazardCategory } from "@/lib/types";

const hazards: HazardCategory[] = [
  "disease_outbreak",
  "water_contamination",
  "algal_bloom",
  "tick_borne",
  "ncd_signal",
  "allergy_signal",
];

export default function ReportPage() {
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-500">Field intake</p>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950">Submit a biohazard report</h1>
        </div>
      </div>

      {saved && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" />
          <div>
            <p className="font-semibold">Report draft saved</p>
            <p className="mt-1 leading-6">
              The intake is ready for verification review. No public alert is created until an authority confirms it.
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      >
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Region or address</span>
          <input className="h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200" />
        </label>
        <fieldset className="grid gap-3">
          <legend className="text-sm font-semibold text-slate-700">Observed hazard</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {hazards.map((hazard) => (
              <label key={hazard} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-700">
                <input type="checkbox" className="h-4 w-4 rounded border-slate-300" />
                {HAZARD_LABELS[hazard]}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Description</span>
          <textarea
            rows={6}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </label>
        <button type="submit" className="btn-primary justify-self-start">
          Save report draft
        </button>
      </form>
    </main>
  );
}
