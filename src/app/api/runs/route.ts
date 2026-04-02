import { NextResponse } from "next/server";
import { listRuns } from "@/lib/parser";

export async function GET() {
  try {
    const runs = listRuns();
    return NextResponse.json(runs);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read garak runs", details: String(error) },
      { status: 500 }
    );
  }
}
