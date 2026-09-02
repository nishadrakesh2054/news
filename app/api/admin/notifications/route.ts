import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit-log";

export async function GET() {
  try {
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

    const { title, titleNp, body, type, status, linkUrl } = await request.json();
    if (!title || !body) return apiError("Title and body are required");

    const notification = await prisma.notification.create({
      data: {
        title: title.trim(),
        titleNp: titleNp?.trim() || null,
        body,
        type: type || "SYSTEM",
        status: status || "DRAFT",
        linkUrl: linkUrl || null,
        sentAt: status === "SENT" ? new Date() : null,
      },
    });

    await writeAuditLog({ userId: auth.session!.user.id, action: "CREATE", entity: "Notification", entityId: notification.id });
    return apiSuccess(notification, "Notification created", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create notification");
  }
}
