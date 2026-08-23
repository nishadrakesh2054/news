import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { MESSAGES } from "@/constants/messages";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return apiError(MESSAGES.SYSTEM.VALIDATION_ERROR, 400);
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return apiError(MESSAGES.AUTH.EMAIL_EXISTS, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Security RBAC logic:
    // 1. If registering the designated admin email or if DB has 0 users -> assign ADMIN
    // 2. All other public registrations default strictly to READER
    const userCount = await prisma.user.count();
    const isAdminEmail = email.trim().toLowerCase() === "nishadrakesh2054@gmail.com";
    const userRole: Role = (userCount === 0 || isAdminEmail) ? Role.ADMIN : Role.READER;

    const user = await prisma.user.create({
      data: {
        name,
        email,
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

    return apiSuccess(user, MESSAGES.AUTH.REGISTER_SUCCESS, 201);
  } catch (error) {
    return handleServerError(error, MESSAGES.AUTH.REGISTER_ERROR);
  }
}
