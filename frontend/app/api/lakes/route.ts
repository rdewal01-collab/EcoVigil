import { NextResponse } from "next/server";
import { getAllRegionsWithAssessments, getDashboardStats } from "@/lib/data";

export function GET() {
  const regions = getAllRegionsWithAssessments();

  return NextResponse.json({
    regions,
    count: regions.length,
    stats: getDashboardStats(),
  });
}
