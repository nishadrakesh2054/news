import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const gallery = await prisma.gallery.findFirst({
        where: { slug, isPublished: true },
        include: {
          items: {
            orderBy: { order: "asc" },
            include: {
              media: {
                select: {
                  id: true,
                  url: true,
                  altText: true,
                  caption: true,
                  width: true,
                  height: true,
                },
              },
            },
          },
        },
      });

      if (!gallery) {
        return apiError("Gallery not found", 404);
      }

      const res = apiSuccess(gallery);
      res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
      return res;
    }

    const galleries = await prisma.gallery.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        titleNp: true,
        slug: true,
        description: true,
        coverUrl: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    });

    const res = apiSuccess(galleries);
    res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to fetch galleries");
  }
}
