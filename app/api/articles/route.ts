import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { MESSAGES } from "@/constants/messages";

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        createdAt: true,
        category: {
          select: { id: true, name: true, nameNp: true, slug: true },
        },
        author: { select: { name: true, image: true } },
      },
    });
    const res = apiSuccess(articles);
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
    return res;
  } catch (error) {
    return handleServerError(error, MESSAGES.ARTICLES.FETCH_ERROR);
  }
}
