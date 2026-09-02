import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ArticleStatus, ArticleType, Prisma } from "@prisma/client";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { MESSAGES } from "@/constants/messages";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("category") || "";
    const tagSlug = searchParams.get("tag") || "";
    const province = searchParams.get("province") || "";
    const district = searchParams.get("district") || "";
    const type = searchParams.get("type") || "";
    const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.PUBLISHED,
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (tagSlug) {
      where.tags = { some: { slug: tagSlug } };
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

    if (type && Object.values(ArticleType).includes(type as ArticleType)) {
      where.type = type as ArticleType;
    }

    const articles = await prisma.article.findMany({
      where,
      take: limit,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        type: true,
        province: true,
        district: true,
        publishedAt: true,
        createdAt: true,
        category: {
          select: { id: true, name: true, nameNp: true, slug: true },
        },
        author: { select: { name: true, image: true } },
        tags: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    const res = apiSuccess(articles);
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res;
  } catch (error) {
    return handleServerError(error, MESSAGES.ARTICLES.FETCH_ERROR);
  }
}
