import { NextRequest } from "next/server";
import { requireStaff } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import cloudinary from "@/lib/cloudinary";

interface CloudinaryUploadResult {
  secure_url?: string;
  public_id?: string;
  width?: number;
  height?: number;
}

const MAX_FILE_SIZE = 500 * 1024; // 500 KB limit for images
const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

export async function GET(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const session = auth.session!;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const folder = searchParams.get("folder") || "ALL";
    const type = searchParams.get("type") || "ALL"; // ALL, image, video
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: Prisma.MediaWhereInput = {};

    // Authors only see their own uploads; editors/admins see the library.
    if (session.user.role === Role.AUTHOR) {
      where.uploaderId = session.user.id;
    }

    if (search) {
      where.OR = [
        { filename: { contains: search, mode: "insensitive" } },
        { altText: { contains: search, mode: "insensitive" } },
        { caption: { contains: search, mode: "insensitive" } },
      ];
    }

    if (folder !== "ALL") {
      where.folder = folder;
    }

    if (type !== "ALL") {
      where.mimeType = { startsWith: type };
    }

    const aggregateWhere =
      session.user.role === Role.AUTHOR
        ? { uploaderId: session.user.id }
        : {};

    const [total, mediaList, aggregate, imageCount] = await Promise.all([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          filename: true,
          url: true,
          publicId: true,
          mimeType: true,
          size: true,
          width: true,
          height: true,
          altText: true,
          caption: true,
          folder: true,
          createdAt: true,
          uploader: {
            select: { name: true, email: true },
          },
        },
      }),
      prisma.media.aggregate({
        where: aggregateWhere,
        _sum: { size: true },
        _count: { id: true },
      }),
      prisma.media.count({
        where: {
          ...aggregateWhere,
          mimeType: { startsWith: "image" },
        },
      }),
    ]);

    const metrics = {
      totalFiles: aggregate._count.id || 0,
      totalSizeBytes: aggregate._sum.size || 0,
      imageCount,
    };

    return apiSuccess(
      {
        media: mediaList,
        metrics,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
      "Media list retrieved",
      200
    );
  } catch (error) {
    return handleServerError(error, "Failed to retrieve media library");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;
    const session = auth.session!;
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    const folder = (formData.get("folder") as string) || "articles";
    const altText = (formData.get("altText") as string) || "";
    const caption = (formData.get("caption") as string) || "";

    if (!files || files.length === 0) {
      return apiError("No files uploaded", 400);
    }

    const uploadedMediaRecords = [];

    for (const file of files) {
      // 1. Validate MimeType
      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        return apiError(`"${file.name}" rejected: Only PNG, JPG, JPEG, WEBP, and GIF allowed`, 400);
      }

      // 2. Validate 500 KB Max Size
      if (file.size > MAX_FILE_SIZE) {
        return apiError(`"${file.name}" exceeds 500 KB limit (${(file.size / 1024).toFixed(0)} KB)`, 400);
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      let secureUrl = "";
      let publicId: string | null = null;
      let width: number | null = null;
      let height: number | null = null;

      // Upload to Cloudinary CDN
      try {
        const uploadResult: CloudinaryUploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: `news_${folder}`,
              transformation: [{ quality: "auto:good", fetch_format: "auto" }],
            },
            (error, result) => {
              if (error) reject(error);
              else if (!result) reject(new Error("Cloudinary upload failed: no result"));
              else resolve(result);
            }
          ).end(buffer);
        });

        if (uploadResult?.secure_url) {
          secureUrl = uploadResult.secure_url;
          publicId = uploadResult.public_id || null;
          width = uploadResult.width || null;
          height = uploadResult.height || null;
        }
      } catch (err) {
        console.error("Cloudinary upload fallback to data URL:", err);
      }

      // Local fallback data URL if CDN not configured
      if (!secureUrl) {
        const base64 = buffer.toString("base64");
        secureUrl = `data:${file.type};base64,${base64}`;
      }

      // Store in PostgreSQL Media Model
      const record = await prisma.media.create({
        data: {
          filename: file.name,
          url: secureUrl,
          publicId,
          mimeType: file.type,
          size: file.size,
          width,
          height,
          altText: altText || undefined,
          caption: caption || undefined,
          folder,
          uploaderId: session.user.id,
        },
      });

      uploadedMediaRecords.push(record);
    }

    return apiSuccess(uploadedMediaRecords, "Media assets uploaded successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to upload media assets");
  }
}
