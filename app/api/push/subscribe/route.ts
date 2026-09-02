import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`push-sub:${ip}`, 10, 60 * 60 * 1000);
    if (!rate.allowed) {
      return apiError("Too many subscription attempts", 429);
    }

    const body = await request.json();
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
    const keys = body.keys as { p256dh?: string; auth?: string } | undefined;
    const breakingOnly = body.breakingOnly !== false;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return apiError("Invalid push subscription", 400);
    }

    const userAgent = request.headers.get("user-agent") ?? undefined;

    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
        breakingOnly,
        isActive: true,
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent,
        breakingOnly,
        isActive: true,
      },
    });

    return apiSuccess({ id: subscription.id }, "Push subscription saved", 201);
  } catch (error) {
    return handleServerError(error, "Failed to save push subscription");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
    if (!endpoint) {
      return apiError("endpoint is required", 400);
    }

    await prisma.pushSubscription.updateMany({
      where: { endpoint },
      data: { isActive: false },
    });

    return apiSuccess(null, "Push subscription removed");
  } catch (error) {
    return handleServerError(error, "Failed to remove push subscription");
  }
}
