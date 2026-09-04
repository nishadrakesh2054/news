import { NextRequest } from "next/server";
import { ArticleStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";
import { assertArticleStatusPermission } from "@/lib/article-permissions";
import { writeAuditLog } from "@/lib/audit-log";
import { invalidatePublicArticles } from "@/lib/cache-invalidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));

    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.PENDING,
    };

    if (auth.session!.user.role === Role.AUTHOR) {
      where.authorId = auth.session!.user.id;
    }

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          status: true,
          scheduledAt: true,
          createdAt: true,
          author: { select: { name: true, email: true } },
          category: { select: { name: true, nameNp: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return apiSuccess(
      {
        articles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit) || 1),
        },
      },
      "Review queue fetched successfully"
    );
  } catch (error) {
    return handleServerError(error, "Failed to load review queue");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;
    const session = auth.session!;

    const body = (await request.json()) as { id?: string; action?: string };
    const id = typeof body.id === "string" ? body.id.trim() : "";
    const action = body.action === "approve" || body.action === "reject" ? body.action : null;

    if (!id || !action) {
      return apiError("id and action (approve|reject) are required", 400);
    }

    const nextStatus = action === "approve" ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT;
    const statusDenied = assertArticleStatusPermission(session.user.role, nextStatus);
    if (statusDenied) return statusDenied;

    const existing = await prisma.article.findUnique({
      where: { id },
      select: { id: true, authorId: true, status: true, title: true },
    });

    if (!existing) {
      return apiError("Article not found", 404);
    }

    if (session.user.role === Role.AUTHOR && existing.authorId !== session.user.id) {
      return apiError("Unauthorized: You can only review your own articles", 403);
    }

    if (existing.status !== ArticleStatus.PENDING) {
      return apiError("Only pending articles can be reviewed", 400);
    }

    const updated = await prisma.article.update({
      where: { id },
      data:
        action === "approve"
          ? {
              status: ArticleStatus.PUBLISHED,
              scheduledAt: null,
              publishedAt: new Date(),
            }
          : {
              status: ArticleStatus.DRAFT,
            },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        status: true,
        publishedAt: true,
        scheduledAt: true,
      },
    });

    await writeAuditLog({
      userId: session.user.id,
      action: action === "approve" ? "PUBLISH" : "UPDATE",
      entity: "Article",
      entityId: id,
      details: `${updated.status}: ${updated.title}`,
    });

    invalidatePublicArticles();

    return apiSuccess(updated, action === "approve" ? "Article published" : "Article sent back to draft");
  } catch (error) {
    return handleServerError(error, "Failed to review article");
  }
}
