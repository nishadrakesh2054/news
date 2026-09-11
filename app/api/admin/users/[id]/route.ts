import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requirePermission } from "@/lib/admin-auth";
import { isSuperAdmin } from "@/lib/permissions";
import { BCRYPT_COST, validatePassword } from "@/lib/password-policy";
import { MESSAGES } from "@/constants/messages";

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
    const body = await request.json();

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    if (targetUser.role === Role.SUPER_ADMIN && !actorIsSuper) {
      return apiError("Only Super Admin can edit a Super Admin", 403);
    }

    const name =
      typeof body.name === "string" ? body.name.trim() : undefined;
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
    const password =
      typeof body.password === "string" && body.password.length > 0
        ? body.password
        : undefined;
    const isActive =
      typeof body.isActive === "boolean" ? body.isActive : undefined;

    if (name !== undefined && !name) {
      return apiError("Name is required", 400);
    }
    if (email !== undefined && !email) {
      return apiError("Email is required", 400);
    }
    if (
      name === undefined &&
      email === undefined &&
      password === undefined &&
      isActive === undefined
    ) {
      return apiError(MESSAGES.SYSTEM.VALIDATION_ERROR, 400);
    }

    if (isActive === false && targetUser.id === actor.id) {
      return apiError("You cannot disable your own account", 400);
    }

    if (isActive === false && targetUser.role === Role.SUPER_ADMIN) {
      const superCount = await prisma.user.count({
        where: { role: Role.SUPER_ADMIN, isActive: true },
      });
      if (superCount <= 1) {
        return apiError("Cannot disable the only active Super Admin", 400);
      }
    }

    if (password !== undefined) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        return apiError(passwordError, 400);
      }
    }

    if (email && email !== targetUser.email) {
      const taken = await prisma.user.findUnique({ where: { email } });
      if (taken) {
        return apiError(MESSAGES.AUTH.EMAIL_EXISTS, 400);
      }
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
      isActive?: boolean;
      mustChangePassword?: boolean;
      sessionVersion?: { increment: number };
    } = {};

    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (isActive !== undefined) {
      data.isActive = isActive;
      if (isActive === false) {
        data.sessionVersion = { increment: 1 };
      }
    }
    if (password !== undefined) {
      data.password = await bcrypt.hash(password, BCRYPT_COST);
      data.mustChangePassword = true;
      data.sessionVersion = { increment: 1 };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            articles: true,
            comments: true,
          },
        },
      },
    });

    return apiSuccess(updatedUser, "User updated");
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiError(MESSAGES.AUTH.EMAIL_EXISTS, 400);
    }
    return handleServerError(error, "Failed to update user");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("users.delete");
    if (auth.error) return auth.error;

    const actor = auth.session!.user;
    const actorIsSuper = isSuperAdmin(actor.role);
    const { id } = await params;

    if (id === actor.id) {
      return apiError("You cannot delete your own account", 400);
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, name: true },
    });
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    if (targetUser.role === Role.SUPER_ADMIN && !actorIsSuper) {
      return apiError("Only Super Admin can delete a Super Admin", 403);
    }

    if (targetUser.role === Role.SUPER_ADMIN) {
      const superCount = await prisma.user.count({ where: { role: Role.SUPER_ADMIN } });
      if (superCount <= 1) {
        return apiError("Cannot delete the only Super Admin", 400);
      }
    }

    await prisma.user.delete({ where: { id } });
    return apiSuccess(null, "User deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete user");
  }
}
