import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

export async function GET() {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const epapers = await prisma.ePaper.findMany({
      orderBy: { publishDate: "desc" },
      take: 50,
    });
    return apiSuccess(epapers);
  } catch (error) {
    return handleServerError(error, "Failed to fetch EPapers");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { title, pdfUrl, coverImage, publishDate } = body;

    if (!title || !pdfUrl) {
      return apiError("Title and PDF URL are required", 400);
    }

    const epaper = await prisma.ePaper.create({
      data: {
        title: title.trim(),
        pdfUrl: pdfUrl.trim(),
        coverImage: coverImage ? coverImage.trim() : null,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
      },
    });

    return apiSuccess(epaper, "EPaper published successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create EPaper");
  }
}
