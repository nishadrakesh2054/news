import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, AdSlot } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function GET() {
  try {
    const ads = await prisma.ad.findMany({
      orderBy: { createdAt: "desc" },
    });

    return apiSuccess(ads, "Ads retrieved successfully");
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

    return apiSuccess(ad, "Ad slot created successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create ad slot");
  }
}
