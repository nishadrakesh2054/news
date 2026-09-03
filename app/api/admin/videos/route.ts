import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { parseYoutubeVideoId, youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

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

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { title, youtubeUrl, asReel } = await request.json();

    if (!title?.trim() || !youtubeUrl?.trim()) {
      return apiError("Title and YouTube URL are required", 400);
    }

    const videoId = parseYoutubeVideoId(youtubeUrl);
    if (!videoId) {
      return apiError("Invalid YouTube URL", 400);
    }

    const media = await prisma.media.create({
      data: {
        filename: title.trim(),
        url: youtubeEmbedUrl(videoId),
        mimeType: "video/youtube",
        size: 0,
        folder: asReel ? "reels" : "videos",
        caption: youtubeUrl.trim(),
        altText: youtubeThumbnailUrl(videoId),
        uploaderId: auth.session!.user.id,
      },
      include: { uploader: { select: { name: true } } },
    });

    return apiSuccess(media, asReel ? "Reel added" : "YouTube video added", 201);
  } catch (error) {
    return handleServerError(error, "Failed to add video");
  }
}
