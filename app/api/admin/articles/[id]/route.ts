import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, ArticleStatus, ArticleType } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR, Role.AUTHOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Staff permissions required", 403);
    }

    const { id } = await params;
    const body = await request.json();

    const existingArticle = await prisma.article.findUnique({
      where: { id },
    });

    if (!existingArticle) {
      return apiError("Article not found", 404);
    }

    // Role safety check: Authors can only edit their own articles unless Admin/Editor
    if (session.user.role === Role.AUTHOR && existingArticle.authorId !== session.user.id) {
      return apiError("Unauthorized: You can only edit your own articles", 403);
    }

    if (body.slug && body.slug !== existingArticle.slug) {
      const slugConflict = await prisma.article.findUnique({
        where: { slug: body.slug.trim().toLowerCase() },
      });
      if (slugConflict) {
        return apiError("Another article already uses this slug", 400);
      }
    }

    const newStatus = body.status && Object.values(ArticleStatus).includes(body.status)
      ? body.status
      : existingArticle.status;

    let publishedAt = existingArticle.publishedAt;
    if (newStatus === ArticleStatus.PUBLISHED && !existingArticle.publishedAt) {
      publishedAt = new Date();
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title.trim() }),
        ...(body.titleNp !== undefined && { titleNp: body.titleNp ? body.titleNp.trim() : null }),
        ...(body.slug && { slug: body.slug.trim().toLowerCase() }),
        ...(body.content && { content: body.content }),
        ...(body.excerpt !== undefined && { excerpt: body.excerpt ? body.excerpt.trim() : null }),
        ...(body.coverImage !== undefined && { coverImage: body.coverImage ? body.coverImage.trim() : null }),
        ...(body.caption !== undefined && { caption: body.caption ? body.caption.trim() : null }),
        status: newStatus,
        ...(body.type && Object.values(ArticleType).includes(body.type) && { type: body.type }),
        ...(body.isFeatured !== undefined && { isFeatured: Boolean(body.isFeatured) }),
        ...(body.isBreaking !== undefined && { isBreaking: Boolean(body.isBreaking) }),
        ...(body.categoryId && { categoryId: body.categoryId }),
        ...(body.metaTitle !== undefined && { metaTitle: body.metaTitle ? body.metaTitle.trim() : null }),
        ...(body.metaDescription !== undefined && { metaDescription: body.metaDescription ? body.metaDescription.trim() : null }),
        ...(body.keywords !== undefined && { keywords: body.keywords ? body.keywords.trim() : null }),
        ...(body.ogImage !== undefined && { ogImage: body.ogImage ? body.ogImage.trim() : null }),
        publishedAt,
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
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
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
