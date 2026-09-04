import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { getJsonSetting, setSettings } from "@/lib/settings-store";
import {
  DEFAULT_TRAFFIC_CONFIG,
  getDeviceBreakdown,
  getPeakHours,
  TRAFFIC_ANALYTICS_KEY,
  type TrafficAnalyticsConfig,
} from "@/lib/analytics-aggregate";

export async function GET() {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const totalViews = await prisma.article.aggregate({ _sum: { views: true } });
    const published = await prisma.article.count({ where: { status: "PUBLISHED" } });

    const trafficConfig = await getJsonSetting<TrafficAnalyticsConfig>(
      TRAFFIC_ANALYTICS_KEY,
      DEFAULT_TRAFFIC_CONFIG
    );

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
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const body = await request.json();
    const ga4Id = typeof body.ga4Id === "string" ? body.ga4Id.trim() : "";
    const gtmId = typeof body.gtmId === "string" ? body.gtmId.trim() : "";
    const fbPixelId = typeof body.fbPixelId === "string" ? body.fbPixelId.trim() : "";

    const config: TrafficAnalyticsConfig = { ga4Id, gtmId, fbPixelId };
    await setSettings({ [TRAFFIC_ANALYTICS_KEY]: JSON.stringify(config) });

    return apiSuccess(config, "Tracking configuration saved");
  } catch (error) {
    return handleServerError(error, "Failed to save traffic configuration");
  }
}
