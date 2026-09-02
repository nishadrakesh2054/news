import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

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
        ...(body.body !== undefined ? { body: body.body } : {}),
        ...(body.status !== undefined ? { status: body.status, sentAt: body.status === "SENT" ? new Date() : null } : {}),
        ...(body.linkUrl !== undefined ? { linkUrl: body.linkUrl } : {}),
      },
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
    return apiSuccess(null, "Notification deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete notification");
  }
}
