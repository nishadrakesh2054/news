import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id: galleryId, itemId } = await params;
    const { caption } = await request.json();

    const item = await prisma.galleryItem.findFirst({
      where: { id: itemId, galleryId },
    });

    if (!item) {
      return apiError("Gallery item not found", 404);
    }

    const updated = await prisma.galleryItem.update({
      where: { id: itemId },
      data: { caption: caption?.trim() || null },
      include: { media: true },
    });

    return apiSuccess(updated, "Caption updated");
  } catch (error) {
    return handleServerError(error, "Failed to update gallery item");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id: galleryId, itemId } = await params;

    const item = await prisma.galleryItem.findFirst({
      where: { id: itemId, galleryId },
    });

    if (!item) {
      return apiError("Gallery item not found", 404);
    }

    await prisma.galleryItem.delete({ where: { id: itemId } });

    return apiSuccess({ id: itemId }, "Photo removed from gallery");
  } catch (error) {
    return handleServerError(error, "Failed to delete gallery item");
  }
}
