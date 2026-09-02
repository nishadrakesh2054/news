import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { dispatchNotification } from "@/lib/notification-dispatch";
import { writeAuditLog } from "@/lib/audit-log";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id } = await params;
    const notification = await prisma.notification.findUnique({ where: { id } });

    if (!notification) {
      return apiError("Notification not found", 404);
    }

    if (notification.status === "SENT") {
      return apiError("Notification already sent", 400);
    }

    const result = await dispatchNotification(id);

    await writeAuditLog({
      userId: auth.session!.user.id,
      action: "SEND",
      entity: "Notification",
      entityId: id,
      details: JSON.stringify(result),
    });

    const refreshed = await prisma.notification.findUnique({ where: { id } });
    return apiSuccess(refreshed, `Sent to ${result.pushDelivered} push / ${result.emailDelivered} email`);
  } catch (error) {
    return handleServerError(error, "Failed to send notification");
  }
}
