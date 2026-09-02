import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        nameNp: true,
        slug: true,
        description: true,
        order: true,
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    const res = apiSuccess(categories, "Categories retrieved successfully");
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to retrieve categories");
  }
}
