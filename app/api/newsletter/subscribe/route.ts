import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriberStatus } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateNewsletterSubscribe } from "@/lib/validations/newsletter";
import { sendEmail } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`newsletter:${ip}`, 5, 60 * 60 * 1000);
    if (!rate.allowed) {
      return apiError("धेरै प्रयास। पछि प्रयास गर्नुहोस्।", 429);
    }

    const body = await request.json();
    const validation = validateNewsletterSubscribe(body);
    if (!validation.ok) {
      return apiError(validation.error, 400);
    }

    const { email, name, locale, source } = validation.data;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nepalkhabar.com";

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

    if (existing?.status === SubscriberStatus.ACTIVE) {
      return apiSuccess({ alreadySubscribed: true }, "तपाईं पहिले नै सदस्य हुनुहुन्छ");
    }

    const subscriber = existing
      ? await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            status: SubscriberStatus.ACTIVE,
            name: name ?? existing.name,
            locale: locale ?? existing.locale,
            source: source ?? existing.source,
            confirmedAt: new Date(),
            unsubscribedAt: null,
          },
        })
      : await prisma.newsletterSubscriber.create({
          data: {
            email,
            name,
            locale,
            source,
            status: SubscriberStatus.ACTIVE,
            confirmedAt: new Date(),
          },
        });

    const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${subscriber.unsubscribeToken}`;
    await sendEmail({
      to: subscriber.email,
      subject: "नेपाल खबर न्यूजलेटरमा स्वागत छ",
      html: `
        <p>धन्यवाद! तपाईं नेपाल खबर न्यूजलेटरमा सदस्य भएको छ।</p>
        <p><a href="${siteUrl}">साइट हेर्नुहोस्</a></p>
        <p style="font-size:12px;color:#666"><a href="${unsubscribeUrl}">Unsubscribe</a></p>
      `,
      text: `Thank you for subscribing to Nepal Khabar newsletter.\nUnsubscribe: ${unsubscribeUrl}`,
    });

    return apiSuccess(
      { id: subscriber.id },
      "न्यूजलेटर सदस्यता सफल भयो। धन्यवाद!",
      201
    );
  } catch (error) {
    return handleServerError(error, "Failed to subscribe");
  }
}
