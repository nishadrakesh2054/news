import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";
import { sanitizeLiveUpdateHtml } from "@/lib/sanitize-html";

async function assertLiveUpdateAccess(
  session: { user: { id: string; role: Role } },
  articleId: string
) {
  if (session.user.role !== Role.AUTHOR) return null;
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { authorId: true },
  });
  if (!article || article.authorId !== session.user.id) {
    return apiError("Unauthorized: You can only manage your own live coverage", 403);
  }
  return null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;
    const session = auth.session!;

    const { id } = await params;
    const { title, content } = await request.json();

    const existing = await prisma.liveUpdate.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Live update not found", 404);
    }

    const denied = await assertLiveUpdateAccess(session, existing.articleId);
    if (denied) return denied;

    const updated = await prisma.liveUpdate.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(content !== undefined ? { content: sanitizeLiveUpdateHtml(String(content)) } : {}),
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
    const session = auth.session!;

    const { id } = await params;

    const existing = await prisma.liveUpdate.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Live update not found", 404);
    }

    const denied = await assertLiveUpdateAccess(session, existing.articleId);
    if (denied) return denied;

    await prisma.liveUpdate.delete({ where: { id } });

    return apiSuccess({ id }, "Live update deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete live update");
  }
}
