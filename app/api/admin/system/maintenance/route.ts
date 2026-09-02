import { NextRequest } from "next/server";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireAdmin } from "@/lib/admin-auth";
import { getJsonSetting, setSettings } from "@/lib/settings-store";

const DEFAULT = {
  maintenanceMode: false,
  maintenanceMessage: "Site is under maintenance. Please check back soon.",
  cacheEnabled: true,
  cronEnabled: true,
};

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const config = await getJsonSetting("system_maintenance", DEFAULT);
    return apiSuccess(config);
  } catch (error) {
    return handleServerError(error, "Failed to fetch maintenance settings");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await request.json();
    await setSettings({ system_maintenance: body });
    return apiSuccess(body, "Maintenance settings saved");
  } catch (error) {
    return handleServerError(error, "Failed to save maintenance settings");
  }
}
