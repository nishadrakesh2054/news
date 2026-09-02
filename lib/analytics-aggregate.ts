import { AnalyticsEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEVICE_LABELS, type DeviceCategory } from "@/lib/device-type";
import { countByMonth, getRecentMonthBuckets, startOfMonthsAgo } from "@/lib/analytics-time-series";

const PEAK_WINDOWS = [
  { key: "morning", time: "06:00 AM - 10:00 AM", label: "Morning News Rush", hours: [6, 7, 8, 9, 10] },
  { key: "midday", time: "11:00 AM - 02:00 PM", label: "Lunch Hour Highlights", hours: [11, 12, 13, 14] },
  { key: "evening", time: "05:00 PM - 10:00 PM", label: "Evening Recap & Prime Time", hours: [17, 18, 19, 20, 21, 22] },
  { key: "night", time: "11:00 PM - 05:00 AM", label: "Late Night / Early Morning", hours: [23, 0, 1, 2, 3, 4, 5] },
];

function volumeLabel(count: number, max: number): string {
  if (max === 0) return "Low";
  const ratio = count / max;
  if (ratio >= 0.75) return "Peak";
  if (ratio >= 0.45) return "High";
  if (ratio >= 0.2) return "Medium";
  return "Low";
}

export async function getDeviceBreakdown(since?: Date) {
  const events = await prisma.analyticsEvent.groupBy({
    by: ["deviceType"],
    where: {
      type: AnalyticsEventType.PAGE_VIEW,
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    _count: { id: true },
  });

  const total = events.reduce((sum, row) => sum + row._count.id, 0);

  if (total === 0) {
    return [
      { name: DEVICE_LABELS.mobile, percentage: 0, views: 0 },
      { name: DEVICE_LABELS.desktop, percentage: 0, views: 0 },
      { name: DEVICE_LABELS.tablet, percentage: 0, views: 0 },
    ];
  }

  const order: DeviceCategory[] = ["mobile", "desktop", "tablet", "unknown"];
  return order
    .map((device) => {
      const row = events.find((e) => e.deviceType === device);
      const views = row?._count.id ?? 0;
      return {
        name: DEVICE_LABELS[device],
        percentage: Number(((views / total) * 100).toFixed(1)),
        views,
      };
    })
    .filter((item) => item.views > 0);
}

export async function getPeakHours(since?: Date) {
  const events = await prisma.analyticsEvent.findMany({
    where: {
      type: AnalyticsEventType.PAGE_VIEW,
      hourOfDay: { not: null },
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    select: { hourOfDay: true },
  });

  if (events.length === 0) {
    return PEAK_WINDOWS.map((window) => ({
      time: window.time,
      label: window.label,
      volume: "Low" as const,
      views: 0,
    }));
  }

  const counts = PEAK_WINDOWS.map((window) => ({
    ...window,
    views: events.filter((e) => e.hourOfDay !== null && window.hours.includes(e.hourOfDay)).length,
  }));

  const max = Math.max(...counts.map((c) => c.views), 1);

  return counts.map((window) => ({
    time: window.time,
    label: window.label,
    volume: volumeLabel(window.views, max),
    views: window.views,
  }));
}

export async function getPageViewsByMonth(months = 12) {
  const monthBuckets = getRecentMonthBuckets(months);
  const rangeStart = startOfMonthsAgo(months);

  const events = await prisma.analyticsEvent.findMany({
    where: {
      type: AnalyticsEventType.PAGE_VIEW,
      createdAt: { gte: rangeStart },
    },
    select: { createdAt: true },
  });

  const byMonth = countByMonth(events, (event) => event.createdAt, monthBuckets);

  return monthBuckets.map((bucket) => ({
    month: bucket.label,
    views: byMonth[bucket.key],
  }));
}

export async function getAdPerformanceSummary() {
  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      title: true,
      slot: true,
      impressions: true,
      clicks: true,
      isActive: true,
    },
    orderBy: { impressions: "desc" },
  });

  return ads.map((ad) => ({
    ...ad,
    ctr: ad.impressions > 0 ? Number(((ad.clicks / ad.impressions) * 100).toFixed(2)) : 0,
  }));
}

export const TRAFFIC_ANALYTICS_KEY = "traffic_analytics";

export type TrafficAnalyticsConfig = {
  ga4Id: string;
  gtmId: string;
  fbPixelId: string;
};

export const DEFAULT_TRAFFIC_CONFIG: TrafficAnalyticsConfig = {
  ga4Id: "",
  gtmId: "",
  fbPixelId: "",
};
