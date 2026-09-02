import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriberStatus } from "@prisma/client";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as SubscriberStatus | null;
    const search = searchParams.get("search")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const where = {
      ...(status && Object.values(SubscriberStatus).includes(status) ? { status } : {}),
      ...(search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" as const } },
              { name: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, subscribers, activeCount, pushCount] = await Promise.all([
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.newsletterSubscriber.count({ where: { status: SubscriberStatus.ACTIVE } }),
      prisma.pushSubscription.count({ where: { isActive: true } }),
    ]);

    return apiSuccess({
      subscribers,
      stats: { total, activeCount, pushCount },
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleServerError(error, "Failed to fetch subscribers");
  }
}
