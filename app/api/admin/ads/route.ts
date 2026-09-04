import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, AdSlot } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { invalidatePublicAds } from "@/lib/cache-invalidation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10) || 50));
    const skip = (page - 1) * limit;

    const [ads, total] = await Promise.all([
      prisma.ad.findMany({
        select: {
          id: true,
          title: true,
          slot: true,
          imageUrl: true,
          targetUrl: true,
          scriptCode: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.ad.count(),
    ]);

    return apiSuccess(
      { items: ads, page, limit, total, totalPages: Math.ceil(total / limit) },
      "Ads retrieved successfully"
    );
  } catch (error) {
    return handleServerError(error, "Failed to retrieve ads");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return apiError("Unauthorized: Only Admins can manage advertisements", 403);
    }

    const { title, slot, imageUrl, targetUrl, scriptCode, isActive } = await request.json();

    if (!title || !slot || !Object.values(AdSlot).includes(slot)) {
      return apiError("Valid title and ad slot are required", 400);
    }

    const ad = await prisma.ad.create({
      data: {
        title: title.trim(),
        slot,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        targetUrl: targetUrl ? targetUrl.trim() : null,
        scriptCode: scriptCode ? scriptCode.trim() : null,
        isActive: Boolean(isActive ?? true),
      },
    });

    invalidatePublicAds();

    return apiSuccess(ad, "Ad slot created successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create ad slot");
  }
}
