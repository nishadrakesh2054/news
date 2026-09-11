import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api-response";
import {
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_CATALOG,
  type PermissionKey,
  STAFF_ROLES,
  isPermissionKey,
} from "@/constants/permissions";

type CacheEntry = { permissions: Set<string>; expiresAt: number };

const CACHE_TTL_MS = 30_000;
const rolePermCache = new Map<Role, CacheEntry>();

export function invalidatePermissionCache(role?: Role) {
  if (role) {
    rolePermCache.delete(role);
    return;
  }
  rolePermCache.clear();
}

function allPermissionSet() {
  return new Set<string>(PERMISSION_CATALOG);
}

/** Resolve allowed permission keys for a role (SUPER_ADMIN → all). */
export async function getPermissionsForRole(role: Role): Promise<Set<string>> {
  if (role === Role.SUPER_ADMIN) {
    return allPermissionSet();
  }
  if (role === Role.READER) {
    return new Set();
  }

  const cached = rolePermCache.get(role);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.permissions;
  }

  const rows = await prisma.rolePermission.findMany({
    where: { role, allowed: true },
    select: { permission: true },
  });

  let permissions: Set<string>;
  if (rows.length === 0) {
    // Fallback to seeded defaults if matrix not yet written
    const defaults =
      role === Role.ADMIN || role === Role.EDITOR || role === Role.AUTHOR
        ? DEFAULT_ROLE_PERMISSIONS[role]
        : [];
    permissions = new Set(defaults);
  } else {
    permissions = new Set(rows.map((r) => r.permission));
  }

  rolePermCache.set(role, {
    permissions,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
  return permissions;
}

export function roleHasPermission(permissions: Set<string>, permission: string): boolean {
  return permissions.has(permission);
}

export async function canRole(role: Role | undefined | null, permission: string): Promise<boolean> {
  if (!role) return false;
  if (role === Role.SUPER_ADMIN) return true;
  if (!isPermissionKey(permission) && !(PERMISSION_CATALOG as readonly string[]).includes(permission)) {
    // allow unknown keys only if explicitly stored; still check set
  }
  const perms = await getPermissionsForRole(role);
  return roleHasPermission(perms, permission);
}

export async function can(
  session: Session | null | undefined,
  permission: string
): Promise<boolean> {
  return canRole(session?.user?.role, permission);
}

export async function requirePermission(
  permission: PermissionKey | string,
  message = "Forbidden: missing permission"
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session: null, error: apiError("Unauthorized", 401) as NextResponse };
  }
  const ok = await can(session, permission);
  if (!ok) {
    return { session: null, error: apiError(message, 403) as NextResponse };
  }
  return { session, error: null };
}

export async function requireAnyPermission(
  permissions: string[],
  message = "Forbidden: missing permission"
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session: null, error: apiError("Unauthorized", 401) as NextResponse };
  }
  for (const p of permissions) {
    if (await can(session, p)) {
      return { session, error: null };
    }
  }
  return { session: null, error: apiError(message, 403) as NextResponse };
}

export function isStaffRole(role: Role | undefined | null): role is Role {
  return role !== undefined && role !== null && STAFF_ROLES.includes(role);
}

export function isSuperAdmin(role: Role | undefined | null): boolean {
  return role === Role.SUPER_ADMIN;
}

/** Seed / reset RolePermission rows for ADMIN, EDITOR, AUTHOR from defaults. */
export async function seedDefaultRolePermissions() {
  const roles: Array<"ADMIN" | "EDITOR" | "AUTHOR"> = ["ADMIN", "EDITOR", "AUTHOR"];

  for (const role of roles) {
    const allowed = new Set<string>(DEFAULT_ROLE_PERMISSIONS[role]);
    for (const permission of PERMISSION_CATALOG) {
      await prisma.rolePermission.upsert({
        where: { role_permission: { role: role as Role, permission } },
        create: { role: role as Role, permission, allowed: allowed.has(permission) },
        update: { allowed: allowed.has(permission) },
      });
    }
  }

  invalidatePermissionCache();
}
