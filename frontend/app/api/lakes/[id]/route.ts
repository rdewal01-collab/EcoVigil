import { NextResponse } from "next/server";
import { getRegionWithAssessment, getReportsForRegion } from "@/lib/data";

export function GET(_: Request, { params }: { params: { id: string } }) {
  const region = getRegionWithAssessment(params.id);

  if (!region) {
    return NextResponse.json({ error: "Region not found" }, { status: 404 });
  }

  return NextResponse.json({
    region,
    reports: getReportsForRegion(params.id),
  });
}
