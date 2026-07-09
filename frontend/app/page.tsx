import {
  getAllRegionsWithAssessments,
  getDashboardStats,
  getHighestRiskRegions,
} from "@/lib/data";
import { DashboardWorkspace } from "@/components/DashboardWorkspace";

export default function HomePage() {
  const regions = getAllRegionsWithAssessments();
  const stats = getDashboardStats();
  const highestRisk = getHighestRiskRegions(4);

  return <DashboardWorkspace regions={regions} highestRisk={highestRisk} stats={stats} />;
}
