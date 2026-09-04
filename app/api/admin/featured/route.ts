import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit-log";
import { invalidatePublicArticles } from "@/lib/cache-invalidation";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50));
    const skip = (page - 1) * limit;

    const where = { isFeatured: true as const };
    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: [{ featuredOrder: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          status: true,
          featuredOrder: true,
          publishedAt: true,
          category: { select: { name: true } },
          author: { select: { name: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);
    return apiSuccess({ items: articles, page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
  } catch (error) {
    return handleServerError(error, "Failed to fetch featured articles");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { articleId, isFeatured, featuredOrder } = await request.json();
    if (!articleId) return apiError("articleId is required");

    let order = typeof featuredOrder === "number" ? featuredOrder : null;
    if (isFeatured !== false && order === null) {
      const maxOrder = await prisma.article.aggregate({
        where: { isFeatured: true },
        _max: { featuredOrder: true },
      });
      order = (maxOrder._max.featuredOrder ?? 0) + 1;
    }

    const article = await prisma.article.update({
      where: { id: articleId },
      data: {
        isFeatured: isFeatured ?? true,
        featuredOrder: isFeatured === false ? null : order,
      },
    });

    await writeAuditLog({
      userId: auth.session!.user.id,
      action: "UPDATE",
      entity: "Article",
      entityId: article.id,
      details: `Featured: ${article.isFeatured}`,
    });

    invalidatePublicArticles();

    return apiSuccess(article);
  } catch (error) {
    return handleServerError(error, "Failed to update featured article");
  }
}
