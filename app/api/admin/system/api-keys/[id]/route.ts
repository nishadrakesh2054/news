import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin-auth";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { id } = await params;
    const { isActive } = await request.json();

    const key = await prisma.apiKey.update({
      where: { id },
      data: { isActive: !!isActive },
    });
    return apiSuccess(key);
  } catch (error) {
    return handleServerError(error, "Failed to update API key");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;
    const { id } = await params;
    await prisma.apiKey.delete({ where: { id } });
    return apiSuccess(null, "API key deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete API key");
  }
}
