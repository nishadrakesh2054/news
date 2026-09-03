import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";

/** Public video / reels feed (YouTube embeds + uploaded video files). */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "8", 10) || 8, 1), 24);
    const type = searchParams.get("type"); // "reels" | "all"

    const where =
      type === "reels"
        ? {
            OR: [
              { folder: "reels" },
              { mimeType: "video/youtube", folder: "videos" },
            ],
          }
        : {
            mimeType: { startsWith: "video/" },
          };

    const items = await prisma.media.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        filename: true,
        url: true,
        mimeType: true,
        altText: true,
        caption: true,
        folder: true,
        createdAt: true,
      },
    });

    // Prefer reels folder first when type=reels; if empty, fall back to all videos
    let data = items;
    if (type === "reels" && items.length === 0) {
      data = await prisma.media.findMany({
        where: { mimeType: { startsWith: "video/" } },
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          filename: true,
          url: true,
          mimeType: true,
          altText: true,
          caption: true,
          folder: true,
          createdAt: true,
        },
      });
    }

    const res = apiSuccess(data);
    res.headers.set("Cache-Control", "public, s-maxage=60, stale-while-revalidate=180");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to fetch videos");
  }
}
