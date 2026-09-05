import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { slugify } from "@/lib/slug";
import { writeAuditLog } from "@/lib/audit-log";
import { invalidatePublicMedia } from "@/lib/cache-invalidation";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50));
    const skip = (page - 1) * limit;

    const [galleries, total] = await Promise.all([
      prisma.gallery.findMany({
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          description: true,
          coverUrl: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.gallery.count(),
    ]);
    return apiSuccess({ items: galleries, page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    return handleServerError(error, "Failed to fetch galleries");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { title, titleNp, slug, description, coverUrl, isPublished, mediaIds = [] } = await request.json();
    if (!title) return apiError("Title is required");

    const gallery = await prisma.gallery.create({
      data: {
        title: title.trim(),
        titleNp: titleNp?.trim() || null,
        slug: slugify(slug || title),
        description: description || null,
        coverUrl: coverUrl || null,
        isPublished: !!isPublished,
        items: {
          create: mediaIds.map((mediaId: string, index: number) => ({
            mediaId,
            order: index,
          })),
        },
      },
      include: { _count: { select: { items: true } } },
    });

    await writeAuditLog({ userId: auth.session!.user.id, action: "CREATE", entity: "Gallery", entityId: gallery.id });
    invalidatePublicMedia();
    return apiSuccess(gallery, "Gallery created", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create gallery");
  }
}
