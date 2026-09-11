import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CommentStatus } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requirePermission } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("comments.moderate");
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !Object.values(CommentStatus).includes(status)) {
      return apiError("Valid status required (PENDING, APPROVED, REJECTED, SPAM)", 400);
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { status },
    });

    return apiSuccess(updated, "Comment status updated successfully");
  } catch (error) {
    return handleServerError(error, "Failed to update comment status");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("comments.moderate");
    if (auth.error) return auth.error;

    const { id } = await params;

    await prisma.comment.delete({
      where: { id },
    });

    return apiSuccess(null, "Comment deleted successfully");
  } catch (error) {
    return handleServerError(error, "Failed to delete comment");
  }
}
