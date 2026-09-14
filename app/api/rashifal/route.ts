import { NextResponse } from "next/server";
import { loadRashifalList } from "@/lib/rashifal-server";

export const revalidate = 300;

export async function GET() {
  const list = await loadRashifalList();
  return NextResponse.json(
    {
      success: true,
      data: {
        rashifal: list,
        periods: ["today", "weekly", "monthly", "yearly"],
      },
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
