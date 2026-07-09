import { NextResponse } from "next/server";
import { getNyLiveDashboard } from "@/lib/ny-live";

export const dynamic = "force-dynamic";

export async function GET() {
  const dashboard = await getNyLiveDashboard();

  return NextResponse.json(dashboard);
}
