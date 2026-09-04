import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleServerError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { recordAdClick } from "@/lib/analytics-events";

function safeRedirectDestination(target: string | null | undefined, requestUrl: string): string {
  const fallback = new URL("/", requestUrl).toString();
  const raw = target?.trim();
  if (!raw) return fallback;

  if (raw.startsWith("/") && !raw.startsWith("//")) {
    return new URL(raw, requestUrl).toString();
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    // fall through
  }
  return fallback;
}

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

    return NextResponse.redirect(safeRedirectDestination(ad.targetUrl, request.url));
  } catch (error) {
    return handleServerError(error, "Failed to track ad click");
  }
}
