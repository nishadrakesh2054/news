import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { slugify } from "@/lib/slug";
import { writeAuditLog } from "@/lib/audit-log";
import { invalidatePublicTags } from "@/lib/cache-invalidation";

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: "asc" },
    });
    return apiSuccess(tags);
  } catch (error) {
    return handleServerError(error, "Failed to fetch tags");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { name, nameNp, slug } = await request.json();
    if (!name) return apiError("Tag name is required");

    const finalSlug = slugify(slug || name);
    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        nameNp: typeof nameNp === "string" && nameNp.trim() ? nameNp.trim() : null,
        slug: finalSlug,
      },
    });

    await writeAuditLog({
      userId: auth.session!.user.id,
      action: "CREATE",
      entity: "Tag",
      entityId: tag.id,
      details: tag.name,
    });

    invalidatePublicTags();

    return apiSuccess(tag, "Tag created", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create tag");
  }
}
