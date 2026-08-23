import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function GET() {
  try {
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
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Only Admin/Editor can upload EPapers", 403);
    }

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
