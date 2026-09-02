import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import cloudinary from "@/lib/cloudinary";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

const MAX_PDF_SIZE = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Only Admin/Editor can upload EPapers", 403);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string) || "";
    const coverImage = (formData.get("coverImage") as string) || "";
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "epaper", resource_type: "raw" }, (error, result) => {
          if (error) reject(error);
          else resolve(result as { secure_url: string });
        })
        .end(buffer);
    });

    const epaper = await prisma.ePaper.create({
      data: {
        title: title.trim(),
        pdfUrl: uploadResult.secure_url,
        coverImage: coverImage.trim() || null,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
      },
    });

    return apiSuccess(epaper, "E-paper edition uploaded", 201);
  } catch (error) {
    return handleServerError(error, "Failed to upload e-paper");
  }
}
