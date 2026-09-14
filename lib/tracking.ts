/**
 * Public tracking IDs — env wins, then admin Traffic settings.
 */
import { getJsonSetting } from "@/lib/settings-store";
import {
  DEFAULT_TRAFFIC_CONFIG,
  TRAFFIC_ANALYTICS_KEY,
  type TrafficAnalyticsConfig,
} from "@/lib/analytics-aggregate";

function trimEnv(value: string | undefined): string {
  return value?.trim() || "";
}

export function getEnvTrackingIds(): TrafficAnalyticsConfig {
  return {
    ga4Id: trimEnv(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    gtmId: trimEnv(process.env.NEXT_PUBLIC_GTM_ID),
    fbPixelId: trimEnv(process.env.NEXT_PUBLIC_FB_PIXEL_ID),
  };
}

export async function resolveTrackingConfig(): Promise<TrafficAnalyticsConfig> {
  const env = getEnvTrackingIds();
  const fromDb = await getJsonSetting<TrafficAnalyticsConfig>(
    TRAFFIC_ANALYTICS_KEY,
    DEFAULT_TRAFFIC_CONFIG
  );

  return {
    ga4Id: env.ga4Id || fromDb.ga4Id || "",
    gtmId: env.gtmId || fromDb.gtmId || "",
    fbPixelId: env.fbPixelId || fromDb.fbPixelId || "",
  };
}
