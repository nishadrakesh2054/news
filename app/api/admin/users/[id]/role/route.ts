import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requirePermission } from "@/lib/admin-auth";
import { isSuperAdmin } from "@/lib/permissions";
import { ROLE_LABELS } from "@/constants/permissions";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("users.update");
    if (auth.error) return auth.error;

    const actor = auth.session!.user;
    const actorIsSuper = isSuperAdmin(actor.role);

    const { id } = await params;
    const { role } = await request.json();

    if (!role || !Object.values(Role).includes(role)) {
      return apiError("Invalid role provided", 400);
    }

    if ((role === Role.SUPER_ADMIN || role === Role.ADMIN) && !actorIsSuper) {
      return apiError("Only Super Admin can grant Admin or Super Admin", 403);
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    if (targetUser.role === Role.SUPER_ADMIN && !actorIsSuper) {
      return apiError("Only Super Admin can change a Super Admin", 403);
    }

    if (targetUser.role === Role.ADMIN && role !== Role.ADMIN && !actorIsSuper) {
      return apiError("Only Super Admin can change an Admin’s role", 403);
    }

    // Protect last Super Admin
    if (targetUser.role === Role.SUPER_ADMIN && role !== Role.SUPER_ADMIN) {
      const superCount = await prisma.user.count({ where: { role: Role.SUPER_ADMIN } });
      if (superCount <= 1) {
        return apiError("Cannot demote the only remaining Super Admin", 400);
      }
    }

    // Protect last Admin-or-above if demoting self from admin tier (legacy safety)
    if (
      targetUser.id === actor.id &&
      (targetUser.role === Role.ADMIN || targetUser.role === Role.SUPER_ADMIN) &&
      role !== Role.ADMIN &&
      role !== Role.SUPER_ADMIN
    ) {
      const privileged = await prisma.user.count({
        where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN] } },
      });
      if (privileged <= 1) {
        return apiError("Cannot demote the only remaining privileged admin account", 400);
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

    return apiSuccess(
      updatedUser,
      `User role updated to ${ROLE_LABELS[role as Role] ?? role}`
    );
  } catch (error) {
    return handleServerError(error, "Failed to update user role");
  }
}
