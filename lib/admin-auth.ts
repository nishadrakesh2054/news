import { getServerSession } from "next-auth";
import { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { apiError } from "@/lib/api-response";
import { NextResponse } from "next/server";
import { STAFF_ROLES } from "@/constants/permissions";
import {
  isStaffRole,
  requirePermission as requirePerm,
} from "@/lib/permissions";

export { STAFF_ROLES };
export { isStaffRole };

export async function getAdminSession() {
  return getServerSession(authOptions);
}

export function hasRole(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export async function requireStaff(message = "Unauthorized: Staff access required") {
  return requireRoles(STAFF_ROLES, message);
}

export async function requireRoles(allowed: Role[], message = "Unauthorized") {
  const session = await getAdminSession();
  if (!session?.user || !hasRole(session.user.role, allowed)) {
    return { session: null, error: apiError(message, 403) as NextResponse };
  }
  return { session, error: null };
}

/** Super Admin or Admin (legacy helper — prefer requirePermission). */
export async function requireAdmin(message = "Admin access required") {
  return requireRoles([Role.SUPER_ADMIN, Role.ADMIN], message);
}

/** Super Admin, Admin, or Editor (legacy helper — prefer requirePermission). */
export async function requireEditor(message = "Editor access required") {
  return requireRoles([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR], message);
}

/** Any staff role (legacy helper — prefer requirePermission). */
export async function requireAuthor(message = "Author access required") {
  return requireRoles(STAFF_ROLES, message);
}

export async function requirePermission(
  permission: string,
  message = "Forbidden: missing permission"
) {
  return requirePerm(permission, message);
}

export function assertStaffRole(role: Role | undefined | null): boolean {
  return isStaffRole(role);
}
