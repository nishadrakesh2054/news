import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;
    const { id } = await params;
    const body = await request.json();

    const menu = await prisma.menu.update({
      where: { id },
      data: {
        ...(body.label !== undefined ? { label: body.label } : {}),
      },
      include: { items: { orderBy: { order: "asc" } } },
    });
    return apiSuccess(menu);
  } catch (error) {
    return handleServerError(error, "Failed to update menu");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;
    const { id } = await params;
    await prisma.menu.delete({ where: { id } });
    return apiSuccess(null, "Menu deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete menu");
  }
}
