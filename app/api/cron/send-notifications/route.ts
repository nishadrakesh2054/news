import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/lib/api-response";

/**
 * Placeholder cron for notification dispatch. Authenticated; implement send queue later.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || auth !== secret) {
    return apiError("Unauthorized", 401);
  }

  return apiSuccess({
    ok: true,
    job: "send-notifications",
    processed: 0,
    note: "Authenticated stub — wire notification-dispatch when queue is ready.",
  });
}

export async function POST(request: NextRequest) {
  return GET(request);
}
