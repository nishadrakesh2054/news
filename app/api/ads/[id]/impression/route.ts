import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recordAdImpression } from "@/lib/analytics-events";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const path = typeof body.path === "string" ? body.path : undefined;

    const ad = await prisma.ad.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });

    if (!ad || !ad.isActive) {
      return apiError("Ad not found", 404);
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(`ad-impression:${ip}:${id}`, 1, 60 * 60 * 1000);
    if (!rate.allowed) {
      return apiSuccess({ tracked: false }, "Impression already counted recently");
    }

    const userAgent = request.headers.get("user-agent") ?? undefined;
    await recordAdImpression({ adId: id, path, userAgent });

    return apiSuccess({ tracked: true }, "Impression recorded");
  } catch (error) {
    return handleServerError(error, "Failed to record impression");
  }
}
