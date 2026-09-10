import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit-log";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;
    const { id } = await params;
    const body = await request.json();

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.titleNp !== undefined ? { titleNp: body.titleNp } : {}),
        ...(body.body !== undefined ? { body: body.body } : {}),
        ...(body.type !== undefined ? { type: body.type } : {}),
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.linkUrl !== undefined ? { linkUrl: body.linkUrl } : {}),
        ...(body.sendPush !== undefined ? { sendPush: Boolean(body.sendPush) } : {}),
        ...(body.sendEmail !== undefined ? { sendEmail: Boolean(body.sendEmail) } : {}),
      },
    });

    await writeAuditLog({
      userId: auth.session!.user.id,
      action: "UPDATE",
      entity: "Notification",
      entityId: notification.id,
    });

    return apiSuccess(notification);
  } catch (error) {
    return handleServerError(error, "Failed to update notification");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;
    const { id } = await params;
    await prisma.notification.delete({ where: { id } });

    await writeAuditLog({
      userId: auth.session!.user.id,
      action: "DELETE",
      entity: "Notification",
      entityId: id,
    });

    return apiSuccess(null, "Notification deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete notification");
  }
}
