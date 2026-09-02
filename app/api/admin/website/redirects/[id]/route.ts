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

    const redirect = await prisma.redirect.update({
      where: { id },
      data: {
        ...(body.fromPath !== undefined ? { fromPath: body.fromPath } : {}),
        ...(body.toPath !== undefined ? { toPath: body.toPath } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      },
    });
    return apiSuccess(redirect);
  } catch (error) {
    return handleServerError(error, "Failed to update redirect");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;
    const { id } = await params;
    await prisma.redirect.delete({ where: { id } });
    return apiSuccess(null, "Redirect deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete redirect");
  }
}
