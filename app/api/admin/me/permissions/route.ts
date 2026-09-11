import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireStaff } from "@/lib/admin-auth";
import { getPermissionsForRole, isSuperAdmin } from "@/lib/permissions";
import { PERMISSION_CATALOG } from "@/constants/permissions";

export async function GET() {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const role = auth.session!.user.role;
    if (isSuperAdmin(role)) {
      return apiSuccess({
        role,
        permissions: [...PERMISSION_CATALOG],
        isSuperAdmin: true,
      });
    }

    const set = await getPermissionsForRole(role);
    return apiSuccess({
      role,
      permissions: [...set],
      isSuperAdmin: false,
    });
  } catch (error) {
    return handleServerError(error, "Failed to load permissions");
  }
}
