import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { slugify } from "@/lib/slug";
import { writeAuditLog } from "@/lib/audit-log";

export async function GET() {
  try {
    const galleries = await prisma.gallery.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
    });
    return apiSuccess(galleries);
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
    return apiSuccess(gallery, "Gallery created", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create gallery");
  }
}
