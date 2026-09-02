import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { CommentStatus } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { ids, status } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return apiError("ids array is required", 400);
    }

    if (!status || !Object.values(CommentStatus).includes(status)) {
      return apiError("Valid status required", 400);
    }

    const result = await prisma.comment.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    return apiSuccess({ updated: result.count }, `${result.count} comments updated`);
  } catch (error) {
    return handleServerError(error, "Failed to bulk update comments");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return apiError("ids array is required", 400);
    }

    const result = await prisma.comment.deleteMany({
      where: { id: { in: ids } },
    });

    return apiSuccess({ deleted: result.count }, `${result.count} comments deleted`);
  } catch (error) {
    return handleServerError(error, "Failed to bulk delete comments");
  }
}
