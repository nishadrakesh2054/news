import { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id } = await params;
    const existing = await prisma.ePaper.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Edition not found", 404);
    }

    const contentType = request.headers.get("content-type") || "";
    const data: {
      title?: string;
      publishDate?: Date;
      coverImage?: string | null;
      pdfUrl?: string;
    } = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const title = (formData.get("title") as string | null)?.trim();
      const publishDate = (formData.get("publishDate") as string | null) || "";
      const removeCover = formData.get("removeCover") === "1";
      const coverFile = formData.get("coverFile") as File | null;
      const pdfFile = formData.get("file") as File | null;

      if (title) data.title = title;
      if (publishDate) data.publishDate = new Date(publishDate);

      if (removeCover) {
        data.coverImage = null;
      }

      if (coverFile && coverFile.size > 0) {
        if (!COVER_TYPES.has(coverFile.type)) {
          return apiError("Cover must be JPEG, PNG, WebP, or GIF", 400);
        }
        if (coverFile.size > MAX_COVER_SIZE) {
          return apiError("Cover image exceeds 5MB limit", 400);
        }
        const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
        const coverResult = await uploadBuffer(coverBuffer, {
          folder: "epaper/covers",
          resource_type: "image",
        });
        data.coverImage = coverResult.secure_url;
      }

      if (pdfFile && pdfFile.size > 0) {
        if (pdfFile.type !== "application/pdf") {
          return apiError("Only PDF files are allowed", 400);
        }
        if (pdfFile.size > MAX_PDF_SIZE) {
          return apiError("PDF exceeds 20MB limit", 400);
        }
        const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
        const pdfResult = await uploadBuffer(pdfBuffer, {
          folder: "epaper",
          resource_type: "raw",
        });
        data.pdfUrl = pdfResult.secure_url;
      }
    } else {
      const body = await request.json();
      if (body.title !== undefined) data.title = String(body.title).trim();
      if (body.publishDate !== undefined) data.publishDate = new Date(body.publishDate);
      if (body.coverImage !== undefined) data.coverImage = body.coverImage?.trim() || null;
      if (body.pdfUrl !== undefined) data.pdfUrl = String(body.pdfUrl).trim();
    }

    const epaper = await prisma.ePaper.update({
      where: { id },
      data,
    });

    invalidatePublicMedia();
    return apiSuccess(epaper, "Edition updated");
  } catch (error) {
    return handleServerError(error, "Failed to update edition");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existing = await prisma.ePaper.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Edition not found", 404);
    }

    await prisma.ePaper.delete({ where: { id } });

    invalidatePublicMedia();
    return apiSuccess(null, "Edition deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete edition");
  }
}
