import { NextRequest } from "next/server";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { sendEmail } from "@/lib/mail";
import { createPasswordResetToken } from "@/lib/password-reset";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { absoluteUrl } from "@/lib/site-url";
import { SITE_CONFIG } from "@/constants/site";

const GENERIC_MESSAGE =
  "If an account exists for that email, a password reset link has been sent.";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`forgot-password:${ip}`, 5, 60 * 60 * 1000);
    if (!rate.allowed) {
      return apiError("Too many requests. Please try again later.", 429);
    }

    const { email } = await request.json();
    if (!email || typeof email !== "string") {
      return apiError("Email is required.", 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, password: true },
    });

    if (user?.password) {
      const token = await createPasswordResetToken(user.id);
      const resetUrl = absoluteUrl(`/reset-password?token=${encodeURIComponent(token)}`);

      await sendEmail({
        to: user.email,
        subject: `Reset your ${SITE_CONFIG.name} password`,
        html: `
          <p>Hi ${user.name},</p>
          <p>We received a request to reset your password. Click the link below (valid for 1 hour):</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
        text: `Reset your password: ${resetUrl}`,
      });
    }

    return apiSuccess({ message: GENERIC_MESSAGE });
  } catch (error) {
    return handleServerError(error, "Could not process password reset request.");
  }
}
