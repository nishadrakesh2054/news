import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

export async function GET() {
  try {
    const redirects = await prisma.redirect.findMany({ orderBy: { createdAt: "desc" } });
    return apiSuccess(redirects);
  } catch (error) {
    return handleServerError(error, "Failed to fetch redirects");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { fromPath, toPath, isActive } = await request.json();
    if (!fromPath || !toPath) return apiError("fromPath and toPath are required");

    const redirect = await prisma.redirect.create({
      data: {
        fromPath: fromPath.trim(),
        toPath: toPath.trim(),
        isActive: isActive ?? true,
      },
    });
    return apiSuccess(redirect, "Redirect created", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create redirect");
  }
}
