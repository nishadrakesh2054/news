import { Notification, NotificationType, SubscriberStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import { sendWebPush } from "@/lib/web-push";

function displayTitle(notification: Notification) {
  return notification.titleNp || notification.title;
}

function buildEmailHtml(notification: Notification, unsubscribeUrl?: string) {
  const title = displayTitle(notification);
  const link = notification.linkUrl
    ? `<p><a href="${notification.linkUrl}">पूरा पढ्नुहोस् / Read more</a></p>`
    : "";
  const footer = unsubscribeUrl
    ? `<p style="font-size:12px;color:#666"><a href="${unsubscribeUrl}">Unsubscribe</a></p>`
    : "";

  return `
    <div style="font-family:sans-serif;max-width:600px">
      <h2>${title}</h2>
      <p>${notification.body.replace(/\n/g, "<br/>")}</p>
      ${link}
      ${footer}
    </div>
  `;
}

export async function dispatchNotification(notificationId: string) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) {
    throw new Error("Notification not found");
  }

  if (notification.status === "SENT") {
    return { pushDelivered: notification.pushDelivered, emailDelivered: notification.emailDelivered };
  }

  let pushDelivered = 0;
  let emailDelivered = 0;

  const payload = {
    title: displayTitle(notification),
    body: notification.body.slice(0, 180),
    url: notification.linkUrl ?? "/",
    tag: notification.id,
    type: notification.type,
  };

  if (notification.sendPush) {
    const breakingOnly = notification.type === NotificationType.BREAKING;
    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        isActive: true,
        ...(breakingOnly ? { breakingOnly: true } : {}),
      },
    });

    for (const sub of subscriptions) {
      const ok = await sendWebPush(
        { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
        payload
      );
      if (ok) pushDelivered += 1;
    }
  }

  if (notification.sendEmail) {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      where: { status: SubscriberStatus.ACTIVE },
      select: { email: true, unsubscribeToken: true },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nepalkhabar.com";

    for (const subscriber of subscribers) {
      const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;
      const result = await sendEmail({
        to: subscriber.email,
        subject: displayTitle(notification),
        html: buildEmailHtml(notification, unsubscribeUrl),
        text: `${displayTitle(notification)}\n\n${notification.body}`,
      });
      if (result.sent) emailDelivered += 1;
    }
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      status: "SENT",
      sentAt: new Date(),
      pushDelivered,
      emailDelivered,
    },
  });

  return { pushDelivered, emailDelivered };
}

export async function sendBreakingArticlePush(input: {
  title: string;
  titleNp?: string | null;
  slug: string;
}) {
  const title = input.titleNp || input.title;
  const linkUrl = `/article/${input.slug}`;

  const notification = await prisma.notification.create({
    data: {
      title: input.title,
      titleNp: input.titleNp,
      body: title,
      type: NotificationType.BREAKING,
      status: "DRAFT",
      linkUrl,
      sendPush: true,
      sendEmail: false,
    },
  });

  return dispatchNotification(notification.id);
}

export async function processScheduledNotifications() {
  const now = new Date();
  const due = await prisma.notification.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: now },
    },
    select: { id: true },
  });

  const results = [];
  for (const item of due) {
    results.push({ id: item.id, ...(await dispatchNotification(item.id)) });
  }

  return results;
}
