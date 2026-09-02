import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";

export async function GET() {
  try {
    const ads = await prisma.ad.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        slot: true,
        imageUrl: true,
        targetUrl: true,
        scriptCode: true,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const res = apiSuccess(ads, "Ads retrieved successfully");
    res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to retrieve ads");
  }
}
