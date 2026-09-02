import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { id } = await params;
    const { title, content } = await request.json();

    const existing = await prisma.liveUpdate.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Live update not found", 404);
    }

    const updated = await prisma.liveUpdate.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(content !== undefined ? { content: String(content).trim() } : {}),
      },
    });

    await prisma.article.update({
      where: { id: existing.articleId },
      data: { updatedAt: new Date() },
    });

    return apiSuccess(updated, "Live update edited");
  } catch (error) {
    return handleServerError(error, "Failed to update live update");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.liveUpdate.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Live update not found", 404);
    }

    await prisma.liveUpdate.delete({ where: { id } });

    return apiSuccess({ id }, "Live update deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete live update");
  }
}
