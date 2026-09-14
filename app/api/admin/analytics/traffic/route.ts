import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requirePermission } from "@/lib/admin-auth";
import { setSettings } from "@/lib/settings-store";
import {
  getDeviceBreakdown,
  getPeakHours,
  TRAFFIC_ANALYTICS_KEY,
} from "@/lib/analytics-aggregate";
import { resolveTrackingConfig } from "@/lib/tracking";
import { sanitizeTrackingConfig } from "@/lib/tracking-ids";

export async function GET() {
  try {
    const auth = await requirePermission("analytics.read");
    if (auth.error) return auth.error;

    const totalViews = await prisma.article.aggregate({ _sum: { views: true } });
    const published = await prisma.article.count({ where: { status: "PUBLISHED" } });

    const trafficConfig = await resolveTrackingConfig();

    const [devices, peakHours] = await Promise.all([getDeviceBreakdown(), getPeakHours()]);

    return apiSuccess({
      totalViews: totalViews._sum.views || 0,
      publishedArticles: published,
      ga4Id: trafficConfig.ga4Id,
      gtmId: trafficConfig.gtmId,
      fbPixelId: trafficConfig.fbPixelId,
      devices: devices.map((device) => ({
        name: device.name,
        percentage: device.percentage,
        views: device.views,
      })),
      peakHours: peakHours.map((window) => ({
        time: window.time,
        label: window.label,
        volume: window.volume,
        views: window.views,
      })),
    });
  } catch (error) {
    return handleServerError(error, "Failed to fetch traffic analytics");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Writing tracking IDs requires SEO update (not analytics.read).
    const auth = await requirePermission("seo.update");
    if (auth.error) return auth.error;

    const body = await request.json();
    const validated = sanitizeTrackingConfig(body);
    if (!validated.ok) {
      return apiError(validated.error, 400);
    }

    await setSettings({
      [TRAFFIC_ANALYTICS_KEY]: JSON.stringify(validated.config),
    });

    return apiSuccess(validated.config, "Tracking configuration saved");
  } catch (error) {
    return handleServerError(error, "Failed to save traffic configuration");
  }
}
