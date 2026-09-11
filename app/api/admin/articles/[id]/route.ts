import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requirePermission } from "@/lib/admin-auth";
import { validateArticleUpdate } from "@/lib/validations/article";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import {
  assertArticleStatusPermission,
  assertBreakingPermission,
  assertFeaturedPermission,
  assertArticleOwnershipForDelete,
} from "@/lib/article-permissions";
import { writeAuditLog } from "@/lib/audit-log";
import { invalidatePublicArticles } from "@/lib/cache-invalidation";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("articles.read");
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
    const auth = await requirePermission("articles.update");
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
    const statusDenied = await assertArticleStatusPermission(session.user.role, newStatus);
    if (statusDenied) return statusDenied;

    const breakingValue = data.isBreaking ?? existingArticle.isBreaking;
    const breakingDenied = await assertBreakingPermission(session.user.role, breakingValue);
    if (breakingDenied) return breakingDenied;

    const featuredValue = data.isFeatured ?? existingArticle.isFeatured;
    const featuredDenied = await assertFeaturedPermission(session.user.role, featuredValue);
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

    const publishedAt =
      newStatus === ArticleStatus.PUBLISHED
        ? existingArticle.publishedAt ?? new Date()
        : null;

    const nextShowOnHome = data.showOnHome ?? existingArticle.showOnHome;
    let homeOrderUpdate: { homeOrder: number | null } | Record<string, never> = {};
    if (data.showOnHome !== undefined) {
      if (!nextShowOnHome) {
        homeOrderUpdate = { homeOrder: null };
      } else if (!existingArticle.showOnHome) {
        const maxOrder = await prisma.article.aggregate({
          where: { showOnHome: true },
          _max: { homeOrder: true },
        });
        homeOrderUpdate = { homeOrder: (maxOrder._max.homeOrder ?? 0) + 1 };
      }
    }

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
        status: newStatus,
        ...(data.type && { type: data.type }),
        ...(data.languageEdition && { languageEdition: data.languageEdition }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isBreaking !== undefined && { isBreaking: data.isBreaking }),
        ...(data.showOnHome !== undefined && { showOnHome: data.showOnHome }),
        ...(data.homeDisplay !== undefined && { homeDisplay: data.homeDisplay }),
        ...homeOrderUpdate,
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
        ...(data.auRegion !== undefined && { auRegion: data.auRegion }),
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
        showOnHome: true,
        homeDisplay: true,
        publishedAt: true,
        updatedAt: true,
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

    const auditAction =
      newStatus === ArticleStatus.PUBLISHED && existingArticle.status !== ArticleStatus.PUBLISHED
        ? "PUBLISH"
        : newStatus === ArticleStatus.ARCHIVED && existingArticle.status !== ArticleStatus.ARCHIVED
          ? "ARCHIVE"
          : "UPDATE";

    await writeAuditLog({
      userId: session.user.id,
      action: auditAction,
      entity: "Article",
      entityId: id,
      details: `${newStatus}: ${updatedArticle.title}`,
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
    const auth = await requirePermission("articles.delete");
    if (auth.error) return auth.error;
    const session = auth.session!;

    const { id } = await params;

    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return apiError("Article not found", 404);
    }

    const ownershipDenied = assertArticleOwnershipForDelete(
      session.user.role,
      session.user.id,
      existingArticle.authorId
    );
    if (ownershipDenied) return ownershipDenied;

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
