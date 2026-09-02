import { NextRequest } from "next/server";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { verifyCronSecret } from "@/lib/admin-auth";
import { getJsonSetting } from "@/lib/settings-store";
import { processScheduledNotifications } from "@/lib/notification-dispatch";

const DEFAULT_MAINTENANCE = {
  maintenanceMode: false,
  maintenanceMessage: "Site is under maintenance. Please check back soon.",
  cacheEnabled: true,
  cronEnabled: true,
};

export async function GET(request: NextRequest) {
  try {
    const authError = verifyCronSecret(request);
    if (authError) return authError;

    const maintenance = await getJsonSetting("system_maintenance", DEFAULT_MAINTENANCE);
    if (!maintenance.cronEnabled) {
      return apiSuccess({ sentCount: 0 }, "Cron is disabled in maintenance settings.");
    }

    const results = await processScheduledNotifications();

    return apiSuccess(
      { sentCount: results.length, results },
      results.length > 0 ? `Dispatched ${results.length} scheduled notifications` : "No notifications due"
    );
  } catch (error) {
    return handleServerError(error, "Failed to send scheduled notifications");
  }
}
