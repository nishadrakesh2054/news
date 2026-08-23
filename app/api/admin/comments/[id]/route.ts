import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, CommentStatus } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Only Admin/Editor can moderate comments", 403);
    }

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
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Only Admin/Editor can delete comments", 403);
    }

    const { id } = await params;

    await prisma.comment.delete({
      where: { id },
    });

    return apiSuccess(null, "Comment deleted successfully");
  } catch (error) {
    return handleServerError(error, "Failed to delete comment");
  }
}
