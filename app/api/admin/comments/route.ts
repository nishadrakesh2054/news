import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, CommentStatus, Prisma } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Only Admin/Editor can moderate comments", 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as CommentStatus | null;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");

    const where: Prisma.CommentWhereInput = {};
    if (status && Object.values(CommentStatus).includes(status)) {
      where.status = status;
    }

    const total = await prisma.comment.count({ where });

    const comments = await prisma.comment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        article: {
          select: {
            id: true,
            title: true,
            titleNp: true,
            slug: true,
          },
        },
        author: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return apiSuccess({
      comments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleServerError(error, "Failed to fetch comments for moderation");
  }
}
