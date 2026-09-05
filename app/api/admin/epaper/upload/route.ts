import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import cloudinary from "@/lib/cloudinary";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { invalidatePublicMedia } from "@/lib/cache-invalidation";

const MAX_PDF_SIZE = 20 * 1024 * 1024;
const MAX_COVER_SIZE = 5 * 1024 * 1024;
const COVER_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

async function uploadBuffer(
  buffer: Buffer,
  options: { folder: string; resource_type: "raw" | "image" }
) {
  return new Promise<{ secure_url: string }>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) reject(error);
        else resolve(result as { secure_url: string });
      })
      .end(buffer);
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Only Admin/Editor can upload EPapers", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const coverFile = formData.get("coverFile") as File | null;
    const title = (formData.get("title") as string) || "";
    const publishDate = (formData.get("publishDate") as string) || "";

    if (!file) {
      return apiError("PDF file is required", 400);
    }

    if (file.type !== "application/pdf") {
      return apiError("Only PDF files are allowed", 400);
    }

    if (file.size > MAX_PDF_SIZE) {
      return apiError("PDF exceeds 20MB limit", 400);
    }

    if (!title.trim()) {
      return apiError("Edition title is required", 400);
    }

    if (!coverFile || coverFile.size === 0) {
      return apiError("Cover image is required — upload from your computer", 400);
    }

    if (!COVER_TYPES.has(coverFile.type)) {
      return apiError("Cover must be JPEG, PNG, WebP, or GIF", 400);
    }

    if (coverFile.size > MAX_COVER_SIZE) {
      return apiError("Cover image exceeds 5MB limit", 400);
    }

    const pdfBuffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await uploadBuffer(pdfBuffer, {
      folder: "epaper",
      resource_type: "raw",
    });

    const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
    const coverResult = await uploadBuffer(coverBuffer, {
      folder: "epaper/covers",
      resource_type: "image",
    });

    const epaper = await prisma.ePaper.create({
      data: {
        title: title.trim(),
        pdfUrl: uploadResult.secure_url,
        coverImage: coverResult.secure_url,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
      },
    });

    invalidatePublicMedia();
    return apiSuccess(epaper, "E-paper edition uploaded", 201);
  } catch (error) {
    return handleServerError(error, "Failed to upload e-paper");
  }
}
