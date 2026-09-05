import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdSlot } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin-auth";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const existingAd = await prisma.ad.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return apiError("Ad not found", 404);
    }

    if (body.targetUrl !== undefined && body.targetUrl && !isSafeAdTargetUrl(body.targetUrl)) {
      return apiError("Invalid ad target URL", 400);
    }

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title.trim() }),
        ...(body.slot && Object.values(AdSlot).includes(body.slot) && { slot: body.slot }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl ? body.imageUrl.trim() : null }),
        ...(body.targetUrl !== undefined && {
          targetUrl: body.targetUrl ? body.targetUrl.trim() : null,
        }),
        ...(body.scriptCode !== undefined && {
          scriptCode: body.scriptCode ? sanitizeAdScriptCode(body.scriptCode) || null : null,
        }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
        ...(body.sortOrder !== undefined &&
          typeof body.sortOrder === "number" &&
          Number.isFinite(body.sortOrder) && { sortOrder: Math.trunc(body.sortOrder) }),
      },
    });

    invalidatePublicAds();

    return apiSuccess(updatedAd, "Ad slot updated successfully");
  } catch (error) {
    return handleServerError(error, "Failed to update ad slot");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id } = await params;

    const existingAd = await prisma.ad.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return apiError("Ad not found", 404);
    }

    await prisma.ad.delete({
      where: { id },
    });

    invalidatePublicAds();

    return apiSuccess(null, "Ad slot deleted successfully");
  } catch (error) {
    return handleServerError(error, "Failed to delete ad slot");
  }
}
