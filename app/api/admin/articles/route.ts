import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, ArticleType, Prisma } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";
import { validateArticleCreate } from "@/lib/validations/article";
import { resolvePublishedAt } from "@/lib/article-scheduling";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") as ArticleStatus | null;
    const type = searchParams.get("type") as ArticleType | null;
    const categoryId = searchParams.get("categoryId") || "";
    const tagId = searchParams.get("tagId") || "";
    const province = searchParams.get("province") || "";
    const district = searchParams.get("district") || "";
    const scheduled = searchParams.get("scheduled") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Prisma.ArticleWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { titleNp: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { contentNp: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } },
        { tags: { some: { name: { contains: search, mode: "insensitive" } } } },
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

    if (tagId) {
      where.tags = { some: { id: tagId } };
    }

    if (province) {
      const provinceNum = Number(province);
      if (!Number.isNaN(provinceNum)) {
        where.province = provinceNum;
      }
    }

    if (district.trim()) {
      where.district = { contains: district.trim(), mode: "insensitive" };
    }

    if (scheduled) {
      where.scheduledAt = { gt: new Date() };
      where.status = { in: [ArticleStatus.DRAFT, ArticleStatus.PENDING] };
    }

    const [total, articles, statusGroups, viewsAggregate, breakingCount, scheduledCount] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
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
          scheduledAt: true,
          province: true,
          district: true,
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
          tags: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
      }),
      prisma.article.aggregate({
        where,
        _sum: { views: true },
      }),
      prisma.article.count({ where: { ...where, isBreaking: true } }),
      prisma.article.count({
        where: {
          scheduledAt: { gt: new Date() },
          status: { in: [ArticleStatus.DRAFT, ArticleStatus.PENDING] },
        },
      }),
    ]);

    const statusCount = (value: ArticleStatus) =>
      statusGroups.find((group) => group.status === value)?._count._all ?? 0;

    return apiSuccess(
      {
        articles,
        summary: {
          total,
          published: statusCount(ArticleStatus.PUBLISHED),
          draft: statusCount(ArticleStatus.DRAFT),
          pending: statusCount(ArticleStatus.PENDING),
          archived: statusCount(ArticleStatus.ARCHIVED),
          breaking: breakingCount,
          scheduled: scheduledCount,
          views: viewsAggregate._sum.views ?? 0,
        },
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
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const body = await request.json();
    const validation = validateArticleCreate(body);
    if (!validation.ok) {
      return apiError(validation.error, 400);
    }

    const data = validation.data;

    const existingSlug = await prisma.article.findUnique({
      where: { slug: data.slug! },
    });

    if (existingSlug) {
      return apiError("An article with this slug already exists", 400);
    }

    if (data.tagIds?.length) {
      const tagCount = await prisma.tag.count({
        where: { id: { in: data.tagIds } },
      });
      if (tagCount !== data.tagIds.length) {
        return apiError("One or more tags are invalid", 400);
      }
    }

    const articleStatus = data.status ?? ArticleStatus.DRAFT;
    const publishedAt = resolvePublishedAt(articleStatus, data.scheduledAt ?? null, null);

    const article = await prisma.article.create({
      data: {
        title: data.title!,
        titleNp: data.titleNp ?? null,
        slug: data.slug!,
        content: data.content!,
        contentNp: data.contentNp ?? null,
        excerpt: data.excerpt ?? null,
        coverImage: data.coverImage ?? null,
        caption: data.caption ?? null,
        status: articleStatus,
        type: data.type!,
        languageEdition: data.languageEdition!,
        isFeatured: Boolean(data.isFeatured),
        isBreaking: Boolean(data.isBreaking),
        categoryId: data.categoryId!,
        authorId: auth.session!.user.id,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        keywords: data.keywords ?? null,
        ogImage: data.ogImage ?? null,
        province: data.province ?? null,
        district: data.district ?? null,
        scheduledAt: data.scheduledAt ?? null,
        publishedAt,
        ...(data.tagIds?.length
          ? { tags: { connect: data.tagIds.map((id) => ({ id })) } }
          : {}),
      },
      include: {
        tags: { select: { id: true, name: true, slug: true } },
      },
    });

    return apiSuccess(article, "Article created successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create article");
  }
}
