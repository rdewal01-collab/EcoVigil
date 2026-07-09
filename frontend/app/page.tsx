import { DashboardWorkspace } from "@/components/DashboardWorkspace";
import { getNyLiveDashboard } from "@/lib/ny-live";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { regions, stats, highestRisk, sources } = await getNyLiveDashboard();

  return (
    <DashboardWorkspace
      regions={regions}
      highestRisk={highestRisk}
      stats={stats}
      sources={sources}
    />
  );
}
