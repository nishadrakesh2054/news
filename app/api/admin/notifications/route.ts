import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { NotificationStatus } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { validateNotificationCreate } from "@/lib/validations/notification";
import { writeAuditLog } from "@/lib/audit-log";
import { dispatchNotification } from "@/lib/notification-dispatch";

export async function GET() {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });
    return apiSuccess(notifications);
  } catch (error) {
    return handleServerError(error, "Failed to fetch notifications");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const body = await request.json();
    const validation = validateNotificationCreate(body);
    if (!validation.ok) {
      return apiError(validation.error, 400);
    }

    const data = validation.data;
    const status =
      data.scheduledAt && data.scheduledAt.getTime() > Date.now()
        ? NotificationStatus.SCHEDULED
        : data.status;

    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        titleNp: data.titleNp || null,
        body: data.body,
        type: data.type,
        status,
        linkUrl: data.linkUrl || null,
        scheduledAt: data.scheduledAt ?? null,
        sendPush: data.sendPush,
        sendEmail: data.sendEmail,
        sentAt: status === NotificationStatus.SENT ? new Date() : null,
      },
    });

    await writeAuditLog({
      userId: auth.session!.user.id,
      action: "CREATE",
      entity: "Notification",
      entityId: notification.id,
    });

    if (status === NotificationStatus.SENT) {
      await dispatchNotification(notification.id);
    }

    const refreshed = await prisma.notification.findUnique({ where: { id: notification.id } });
    return apiSuccess(refreshed, "Notification created", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create notification");
  }
}
