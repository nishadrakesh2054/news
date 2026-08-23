import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, AdSlot } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return apiError("Unauthorized: Only Admins can update ads", 403);
    }

    const { id } = await params;
    const body = await request.json();

    const existingAd = await prisma.ad.findUnique({
      where: { id },
    });

    if (!existingAd) {
      return apiError("Ad not found", 404);
    }

    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title.trim() }),
        ...(body.slot && Object.values(AdSlot).includes(body.slot) && { slot: body.slot }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl ? body.imageUrl.trim() : null }),
        ...(body.targetUrl !== undefined && { targetUrl: body.targetUrl ? body.targetUrl.trim() : null }),
        ...(body.scriptCode !== undefined && { scriptCode: body.scriptCode ? body.scriptCode.trim() : null }),
        ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
      },
    });

    return apiSuccess(updatedAd, "Ad slot updated successfully");
  } catch (error) {
    return handleServerError(error, "Failed to update ad slot");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return apiError("Unauthorized: Only Admins can delete ads", 403);
    }

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

    return apiSuccess(null, "Ad slot deleted successfully");
  } catch (error) {
    return handleServerError(error, "Failed to delete ad slot");
  }
}
