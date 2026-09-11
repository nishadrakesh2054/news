import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { getAdminSession } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";
import { BCRYPT_COST, validatePassword } from "@/lib/password-policy";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
        mustChangePassword: true,
      },
    });

    if (!user) return apiError("User not found", 404);
    return apiSuccess(user);
  } catch (error) {
    return handleServerError(error, "Failed to fetch profile");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const body = await request.json();
    const { name, email, password, currentPassword, image } = body;

    const existing = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
        mustChangePassword: true,
        email: true,
      },
    });
    if (!existing) return apiError("User not found", 404);

    const data: {
      name?: string;
      email?: string;
      image?: string | null;
      password?: string;
      mustChangePassword?: boolean;
      sessionVersion?: { increment: number };
    } = {};

    if (name) data.name = String(name).trim();

    const nextEmail =
      typeof email === "string" ? email.trim().toLowerCase() : undefined;
    const emailChanging =
      typeof nextEmail === "string" && nextEmail !== existing.email;

    if (nextEmail) data.email = nextEmail;

    if (image !== undefined) {
      if (image === null || image === "") {
        data.image = null;
      } else if (typeof image === "string") {
        const url = image.trim();
        if (url && !/^https?:\/\//i.test(url)) {
          return apiError("Image must be a valid URL", 400);
        }
        data.image = url || null;
      } else {
        return apiError("Invalid image value", 400);
      }
    }

    if (existing.mustChangePassword && !password) {
      return apiError("You must set a new password before continuing", 400);
    }

    if (emailChanging || password) {
      if (!existing.password) return apiError("Cannot verify password", 400);
      const valid = await bcrypt.compare(currentPassword || "", existing.password);
      if (!valid) {
        return apiError(
          emailChanging && !password
            ? "Current password is required to change email"
            : "Current password is incorrect",
          400
        );
      }
    }

    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) return apiError(passwordError, 400);

      data.password = await bcrypt.hash(password, BCRYPT_COST);
      data.mustChangePassword = false;
      data.sessionVersion = { increment: 1 };
    }

    if (emailChanging) {
      const taken = await prisma.user.findUnique({ where: { email: nextEmail } });
      if (taken) return apiError("That email is already in use", 400);
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        mustChangePassword: true,
      },
    });

    return apiSuccess(
      updated,
      password
        ? "Password updated. Sign in again with your new password."
        : "Profile updated"
    );
  } catch (error) {
    return handleServerError(error, "Failed to update profile");
  }
}
