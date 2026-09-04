import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "100", 10) || 100));
    const skip = (page - 1) * limit;

    const [redirects, total] = await Promise.all([
      prisma.redirect.findMany({
        select: {
          id: true,
          fromPath: true,
          toPath: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.redirect.count(),
    ]);
    return apiSuccess({ items: redirects, page, limit, total, totalPages: Math.ceil(total / limit) || 1 });
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

    const from = String(fromPath).trim();
    const to = String(toPath).trim();
    if (!from.startsWith("/") || from.startsWith("//")) {
      return apiError("fromPath must be a same-origin absolute path");
    }
    const toOk =
      (to.startsWith("/") && !to.startsWith("//")) ||
      (() => {
        try {
          const u = new URL(to);
          return u.protocol === "https:" || u.protocol === "http:";
        } catch {
          return false;
        }
      })();
    if (!toOk) return apiError("toPath must be a relative path or http(s) URL");

    const redirect = await prisma.redirect.create({
      data: {
        fromPath: from,
        toPath: to,
        isActive: isActive ?? true,
      },
    });
    return apiSuccess(redirect, "Redirect created", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create redirect");
  }
}
