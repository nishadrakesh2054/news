import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * Placeholder cron: authenticate with CRON_SECRET, then no-op until scheduled
 * publish is modeled in schema. Prevents empty-route 404s when Vercel Cron is wired.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || auth !== secret) {
    return apiError("Unauthorized", 401);
  }

  return apiSuccess({
    ok: true,
    job: "publish-scheduled",
    processed: 0,
    note: "No scheduledAt field yet — cron is authenticated and ready to extend.",
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
