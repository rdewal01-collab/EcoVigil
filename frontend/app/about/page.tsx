import { EnvVariablesPanel } from "@/components/EnvVariablesPanel";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <p className="text-sm font-semibold text-slate-500">About VigiReal</p>
      <h1 className="mt-2 text-4xl font-bold tracking-normal text-slate-950">
        A real-time biohazard map for public-health situational awareness.
      </h1>
      <div className="mt-5 space-y-4 text-base leading-7 text-slate-600">
        <p>
          VigiReal tracks disease outbreaks, contaminated water, algal blooms, tick-borne illness,
          non-communicable disease burden, and allergy signals across geographic regions.
        </p>
        <p>
          The app is designed as a decision-support layer. It should help teams decide what to verify next,
          where to sample, and where to issue targeted guidance after official confirmation.
        </p>
      </div>
      <div className="mt-8">
        <EnvVariablesPanel />
      </div>
    </main>
  );
}
