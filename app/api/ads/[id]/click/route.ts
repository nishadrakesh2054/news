import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleServerError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recordAdClick } from "@/lib/analytics-events";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const path = request.nextUrl.searchParams.get("path") ?? undefined;

    const ad = await prisma.ad.findUnique({
      where: { id },
      select: { id: true, isActive: true, targetUrl: true },
    });

    if (!ad || !ad.isActive) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    const ip = getClientIp(request);
    const rate = checkRateLimit(`ad-click:${ip}:${id}`, 5, 60 * 1000);
    if (rate.allowed) {
      const userAgent = request.headers.get("user-agent") ?? undefined;
      await recordAdClick({ adId: id, path, userAgent });
    }

    const destination = ad.targetUrl?.trim() || "/";
    return NextResponse.redirect(destination);
  } catch (error) {
    return handleServerError(error, "Failed to track ad click");
  }
}
