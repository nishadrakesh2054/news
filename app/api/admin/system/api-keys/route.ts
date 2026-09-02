import { NextRequest } from "next/server";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const keys = await prisma.apiKey.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
    return apiSuccess(keys);
  } catch (error) {
    return handleServerError(error, "Failed to fetch API keys");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { name } = await request.json();
    if (!name) return apiError("Key name is required");

    const rawKey = `em_${randomBytes(24).toString("hex")}`;
    const keyPrefix = rawKey.slice(0, 10);
    const keyHash = createHash("sha256").update(rawKey).digest("hex");

    const apiKey = await prisma.apiKey.create({
      data: {
        name: name.trim(),
        keyPrefix,
        keyHash,
        createdBy: auth.session!.user.id,
      },
    });

    return apiSuccess({ ...apiKey, rawKey }, "API key created — copy it now", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create API key");
  }
}
