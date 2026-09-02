import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { NextResponse } from "next/server";

export async function getAdminSession() {
  return getServerSession(authOptions);
}

export function hasRole(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export async function requireRoles(allowed: Role[], message = "Unauthorized") {
  const session = await getAdminSession();
  if (!session?.user || !hasRole(session.user.role, allowed)) {
    return { session: null, error: apiError(message, 403) as NextResponse };
  }
  return { session, error: null };
}

export async function requireAdmin(message = "Admin access required") {
  return requireRoles([Role.ADMIN], message);
}

export async function requireEditor(message = "Editor access required") {
  return requireRoles([Role.ADMIN, Role.EDITOR], message);
}

export async function requireAuthor(message = "Author access required") {
  return requireRoles([Role.ADMIN, Role.EDITOR, Role.AUTHOR], message);
}
