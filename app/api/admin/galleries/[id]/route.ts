import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit-log";
import { invalidatePublicMedia } from "@/lib/cache-invalidation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id } = await params;

    const gallery = await prisma.gallery.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: "asc" },
          include: {
            media: {
              select: {
                id: true,
                filename: true,
                url: true,
                mimeType: true,
                altText: true,
                caption: true,
              },
            },
          },
        },
        _count: { select: { items: true } },
      },
    });

    if (!gallery) {
      return apiError("Gallery not found", 404);
    }

    return apiSuccess(gallery);
  } catch (error) {
    return handleServerError(error, "Failed to fetch gallery");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;
    const { id } = await params;
    const body = await request.json();

    const gallery = await prisma.gallery.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title } : {}),
        ...(body.titleNp !== undefined ? { titleNp: body.titleNp } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.coverUrl !== undefined ? { coverUrl: body.coverUrl } : {}),
        ...(body.isPublished !== undefined ? { isPublished: body.isPublished } : {}),
      },
      include: { items: { include: { media: true }, orderBy: { order: "asc" } } },
    });

    await writeAuditLog({ userId: auth.session!.user.id, action: "UPDATE", entity: "Gallery", entityId: id });
    invalidatePublicMedia();
    return apiSuccess(gallery);
  } catch (error) {
    return handleServerError(error, "Failed to update gallery");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;
    const { id } = await params;

    await prisma.gallery.delete({ where: { id } });
    await writeAuditLog({ userId: auth.session!.user.id, action: "DELETE", entity: "Gallery", entityId: id });
    invalidatePublicMedia();
    return apiSuccess(null, "Gallery deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete gallery");
  }
}
