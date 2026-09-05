import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";
import { validateArticleUpdate } from "@/lib/validations/article";
import { normalizeStatusForSchedule, resolvePublishedAt, isFutureScheduledDate } from "@/lib/article-scheduling";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import {
  assertArticleStatusPermission,
  assertBreakingPermission,
  assertFeaturedPermission,
  assertSchedulePermission,
} from "@/lib/article-permissions";
import { writeAuditLog } from "@/lib/audit-log";
import { invalidatePublicArticles } from "@/lib/cache-invalidation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { id } = await params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true, nameNp: true, slug: true },
        },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!article) {
      return apiError("Article not found", 404);
    }

    if (
      auth.session!.user.role === Role.AUTHOR &&
      article.authorId !== auth.session!.user.id
    ) {
      return apiError("Unauthorized: You can only view your own articles", 403);
    }

    return apiSuccess(article, "Article retrieved successfully");
  } catch (error) {
    return handleServerError(error, "Failed to retrieve article");
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;
    const session = auth.session!;

    const { id } = await params;
    const body = await request.json();
    const validation = validateArticleUpdate(body);
    if (!validation.ok) {
      return apiError(validation.error, 400);
    }

    const data = validation.data;

    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return apiError("Article not found", 404);
    }

    if (session.user.role === Role.AUTHOR && existingArticle.authorId !== session.user.id) {
      return apiError("Unauthorized: You can only edit your own articles", 403);
    }

    const newStatus = data.status ?? existingArticle.status;
    const statusDenied = assertArticleStatusPermission(session.user.role, newStatus);
    if (statusDenied) return statusDenied;

    const breakingValue = data.isBreaking ?? existingArticle.isBreaking;
    const breakingDenied = assertBreakingPermission(session.user.role, breakingValue);
    if (breakingDenied) return breakingDenied;

    const featuredValue = data.isFeatured ?? existingArticle.isFeatured;
    const featuredDenied = assertFeaturedPermission(session.user.role, featuredValue);
    if (featuredDenied) return featuredDenied;

    if (data.slug && data.slug !== existingArticle.slug) {
      const slugConflict = await prisma.article.findUnique({
        where: { slug: data.slug },
      });
      if (slugConflict) {
        return apiError("Another article already uses this slug", 400);
      }
    }

    if (data.tagIds) {
      const tagCount = await prisma.tag.count({
        where: { id: { in: data.tagIds } },
      });
      if (tagCount !== data.tagIds.length) {
        return apiError("One or more tags are invalid", 400);
      }
    }

    const scheduledAtInput =
      data.scheduledAt !== undefined ? data.scheduledAt : existingArticle.scheduledAt;

    // Explicit publish must not bounce back to PENDING because of a future schedule.
    const scheduledAt =
      data.status === ArticleStatus.PUBLISHED && isFutureScheduledDate(scheduledAtInput)
        ? null
        : scheduledAtInput;

    const scheduleDenied = assertSchedulePermission(
      session.user.role,
      scheduledAt,
      existingArticle.scheduledAt
    );
    if (scheduleDenied) return scheduleDenied;

    const normalizedStatus = normalizeStatusForSchedule(newStatus, scheduledAt);

    const publishedAt = resolvePublishedAt(
      normalizedStatus,
      scheduledAt,
      existingArticle.publishedAt
    );

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.titleNp !== undefined && { titleNp: data.titleNp }),
        ...(data.slug && { slug: data.slug }),
        ...(data.content && { content: sanitizeArticleHtml(data.content) }),
        ...(data.contentNp !== undefined && {
          contentNp: data.contentNp ? sanitizeArticleHtml(data.contentNp) : null,
        }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.excerptNp !== undefined && { excerptNp: data.excerptNp }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.caption !== undefined && { caption: data.caption }),
        status: normalizedStatus,
        ...(data.type && { type: data.type }),
        ...(data.languageEdition && { languageEdition: data.languageEdition }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isBreaking !== undefined && { isBreaking: data.isBreaking }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaTitleNp !== undefined && { metaTitleNp: data.metaTitleNp }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
        ...(data.metaDescriptionNp !== undefined && {
          metaDescriptionNp: data.metaDescriptionNp,
        }),
        ...(data.keywords !== undefined && { keywords: data.keywords }),
        ...(data.keywordsNp !== undefined && { keywordsNp: data.keywordsNp }),
        ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
        ...(data.province !== undefined && { province: data.province }),
        ...(data.district !== undefined && { district: data.district }),
        scheduledAt,
        ...(data.tagIds !== undefined && {
          tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
        }),
        publishedAt,
      },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        status: true,
        type: true,
        languageEdition: true,
        isFeatured: true,
        isBreaking: true,
        publishedAt: true,
        scheduledAt: true,
        updatedAt: true,
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

    const auditAction =
      normalizedStatus === ArticleStatus.PUBLISHED && existingArticle.status !== ArticleStatus.PUBLISHED
        ? "PUBLISH"
        : normalizedStatus === ArticleStatus.ARCHIVED && existingArticle.status !== ArticleStatus.ARCHIVED
          ? "ARCHIVE"
          : "UPDATE";

    await writeAuditLog({
      userId: session.user.id,
      action: auditAction,
      entity: "Article",
      entityId: id,
      details: `${normalizedStatus}: ${updatedArticle.title}`,
    });

    invalidatePublicArticles();

    return apiSuccess(updatedArticle, "Article updated successfully");
  } catch (error) {
    return handleServerError(error, "Failed to update article");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;
    const session = auth.session!;

    if (!([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Admins or Editors required to delete articles", 403);
    }

    const { id } = await params;

    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return apiError("Article not found", 404);
    }

    await prisma.article.delete({
      where: { id },
    });

    await writeAuditLog({
      userId: session.user.id,
      action: "DELETE",
      entity: "Article",
      entityId: id,
      details: existingArticle.title,
    });

    invalidatePublicArticles();

    return apiSuccess(null, "Article deleted successfully");
  } catch (error) {
    return handleServerError(error, "Failed to delete article");
  }
}
