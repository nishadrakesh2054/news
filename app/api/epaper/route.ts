import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";

export async function GET() {
  try {
    const epapers = await prisma.ePaper.findMany({
      orderBy: { publishDate: "desc" },
      take: 30,
      select: {
        id: true,
        title: true,
        pdfUrl: true,
        coverImage: true,
        publishDate: true,
      },
    });

    const res = apiSuccess(epapers, "E-paper editions retrieved");
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to fetch e-paper editions");
  }
}
