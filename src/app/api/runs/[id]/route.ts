import { NextResponse } from "next/server";
import { getRunDetail } from "@/lib/parser";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const detail = getRunDetail(id);
    if (!detail) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read run detail", details: String(error) },
      { status: 500 }
    );
  }
}
