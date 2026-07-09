# VigiReal

Real-time biohazard intelligence map for disease outbreaks, contaminated water, algal blooms, tick-borne illness, NCD burden, and allergy signals.

VigiReal is a decision-support prototype. It prioritizes situational awareness, triage, and verification workflows; official public-health advisories remain the source of truth.

## App

```bash
npm install
npm run dev
```

The Next.js app source lives in `frontend/`. Root-level npm scripts delegate there so Vercel and local commands can run from the repository root.

## Current Scope

- Regional risk map with critical, high, moderate, low, and unknown status.
- Hazard layers for disease outbreaks, contaminated water, algal blooms, tick-borne illness, NCD signals, and allergy signals.
- Dataset roadmap with CDC NNDSS as the priority disease surveillance integration.
- Region detail pages with signal breakdowns, field reports, and operational guidance.
- Field report intake screen for staff or community observations.

## Data Direction

Initial seed data is local JSON under `frontend/public/data`. Production connectors should be added for:

- CDC NNDSS-compatible notifiable disease surveillance.
- State and local water quality advisories.
- Harmful algal bloom and satellite context feeds.
- Tick/vector surveillance and habitat data.
- NCD, allergy, pollen, air quality, and vulnerability datasets.
