import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Prisma, Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { MESSAGES } from "@/constants/messages";
import { validatePassword, BCRYPT_COST } from "@/lib/password-policy";
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit";

/** Production blocks public register unless ALLOW_PUBLIC_REGISTER=1. */
function registrationClosed(): boolean {
  if (process.env.ALLOW_PUBLIC_REGISTER === "1") return false;
  if (process.env.DISABLE_PUBLIC_REGISTER === "1") return true;
  return process.env.NODE_ENV === "production";
}

export async function POST(request: NextRequest) {
  try {
    if (registrationClosed()) {
      return apiError(
        "Public registration is disabled. Contact an administrator for access.",
        403
      );
    }

    const ip = getClientIp(request);
    const rate = await checkRateLimitAsync(`register:${ip}`, 10, 60 * 60 * 1000);
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
    const bootstrapSecret = process.env.BOOTSTRAP_ADMIN_SECRET?.trim();
    const headerSecret = request.headers.get("x-bootstrap-secret")?.trim();

    /**
     * SUPER_ADMIN bootstrap only when:
     * - no admin exists yet, AND
     * - email matches BOOTSTRAP_ADMIN_EMAIL (if set), AND
     * - in production, BOOTSTRAP_ADMIN_SECRET must match x-bootstrap-secret header
     * Local/dev with no BOOTSTRAP_ADMIN_EMAIL: first user may still become SUPER_ADMIN.
     */
    const emailMatchesBootstrap =
      !bootstrapEmail || normalizedEmail === bootstrapEmail;
    const secretOk =
      process.env.NODE_ENV !== "production" ||
      (Boolean(bootstrapSecret) && headerSecret === bootstrapSecret);
    const bootstrapAllowed = emailMatchesBootstrap && secretOk;

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return apiError(MESSAGES.AUTH.REGISTER_ERROR, 400);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

    const user = await prisma.$transaction(
      async (tx) => {
        const adminCount = await tx.user.count({
          where: { role: { in: [Role.SUPER_ADMIN, Role.ADMIN] } },
        });

        const userRole: Role =
          adminCount === 0 && bootstrapAllowed ? Role.SUPER_ADMIN : Role.READER;

        return tx.user.create({
          data: {
            name: String(name).trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: userRole,
            mustChangePassword: false,
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
      return apiError(MESSAGES.AUTH.REGISTER_ERROR, 400);
    }
    return handleServerError(error, MESSAGES.AUTH.REGISTER_ERROR);
  }
}
