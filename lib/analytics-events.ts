import { AnalyticsEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getDeviceTypeFromUserAgent } from "@/lib/device-type";

type RecordEventInput = {
  type: AnalyticsEventType;
  path?: string;
  articleId?: string;
  adId?: string;
  referrer?: string;
  userAgent?: string;
};

export async function recordAnalyticsEvent(input: RecordEventInput) {
  const deviceType = getDeviceTypeFromUserAgent(input.userAgent);
  const hourOfDay = new Date().getHours();

  await prisma.analyticsEvent.create({
    data: {
      type: input.type,
      path: input.path,
      articleId: input.articleId,
      adId: input.adId,
      referrer: input.referrer?.slice(0, 500) || null,
      deviceType,
      hourOfDay,
    },
  });
}

export async function recordPageView(input: {
  articleId: string;
  path: string;
  referrer?: string;
  userAgent?: string;
}) {
  await Promise.all([
    recordAnalyticsEvent({
      type: AnalyticsEventType.PAGE_VIEW,
      articleId: input.articleId,
      path: input.path,
      referrer: input.referrer,
      userAgent: input.userAgent,
    }),
    prisma.article.update({
      where: { id: input.articleId },
      data: { views: { increment: 1 } },
    }),
  ]);
}

export async function recordAdImpression(input: {
  adId: string;
  path?: string;
  userAgent?: string;
}) {
  await Promise.all([
    recordAnalyticsEvent({
      type: AnalyticsEventType.AD_IMPRESSION,
      adId: input.adId,
      path: input.path,
      userAgent: input.userAgent,
    }),
    prisma.ad.update({
      where: { id: input.adId },
      data: { impressions: { increment: 1 } },
    }),
  ]);
}

export async function recordAdClick(input: {
  adId: string;
  path?: string;
  userAgent?: string;
}) {
  await Promise.all([
    recordAnalyticsEvent({
      type: AnalyticsEventType.AD_CLICK,
      adId: input.adId,
      path: input.path,
      userAgent: input.userAgent,
    }),
    prisma.ad.update({
      where: { id: input.adId },
      data: { clicks: { increment: 1 } },
    }),
  ]);
}
