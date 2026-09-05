import { NextRequest } from "next/server";
import { ArticleStatus, ArticleType, LanguageEdition, Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";
import { validateArticleCreate } from "@/lib/validations/article";
import { resolvePublishedAt } from "@/lib/article-scheduling";
import { sanitizeArticleHtml } from "@/lib/sanitize-html";
import {
  assertArticleStatusPermission,
  assertBreakingPermission,
  assertFeaturedPermission,
  assertSchedulePermission,
} from "@/lib/article-permissions";
import { writeAuditLog } from "@/lib/audit-log";
import { invalidatePublicArticles } from "@/lib/cache-invalidation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const languageEdition = searchParams.get("languageEdition") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10", 10) || 10));

    const where: Prisma.ArticleWhereInput = {};

    if (auth.session!.user.role === Role.AUTHOR) {
      where.authorId = auth.session!.user.id;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { titleNp: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { excerptNp: { contains: search, mode: "insensitive" } },
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

    if (
      languageEdition &&
      Object.values(LanguageEdition).includes(languageEdition as LanguageEdition)
    ) {
      where.languageEdition = languageEdition as LanguageEdition;
    }

    const listSelect = {
      id: true,
      title: true,
      titleNp: true,
      slug: true,
      coverImage: true,
      status: true,
      type: true,
      languageEdition: true,
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
    } satisfies Prisma.ArticleSelect;

    const wantSummary = searchParams.get("summary") === "1";

    const total = await prisma.article.count({ where });
    const articles = await prisma.article.findMany({
      where,
      select: listSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    let summary = {
      total,
      published: 0,
      draft: 0,
      pending: 0,
      archived: 0,
      breaking: 0,
      scheduled: 0,
      views: 0,
    };

    if (wantSummary) {
      const summaryWhere: Prisma.ArticleWhereInput =
        auth.session!.user.role === Role.AUTHOR
          ? { authorId: auth.session!.user.id }
          : {};

      const [statusGroups, viewsAggregate, breakingCount, scheduledCount] = await Promise.all([
        prisma.article.groupBy({
          by: ["status"],
          where: summaryWhere,
          _count: { _all: true },
        }),
        prisma.article.aggregate({
          where: summaryWhere,
          _sum: { views: true },
        }),
        prisma.article.count({ where: { ...summaryWhere, isBreaking: true } }),
        prisma.article.count({
          where: {
            ...summaryWhere,
            scheduledAt: { gt: new Date() },
            status: { in: [ArticleStatus.DRAFT, ArticleStatus.PENDING] },
          },
        }),
      ]);

      const statusCount = (value: ArticleStatus) =>
        statusGroups.find((group) => group.status === value)?._count._all ?? 0;

      summary = {
        total,
        published: statusCount(ArticleStatus.PUBLISHED),
        draft: statusCount(ArticleStatus.DRAFT),
        pending: statusCount(ArticleStatus.PENDING),
        archived: statusCount(ArticleStatus.ARCHIVED),
        breaking: breakingCount,
        scheduled: scheduledCount,
        views: viewsAggregate._sum.views ?? 0,
      };
    }

    return apiSuccess(
      {
        articles,
        summary,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit) || 1),
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
    const role = auth.session!.user.role;

    const statusDenied = assertArticleStatusPermission(role, data.status ?? ArticleStatus.DRAFT);
    if (statusDenied) return statusDenied;
    const scheduleDenied = assertSchedulePermission(role, data.scheduledAt ?? null);
    if (scheduleDenied) return scheduleDenied;
    const breakingDenied = assertBreakingPermission(role, Boolean(data.isBreaking));
    if (breakingDenied) return breakingDenied;
    const featuredDenied = assertFeaturedPermission(role, Boolean(data.isFeatured));
    if (featuredDenied) return featuredDenied;

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
        content: sanitizeArticleHtml(data.content!),
        contentNp: data.contentNp ? sanitizeArticleHtml(data.contentNp) : null,
        excerpt: data.excerpt ?? null,
        excerptNp: data.excerptNp ?? null,
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
        metaTitleNp: data.metaTitleNp ?? null,
        metaDescription: data.metaDescription ?? null,
        metaDescriptionNp: data.metaDescriptionNp ?? null,
        keywords: data.keywords ?? null,
        keywordsNp: data.keywordsNp ?? null,
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

    await writeAuditLog({
      userId: auth.session!.user.id,
      action: "CREATE",
      entity: "Article",
      entityId: article.id,
      details: `${article.status}: ${article.title}`,
    });

    if (article.status === ArticleStatus.PUBLISHED) {
      invalidatePublicArticles();
    }

    return apiSuccess(article, "Article created successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create article");
  }
}
