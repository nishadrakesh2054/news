import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { getAdminSession } from "@/lib/admin-auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session?.user?.id) return apiError("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
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

    const { name, email, password, currentPassword } = await request.json();
    const data: { name?: string; email?: string; password?: string } = {};

    if (name) data.name = name.trim();
    if (email) data.email = email.trim().toLowerCase();

    if (password) {
      const user = await prisma.user.findUnique({ where: { id: session.user.id } });
      if (!user?.password) return apiError("Cannot update password", 400);
      const valid = await bcrypt.compare(currentPassword || "", user.password);
      if (!valid) return apiError("Current password is incorrect", 400);
      data.password = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: { id: true, name: true, email: true, role: true, image: true },
    });

    return apiSuccess(updated, "Profile updated");
  } catch (error) {
    return handleServerError(error, "Failed to update profile");
  }
}
