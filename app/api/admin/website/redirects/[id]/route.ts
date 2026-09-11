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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("redirects.update");
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await request.json();

    const data: {
      fromPath?: string;
      toPath?: string;
      isActive?: boolean;
    } = {};

    if (body.fromPath !== undefined) data.fromPath = normalizeFromPath(String(body.fromPath));
    if (body.toPath !== undefined) data.toPath = String(body.toPath).trim();
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const from = data.fromPath;
    const to = data.toPath;
    if (from !== undefined || to !== undefined) {
      const existing = await prisma.redirect.findUnique({ where: { id } });
      if (!existing) return apiError("Redirect not found", 404);
      const pathError = validatePaths(from ?? existing.fromPath, to ?? existing.toPath);
      if (pathError) return apiError(pathError, 400);
    }

    if (from) {
      const clash = await prisma.redirect.findFirst({
        where: { fromPath: from, NOT: { id } },
      });
      if (clash) return apiError("A redirect from this path already exists", 400);
    }

    const redirect = await prisma.redirect.update({
      where: { id },
      data,
    });
    invalidateRedirectCache();
    return apiSuccess(redirect);
  } catch (error) {
    return handleServerError(error, "Failed to update redirect");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("redirects.delete");
    if (auth.error) return auth.error;

    const { id } = await params;
    await prisma.redirect.delete({ where: { id } });
    invalidateRedirectCache();
    return apiSuccess(null, "Redirect deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete redirect");
  }
}
