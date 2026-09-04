import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role, AdSlot } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireAdmin, requireEditor } from "@/lib/admin-auth";
import { invalidatePublicAds } from "@/lib/cache-invalidation";
import { sanitizeAdScriptCode } from "@/lib/sanitize-html";

function isSafeAdTargetUrl(url: string | null | undefined): boolean {
  if (!url?.trim()) return true;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return url.trim().startsWith("/") && !url.trim().startsWith("//");
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

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
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { title, slot, imageUrl, targetUrl, scriptCode, isActive } = await request.json();

    if (!title || !slot || !Object.values(AdSlot).includes(slot)) {
      return apiError("Valid title and ad slot are required", 400);
    }

    const trimmedTarget = targetUrl ? String(targetUrl).trim() : null;
    if (trimmedTarget && !isSafeAdTargetUrl(trimmedTarget)) {
      return apiError("Invalid ad target URL", 400);
    }

    const ad = await prisma.ad.create({
      data: {
        title: title.trim(),
        slot,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        targetUrl: trimmedTarget,
        scriptCode: scriptCode ? sanitizeAdScriptCode(scriptCode) || null : null,
        isActive: Boolean(isActive ?? true),
      },
    });

    invalidatePublicAds();

    return apiSuccess(ad, "Ad slot created successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create ad slot");
  }
}
