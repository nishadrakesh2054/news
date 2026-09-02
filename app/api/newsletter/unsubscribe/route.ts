import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriberStatus } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return apiError("Token is required", 400);
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { unsubscribeToken: token },
    });

    if (!subscriber) {
      return apiError("Subscriber not found", 404);
    }

    if (subscriber.status === SubscriberStatus.UNSUBSCRIBED) {
      return apiSuccess({ unsubscribed: true }, "Already unsubscribed");
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: SubscriberStatus.UNSUBSCRIBED,
        unsubscribedAt: new Date(),
      },
    });

    return apiSuccess({ unsubscribed: true }, "Successfully unsubscribed");
  } catch (error) {
    return handleServerError(error, "Failed to unsubscribe");
  }
}
