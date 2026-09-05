import { NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { invalidatePublicMedia } from "@/lib/cache-invalidation";
import { parseYoutubeVideoId, youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube";
import cloudinary from "@/lib/cloudinary";

interface CloudinaryUploadResult {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

const VALID_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO_SIZE = 80 * 1024 * 1024; // 80 MB

async function uploadVideoFile(
  file: File,
  folder: string,
  uploaderId: string,
  title?: string
) {
  if (!VALID_VIDEO_TYPES.includes(file.type)) {
    throw new Error(`"${file.name}" rejected: only MP4, WebM, and MOV allowed`);
  }
  if (file.size > MAX_VIDEO_SIZE) {
    throw new Error(
      `"${file.name}" exceeds 80 MB limit (${(file.size / (1024 * 1024)).toFixed(1)} MB)`
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let secureUrl = "";
  let publicId: string | null = null;
  let width: number | null = null;
  let height: number | null = null;

  try {
    const uploadResult: CloudinaryUploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `news_${folder}`,
            resource_type: "video",
          },
          (error, result) => {
            if (error) reject(error);
            else if (!result) reject(new Error("Cloudinary upload failed: no result"));
            else resolve(result);
          }
        )
        .end(buffer);
    });

    if (uploadResult?.secure_url) {
      secureUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id || null;
      width = uploadResult.width || null;
      height = uploadResult.height || null;
    }
  } catch (err) {
    console.error("Cloudinary video upload fallback to local file:", err);
  }

  if (!secureUrl) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "videos");
    await mkdir(uploadsDir, { recursive: true });
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    await writeFile(path.join(uploadsDir, safeName), buffer);
    secureUrl = `/uploads/videos/${safeName}`;
  }

  return prisma.media.create({
    data: {
      filename: (title?.trim() || file.name).slice(0, 200),
      url: secureUrl,
      publicId,
      mimeType: file.type || "video/mp4",
      size: file.size,
      width,
      height,
      folder,
      uploaderId,
    },
    include: { uploader: { select: { name: true } } },
  });
}

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

    const contentType = request.headers.get("content-type") || "";

    // Local / file upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const files = formData.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
      const title = (formData.get("title") as string) || "";
      const asReel = formData.get("asReel") === "true" || formData.get("asReel") === "on";
      const folder = asReel ? "reels" : "videos";

      if (files.length === 0) {
        return apiError("No video file uploaded", 400);
      }

      const uploaded = [];
      for (const file of files) {
        uploaded.push(
          await uploadVideoFile(file, folder, auth.session!.user.id, title || undefined)
        );
      }

      invalidatePublicMedia();
      return apiSuccess(
        uploaded.length === 1 ? uploaded[0] : uploaded,
        uploaded.length === 1 ? "Video uploaded" : `${uploaded.length} videos uploaded`,
        201
      );
    }

    // YouTube embed
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

    invalidatePublicMedia();
    return apiSuccess(media, asReel ? "Reel added" : "YouTube video added", 201);
  } catch (error) {
    if (error instanceof Error && (error.message.includes("rejected") || error.message.includes("exceeds"))) {
      return apiError(error.message, 400);
    }
    return handleServerError(error, "Failed to add video");
  }
}
