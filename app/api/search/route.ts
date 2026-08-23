import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { ArticleStatus, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sort = searchParams.get("sort") || "recent"; // "recent" | "views"

    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.PUBLISHED,
    };

    if (query.trim()) {
      const q = query.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { titleNp: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
        { excerpt: { contains: q, mode: "insensitive" } },
        { keywords: { contains: q, mode: "insensitive" } },
      ];
    }

    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    const orderBy: Prisma.ArticleOrderByWithRelationInput = sort === "views" ? { views: "desc" } : { createdAt: "desc" };

    // Parallel count & fetch for maximum search speed
    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          type: true,
          views: true,
          createdAt: true,
          publishedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              nameNp: true,
              slug: true,
            },
          },
          author: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      }),
    ]);

    const response = apiSuccess({
      articles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      query,
    });

    response.headers.set("Cache-Control", "public, s-maxage=30, stale-while-revalidate=300");
    return response;
  } catch (error) {
    return handleServerError(error, "खोज नतिजा प्राप्त गर्न सकिएन (Search failed)");
  }
}
