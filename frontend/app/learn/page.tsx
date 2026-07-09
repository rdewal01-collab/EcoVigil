import { Bug, DatabaseZap, Droplets, HeartPulse, ShieldAlert, ThermometerSun, Waves } from "lucide-react";

const signals = [
  {
    icon: ShieldAlert,
    title: "Disease Outbreaks",
    text: "CDC NNDSS-compatible notifiable disease signals are the outbreak backbone. VigiReal treats them as official surveillance context, not raw diagnosis.",
  },
  {
    icon: Droplets,
    title: "Contaminated Water",
    text: "Water contamination combines advisories, sampling, sanitation context, weather events, and local reports.",
  },
  {
    icon: Waves,
    title: "Algal Blooms",
    text: "Remote sensing and field reports can flag bloom probability, but toxin confirmation needs official sampling.",
  },
  {
    icon: Bug,
    title: "Tick-borne Illness",
    text: "Tick risk blends case signals, vector habitat, humidity, temperature, land cover, and exposure reports.",
  },
  {
    icon: HeartPulse,
    title: "NCD Burden",
    text: "Non-communicable disease datasets are used as vulnerability layers for planning and triage, not as outbreak alerts.",
  },
  {
    icon: ThermometerSun,
    title: "Allergies",
    text: "Allergy signals combine pollen, air quality, respiratory complaints, and seasonal patterns.",
  },
];

export default function LearnPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <p className="text-sm font-semibold text-slate-500">Signal model</p>
      <h1 className="mt-2 text-4xl font-bold tracking-normal text-slate-950">
        VigiReal separates exposure evidence, clinical signals, and vulnerability context.
      </h1>
      <p className="mt-4 max-w-3xl leading-7 text-slate-600">
        The product direction is broader than a bloom detector: it is a map-first biohazard intelligence
        app that helps response teams see where multiple hazards are converging.
      </p>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {signals.map((signal) => {
          const Icon = signal.icon;
          return (
            <article key={signal.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Icon className="h-6 w-6 text-slate-700" />
              <h2 className="mt-4 text-lg font-semibold text-slate-950">{signal.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{signal.text}</p>
            </article>
          );
        })}
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <DatabaseZap className="h-5 w-5 text-slate-700" />
          <h2 className="text-lg font-semibold text-slate-950">Dataset Rules</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          NNDSS and agency feeds should drive official disease interpretation. Crowdsourced reports, satellite
          observations, NCD prevalence, and allergy indicators should be used as context until verified by the
          appropriate authority or lab workflow.
        </p>
      </section>
    </main>
  );
}
