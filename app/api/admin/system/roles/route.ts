import { Role } from "@prisma/client";
import { randomUUID } from "crypto";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import {
  getPermissionsForRole,
  invalidatePermissionCache,
  isSuperAdmin,
} from "@/lib/permissions";
import { requirePermission } from "@/lib/admin-auth";
import {
  ASSIGNABLE_ROLES,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_CATALOG,
  PERMISSION_MODULES,
  ROLE_LABELS,
} from "@/constants/permissions";

const MATRIX_ROLES: Role[] = [Role.ADMIN, Role.EDITOR, Role.AUTHOR];

export async function GET() {
  const auth = await requirePermission("roles.manage");
  if (auth.error) return auth.error;

  try {
    const byRole: Record<string, Record<string, boolean>> = {};

    for (const role of MATRIX_ROLES) {
      const set = await getPermissionsForRole(role);
      const map: Record<string, boolean> = {};
      for (const key of PERMISSION_CATALOG) {
        map[key] = set.has(key);
      }
      byRole[role] = map;
    }

    return apiSuccess({
      roles: Object.values(Role),
      roleLabels: ROLE_LABELS,
      assignableRoles: ASSIGNABLE_ROLES,
      matrixRoles: MATRIX_ROLES,
      modules: PERMISSION_MODULES,
      catalog: PERMISSION_CATALOG,
      permissionsByRole: byRole,
      defaults: DEFAULT_ROLE_PERMISSIONS,
      superAdmin: {
        role: Role.SUPER_ADMIN,
        label: ROLE_LABELS.SUPER_ADMIN,
        fullAccess: true,
      },
    });
  } catch (error) {
    return handleServerError(error, "Failed to load roles matrix");
  }
}

/** Save ticks for one role (ADMIN | EDITOR | AUTHOR). Super Admin only. */
export async function PUT(request: Request) {
  const auth = await requirePermission("roles.manage", "Only Super Admin can edit permissions");
  if (auth.error) return auth.error;

  if (!isSuperAdmin(auth.session?.user?.role)) {
    return apiError("Only Super Admin can edit the permission matrix", 403);
  }

  try {
    const body = await request.json();
    const role = body.role as Role;
    const permissions = body.permissions as Record<string, boolean> | undefined;

    if (!MATRIX_ROLES.includes(role)) {
      return apiError("Invalid role for matrix edit", 400);
    }
    if (!permissions || typeof permissions !== "object") {
      return apiError("permissions object required", 400);
    }

    await Promise.all(
      PERMISSION_CATALOG.map(async (permission) => {
        const allowed = Boolean(permissions[permission]);
        const existing = await prisma.rolePermission.findUnique({
          where: { role_permission: { role, permission } },
        });
        if (existing) {
          return prisma.rolePermission.update({
            where: { id: existing.id },
            data: { allowed },
          });
        }
        return prisma.rolePermission.create({
          data: {
            id: randomUUID(),
            role,
            permission,
            allowed,
          },
        });
      })
    );

    invalidatePermissionCache(role);

    await prisma.user.updateMany({
      where: { role },
      data: { sessionVersion: { increment: 1 } },
    });

    const set = await getPermissionsForRole(role);
    return apiSuccess(
      {
        role,
        permissions: Object.fromEntries(PERMISSION_CATALOG.map((k) => [k, set.has(k)])),
      },
      `Permissions updated for ${ROLE_LABELS[role]}`
    );
  } catch (error) {
    return handleServerError(error, "Failed to save role permissions");
  }
}
