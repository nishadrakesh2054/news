import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where = { mimeType: { startsWith: "video/" } };

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { uploader: { select: { name: true } } },
      }),
      prisma.media.count({ where }),
    ]);

    return apiSuccess({ items, total, page, limit });
  } catch (error) {
    return handleServerError(error, "Failed to fetch videos");
  }
}
