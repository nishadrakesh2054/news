import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";
import { validateArticleUpdate } from "@/lib/validations/article";
import { normalizeStatusForSchedule, resolvePublishedAt } from "@/lib/article-scheduling";

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

    const newStatus = data.status ?? existingArticle.status;
    const scheduledAt =
      data.scheduledAt !== undefined ? data.scheduledAt : existingArticle.scheduledAt;
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
        ...(data.content && { content: data.content }),
        ...(data.contentNp !== undefined && { contentNp: data.contentNp }),
        ...(data.excerpt !== undefined && { excerpt: data.excerpt }),
        ...(data.coverImage !== undefined && { coverImage: data.coverImage }),
        ...(data.caption !== undefined && { caption: data.caption }),
        status: normalizedStatus,
        ...(data.type && { type: data.type }),
        ...(data.languageEdition && { languageEdition: data.languageEdition }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.isBreaking !== undefined && { isBreaking: data.isBreaking }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.metaTitle !== undefined && { metaTitle: data.metaTitle }),
        ...(data.metaDescription !== undefined && { metaDescription: data.metaDescription }),
        ...(data.keywords !== undefined && { keywords: data.keywords }),
        ...(data.ogImage !== undefined && { ogImage: data.ogImage }),
        ...(data.province !== undefined && { province: data.province }),
        ...(data.district !== undefined && { district: data.district }),
        ...(data.scheduledAt !== undefined && { scheduledAt: data.scheduledAt }),
        ...(data.tagIds !== undefined && {
          tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
        }),
        publishedAt,
      },
      include: {
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

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

    return apiSuccess(null, "Article deleted successfully");
  } catch (error) {
    return handleServerError(error, "Failed to delete article");
  }
}
