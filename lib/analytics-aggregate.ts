import { AnalyticsEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { DEVICE_LABELS, type DeviceCategory } from "@/lib/device-type";
import { getRecentMonthBuckets, startOfMonthsAgo } from "@/lib/analytics-time-series";

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
  const hourly = await prisma.analyticsEvent.groupBy({
    by: ["hourOfDay"],
    where: {
      type: AnalyticsEventType.PAGE_VIEW,
      hourOfDay: { not: null },
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    _count: { id: true },
  });

  if (hourly.length === 0) {
    return PEAK_WINDOWS.map((window) => ({
      time: window.time,
      label: window.label,
      volume: "Low" as const,
      views: 0,
    }));
  }

  const hourMap = new Map(
    hourly
      .filter((row) => row.hourOfDay !== null)
      .map((row) => [row.hourOfDay as number, row._count.id])
  );

  const counts = PEAK_WINDOWS.map((window) => ({
    ...window,
    views: window.hours.reduce((sum, hour) => sum + (hourMap.get(hour) ?? 0), 0),
  }));

  const max = Math.max(...counts.map((c) => c.views), 1);

  return counts.map((window) => ({
    time: window.time,
    label: window.label,
    volume: volumeLabel(window.views, max),
    views: window.views,
  }));
}

type MonthCountRow = { month_key: string; count: bigint };

export async function getPageViewsByMonth(months = 12) {
  const monthBuckets = getRecentMonthBuckets(months);
  const rangeStart = startOfMonthsAgo(months);

  const rows = await prisma.$queryRaw<MonthCountRow[]>`
    SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month_key,
           COUNT(*)::bigint AS count
    FROM "AnalyticsEvent"
    WHERE type = ${AnalyticsEventType.PAGE_VIEW}::"AnalyticsEventType"
      AND "createdAt" >= ${rangeStart}
    GROUP BY 1
    ORDER BY 1
  `;

  const byMonth = Object.fromEntries(
    rows.map((row) => [row.month_key, Number(row.count)])
  ) as Record<string, number>;

  return monthBuckets.map((bucket) => ({
    month: bucket.label,
    views: byMonth[bucket.key] ?? 0,
  }));
}

type UserMonthRow = { month_key: string; count: bigint };

export async function getUserGrowthByMonth(rangeStart: Date, monthBuckets: { key: string; label: string }[]) {
  const rows = await prisma.$queryRaw<UserMonthRow[]>`
    SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month_key,
           COUNT(*)::bigint AS count
    FROM "User"
    WHERE "createdAt" >= ${rangeStart}
    GROUP BY 1
    ORDER BY 1
  `;

  const byMonth = Object.fromEntries(rows.map((row) => [row.month_key, Number(row.count)]));

  return monthBuckets.map((bucket) => ({
    month: bucket.label,
    users: byMonth[bucket.key] ?? 0,
  }));
}

type ArticleMonthRow = { month_key: string; count: bigint };

export async function getArticlesPublishedByMonth(
  rangeStart: Date,
  monthBuckets: { key: string; label: string }[]
) {
  const rows = await prisma.$queryRaw<ArticleMonthRow[]>`
    SELECT to_char(date_trunc('month', COALESCE("publishedAt", "createdAt")), 'YYYY-MM') AS month_key,
           COUNT(*)::bigint AS count
    FROM "Article"
    WHERE status = ${"PUBLISHED"}::"ArticleStatus"
      AND (
        "publishedAt" >= ${rangeStart}
        OR ("publishedAt" IS NULL AND "createdAt" >= ${rangeStart})
      )
    GROUP BY 1
    ORDER BY 1
  `;

  const byMonth = Object.fromEntries(rows.map((row) => [row.month_key, Number(row.count)]));

  return monthBuckets.map((bucket) => ({
    month: bucket.label,
    articles: byMonth[bucket.key] ?? 0,
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
