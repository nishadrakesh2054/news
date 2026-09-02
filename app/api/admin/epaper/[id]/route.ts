import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.ePaper.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Edition not found", 404);
    }

    const epaper = await prisma.ePaper.update({
      where: { id },
      data: {
        ...(body.title !== undefined ? { title: body.title.trim() } : {}),
        ...(body.pdfUrl !== undefined ? { pdfUrl: body.pdfUrl.trim() } : {}),
        ...(body.coverImage !== undefined ? { coverImage: body.coverImage?.trim() || null } : {}),
        ...(body.publishDate !== undefined ? { publishDate: new Date(body.publishDate) } : {}),
      },
    });

    return apiSuccess(epaper, "Edition updated");
  } catch (error) {
    return handleServerError(error, "Failed to update edition");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.ePaper.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Edition not found", 404);
    }

    await prisma.ePaper.delete({ where: { id } });

    return apiSuccess(null, "Edition deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete edition");
  }
}
