import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError } from "@/lib/api-response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;

    if (!identifier) {
      return apiError("Article identifier is required", 400);
    }

    const article = await prisma.article.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        category: true,
        author: {
          select: { name: true, image: true },
        },
        liveUpdates: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!article) {
      return apiError("Article not found", 404);
    }

    return apiSuccess(article);
  } catch (error) {
    console.error("GET Article Error:", error);
    return apiError("Failed to fetch article", 500);
  }
}
