import { NextResponse } from "next/server";
import { listRuns, GARAK_RUNS_DIR } from "@/lib/parser";

export async function GET() {
  try {
    const runs = listRuns();
    return NextResponse.json({ runs, runsDir: GARAK_RUNS_DIR });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read garak runs", details: String(error) },
      { status: 500 }
    );
  }
}
