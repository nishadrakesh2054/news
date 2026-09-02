import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit-log";

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { articleIds } = await request.json();

    if (!Array.isArray(articleIds) || articleIds.length === 0) {
      return apiError("articleIds array is required", 400);
    }

    await prisma.$transaction(
      articleIds.map((articleId: string, index: number) =>
        prisma.article.update({
          where: { id: articleId },
          data: {
            isFeatured: true,
            featuredOrder: index + 1,
          },
        })
      )
    );

    await writeAuditLog({
      userId: auth.session!.user.id,
      action: "UPDATE",
      entity: "Featured",
      details: `Reordered ${articleIds.length} featured articles`,
    });

    return apiSuccess({ count: articleIds.length }, "Featured order saved");
  } catch (error) {
    return handleServerError(error, "Failed to reorder featured articles");
  }
}
