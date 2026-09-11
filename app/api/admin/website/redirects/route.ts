import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requirePermission } from "@/lib/admin-auth";
import { invalidateRedirectCache, normalizeFromPath } from "@/lib/redirects";

function validatePaths(fromPath: string, toPath: string): string | null {
  const from = normalizeFromPath(fromPath);
  const to = toPath.trim();
  if (!from.startsWith("/") || from.startsWith("//")) {
    return "From path must be a same-origin path starting with /";
  }
  if (from.startsWith("/admin") || from.startsWith("/api")) {
    return "Cannot redirect from /admin or /api paths";
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
  if (!toOk) return "To must be a relative path (/…) or http(s) URL";
  if (to.startsWith("/") && normalizeFromPath(to) === from) {
    return "From and to paths cannot be the same";
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requirePermission("redirects.read");
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
    return apiSuccess({
      items: redirects,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    return handleServerError(error, "Failed to fetch redirects");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission("redirects.create");
    if (auth.error) return auth.error;

    const { fromPath, toPath, isActive } = await request.json();
    if (!fromPath || !toPath) return apiError("fromPath and toPath are required");

    const from = normalizeFromPath(String(fromPath));
    const to = String(toPath).trim();
    const pathError = validatePaths(from, to);
    if (pathError) return apiError(pathError, 400);

    const existing = await prisma.redirect.findUnique({ where: { fromPath: from } });
    if (existing) {
      return apiError("A redirect from this path already exists", 400);
    }

    const redirect = await prisma.redirect.create({
      data: {
        fromPath: from,
        toPath: to,
        isActive: isActive ?? true,
      },
    });
    invalidateRedirectCache();
    return apiSuccess(redirect, "Redirect created", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create redirect");
  }
}
