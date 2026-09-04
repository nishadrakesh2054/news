import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import {
  findValidResetToken,
} from "@/lib/password-reset";
import { validatePassword } from "@/lib/password-policy";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`reset-password:${ip}`, 10, 60 * 60 * 1000);
    if (!rate.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const { token, password } = await request.json();
    if (!token || !password) {
      return apiError("Token and new password are required.", 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return apiError(passwordError, 400);
    }

    const resetRecord = await findValidResetToken(String(token));
    if (!resetRecord?.user) {
      return apiError("Invalid or expired reset link. Please request a new one.", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.user.id },
        data: {
          password: hashedPassword,
          sessionVersion: { increment: 1 },
        },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: resetRecord.user.id },
      }),
    ]);

    return apiSuccess({ message: "Password updated successfully. You can now sign in." });
  } catch (error) {
    return handleServerError(error, "Could not reset password.");
  }
}
