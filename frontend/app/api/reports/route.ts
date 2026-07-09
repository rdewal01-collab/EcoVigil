import { NextResponse } from "next/server";
import { getReports } from "@/lib/data";

export function GET() {
  return NextResponse.json({
    reports: getReports(),
    count: getReports().length,
  });
}
