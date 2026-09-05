import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { MESSAGES } from "@/constants/messages";
import { validatePassword } from "@/lib/password-policy";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`register:${ip}`, 10, 60 * 60 * 1000);
    if (!rate.allowed) {
      return apiError("Too many registration attempts. Please try again later.", 429);
    }

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return apiError(MESSAGES.SYSTEM.VALIDATION_ERROR, 400);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return apiError(passwordError, 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return apiError(MESSAGES.AUTH.EMAIL_EXISTS, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Serializable txn: only one first-admin race winner; others become READER.
    const user = await prisma.$transaction(
      async (tx) => {
        const adminCount = await tx.user.count({ where: { role: Role.ADMIN } });
        const userRole: Role =
          adminCount === 0 &&
          (!bootstrapEmail || normalizedEmail === bootstrapEmail)
            ? Role.ADMIN
            : Role.READER;

        return tx.user.create({
          data: {
            name: String(name).trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: userRole,
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return apiSuccess(user, MESSAGES.AUTH.REGISTER_SUCCESS, 201);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiError(MESSAGES.AUTH.EMAIL_EXISTS, 400);
    }
    return handleServerError(error, MESSAGES.AUTH.REGISTER_ERROR);
  }
}
