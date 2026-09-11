import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requirePermission } from "@/lib/admin-auth";
import { isSuperAdmin } from "@/lib/permissions";
import { BCRYPT_COST, validatePassword } from "@/lib/password-policy";
import { MESSAGES } from "@/constants/messages";
import { ROLE_LABELS } from "@/constants/permissions";

const ASSIGNABLE_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.EDITOR,
  Role.AUTHOR,
  Role.READER,
];

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission("users.read");
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20), 100);
    const search = searchParams.get("search")?.trim() || "";

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              articles: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return apiSuccess({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleServerError(error, "Failed to retrieve users");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission("users.update");
    if (auth.error) return auth.error;

    const actor = auth.session!.user;
    const actorIsSuper = isSuperAdmin(actor.role);

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role as Role;

    if (!name || !email || !password) {
      return apiError(MESSAGES.SYSTEM.VALIDATION_ERROR, 400);
    }

    if (!role || !ASSIGNABLE_ROLES.includes(role)) {
      return apiError("Invalid role provided", 400);
    }

    if ((role === Role.SUPER_ADMIN || role === Role.ADMIN) && !actorIsSuper) {
      return apiError("Only Super Admin can create Admin or Super Admin users", 403);
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return apiError(passwordError, 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return apiError("Unable to create user with those details", 400);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        mustChangePassword: true,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            articles: true,
            comments: true,
          },
        },
      },
    });

    return apiSuccess(
      user,
      `User created as ${ROLE_LABELS[role] ?? role}`,
      201
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return apiError("Unable to create user with those details", 400);
    }
    return handleServerError(error, "Failed to create user");
  }
}
