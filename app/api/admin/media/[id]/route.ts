import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";
import cloudinary from "@/lib/cloudinary";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return apiError("Media asset not found", 404);
    }

    const updated = await prisma.media.update({
      where: { id },
      data: {
        altText: body.altText !== undefined ? body.altText : media.altText,
        caption: body.caption !== undefined ? body.caption : media.caption,
        folder: body.folder !== undefined ? body.folder : media.folder,
        filename: body.filename !== undefined ? body.filename : media.filename,
      },
    });

    return apiSuccess(updated, "Media details updated", 200);
  } catch (error) {
    return handleServerError(error, "Failed to update media details");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { id } = await params;

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      return apiError("Media asset not found", 404);
    }

    if (media.publicId) {
      try {
        const resourceType = media.mimeType.startsWith("video/") ? "video" : "image";
        await cloudinary.uploader.destroy(media.publicId, { resource_type: resourceType });
      } catch (err) {
        console.error("Cloudinary asset deletion error:", err);
      }
    }

    await prisma.media.delete({ where: { id } });

    return apiSuccess({ id }, "Media asset deleted successfully", 200);
  } catch (error) {
    return handleServerError(error, "Failed to delete media asset");
  }
}
