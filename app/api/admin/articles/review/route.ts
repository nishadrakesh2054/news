import { NextRequest } from "next/server";
import { ArticleStatus, Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));

    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.PENDING,
    };

    if (auth.session!.user.role === Role.AUTHOR) {
      where.authorId = auth.session!.user.id;
    }

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          status: true,
          scheduledAt: true,
          createdAt: true,
          author: { select: { name: true, email: true } },
          category: { select: { name: true, nameNp: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return apiSuccess(
      {
        articles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
      "Review queue fetched successfully"
    );
  } catch (error) {
    return handleServerError(error, "Failed to load review queue");
  }
}
