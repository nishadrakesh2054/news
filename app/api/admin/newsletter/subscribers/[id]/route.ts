import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriberStatus } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id } = await params;
    const { status } = await request.json();

    if (!status || !Object.values(SubscriberStatus).includes(status)) {
      return apiError("Valid status required", 400);
    }

    const subscriber = await prisma.newsletterSubscriber.update({
      where: { id },
      data: {
        status,
        unsubscribedAt: status === SubscriberStatus.UNSUBSCRIBED ? new Date() : null,
      },
    });

    return apiSuccess(subscriber);
  } catch (error) {
    return handleServerError(error, "Failed to update subscriber");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id } = await params;
    await prisma.newsletterSubscriber.delete({ where: { id } });
    return apiSuccess(null, "Subscriber deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete subscriber");
  }
}
