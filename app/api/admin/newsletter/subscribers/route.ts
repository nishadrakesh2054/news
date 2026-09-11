import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriberStatus } from "@prisma/client";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requirePermission } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission("newsletter.read");
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as SubscriberStatus | null;
    const search = searchParams.get("search")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));

    const where = {
      ...(status && Object.values(SubscriberStatus).includes(status) ? { status } : {}),
      ...(search
        ? {
            email: { contains: search, mode: "insensitive" as const },
          }
        : {}),
    };

    const [total, subscribers, activeCount, unsubscribedCount] = await Promise.all([
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          status: true,
          createdAt: true,
        },
      }),
      prisma.newsletterSubscriber.count({ where: { status: SubscriberStatus.ACTIVE } }),
      prisma.newsletterSubscriber.count({ where: { status: SubscriberStatus.UNSUBSCRIBED } }),
    ]);

    return apiSuccess({
      subscribers,
      stats: { total, activeCount, unsubscribedCount },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleServerError(error, "Failed to fetch subscribers");
  }
}
