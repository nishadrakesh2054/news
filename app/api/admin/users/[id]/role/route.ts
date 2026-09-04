import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return apiError("Unauthorized: Only Admins can update user roles", 403);
    }

    const { id } = await params;
    const { role } = await request.json();

    if (!role || !Object.values(Role).includes(role)) {
      return apiError("Invalid role provided", 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return apiError("User not found", 404);
    }

    // Safety check: Prevent demoting self if sole admin in system
    if (targetUser.id === session.user.id && role !== Role.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: Role.ADMIN },
      });

      if (adminCount <= 1) {
        return apiError("Cannot demote the only remaining Admin account", 400);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role,
        sessionVersion: { increment: 1 },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return apiSuccess(updatedUser, `User role updated to ${role}`);
  } catch (error) {
    return handleServerError(error, "Failed to update user role");
  }
}
