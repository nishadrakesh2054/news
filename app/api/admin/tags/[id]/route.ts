import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { slugify } from "@/lib/slug";
import { writeAuditLog } from "@/lib/audit-log";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;
    const { id } = await params;
    const { name, slug } = await request.json();

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(slug ? { slug: slugify(slug) } : {}),
      },
    });

    await writeAuditLog({ userId: auth.session!.user.id, action: "UPDATE", entity: "Tag", entityId: id });
    return apiSuccess(tag);
  } catch (error) {
    return handleServerError(error, "Failed to update tag");
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;
    const { id } = await params;

    await prisma.tag.delete({ where: { id } });
    await writeAuditLog({ userId: auth.session!.user.id, action: "DELETE", entity: "Tag", entityId: id });
    return apiSuccess(null, "Tag deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete tag");
  }
}
