import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { invalidatePublicMedia } from "@/lib/cache-invalidation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id: galleryId } = await params;
    const { mediaId, caption } = await request.json();

    if (!mediaId) {
      return apiError("mediaId is required", 400);
    }

    const gallery = await prisma.gallery.findUnique({ where: { id: galleryId } });
    if (!gallery) {
      return apiError("Gallery not found", 404);
    }

    const media = await prisma.media.findUnique({ where: { id: mediaId } });
    if (!media) {
      return apiError("Media not found", 404);
    }

    const maxOrder = await prisma.galleryItem.aggregate({
      where: { galleryId },
      _max: { order: true },
    });

    const item = await prisma.galleryItem.create({
      data: {
        galleryId,
        mediaId,
        caption: caption?.trim() || null,
        order: (maxOrder._max.order ?? -1) + 1,
      },
      include: { media: true },
    });

    if (!gallery.coverUrl && media.url) {
      await prisma.gallery.update({
        where: { id: galleryId },
        data: { coverUrl: media.url },
      });
    }

    invalidatePublicMedia();
    return apiSuccess(item, "Photo added to gallery", 201);
  } catch (error) {
    return handleServerError(error, "Failed to add gallery item");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id: galleryId } = await params;
    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return apiError("items array is required", 400);
    }

    await prisma.$transaction(
      items.map((item: { id: string; order: number; caption?: string | null }, index: number) =>
        prisma.galleryItem.updateMany({
          where: { id: item.id, galleryId },
          data: {
            order: item.order ?? index,
            ...(item.caption !== undefined ? { caption: item.caption } : {}),
          },
        })
      )
    );

    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: { media: true },
        },
      },
    });

    invalidatePublicMedia();
    return apiSuccess(gallery, "Gallery items reordered");
  } catch (error) {
    return handleServerError(error, "Failed to reorder gallery items");
  }
}
