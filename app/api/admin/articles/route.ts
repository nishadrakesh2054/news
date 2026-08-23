import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, ArticleStatus, ArticleType, Prisma } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as ArticleStatus | null;
    const type = searchParams.get("type") as ArticleType | null;
    const categoryId = searchParams.get("categoryId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Prisma.ArticleWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { titleNp: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && Object.values(ArticleStatus).includes(status)) {
      where.status = status;
    }

    if (type && Object.values(ArticleType).includes(type)) {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const total = await prisma.article.count({ where });

    const articles = await prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        status: true,
        type: true,
        isFeatured: true,
        isBreaking: true,
        views: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameNp: true,
            slug: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return apiSuccess(
      {
        articles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Articles fetched successfully"
    );
  } catch (error) {
    return handleServerError(error, "Failed to fetch articles");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR, Role.AUTHOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Only staff members can create articles", 403);
    }

    const body = await request.json();
    const {
      title,
      titleNp,
      slug,
      content,
      excerpt,
      coverImage,
      caption,
      status,
      type,
      languageEdition,
      isFeatured,
      isBreaking,
      categoryId,
      metaTitle,
      metaDescription,
      keywords,
      ogImage,
    } = body;

    if (!title || !slug || !content || !categoryId) {
      return apiError("Title, slug, content, and category are required", 400);
    }

    const existingSlug = await prisma.article.findUnique({
      where: { slug: slug.trim().toLowerCase() },
    });

    if (existingSlug) {
      return apiError("An article with this slug already exists", 400);
    }

    const articleStatus = Object.values(ArticleStatus).includes(status)
      ? status
      : ArticleStatus.DRAFT;

    const articleType = Object.values(ArticleType).includes(type)
      ? type
      : ArticleType.STANDARD;

    const article = await prisma.article.create({
      data: {
        title: title.trim(),
        titleNp: titleNp ? titleNp.trim() : null,
        slug: slug.trim().toLowerCase(),
        content,
        excerpt: excerpt ? excerpt.trim() : null,
        coverImage: coverImage ? coverImage.trim() : null,
        caption: caption ? caption.trim() : null,
        status: articleStatus,
        type: articleType,
        languageEdition: languageEdition || "BOTH",
        isFeatured: Boolean(isFeatured),
        isBreaking: Boolean(isBreaking),
        categoryId,
        authorId: session.user.id,
        metaTitle: metaTitle ? metaTitle.trim() : null,
        metaDescription: metaDescription ? metaDescription.trim() : null,
        keywords: keywords ? keywords.trim() : null,
        ogImage: ogImage ? ogImage.trim() : null,
        publishedAt: articleStatus === ArticleStatus.PUBLISHED ? new Date() : null,
      },
    });

    return apiSuccess(article, "Article created successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create article");
  }
}
