import { NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { SubscriberStatus } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { checkRateLimitAsync, getClientIp } from "@/lib/rate-limit";
import { validateNewsletterSubscribe } from "@/lib/validations/newsletter";
import { sendEmail } from "@/lib/mail";
import { getSiteUrl } from "@/lib/site-url";
import { SITE_CONFIG } from "@/constants/site";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = await checkRateLimitAsync(`newsletter:${ip}`, 5, 60 * 60 * 1000);
    if (!rate.allowed) {
      return apiError("धेरै प्रयास। पछि प्रयास गर्नुहोस्।", 429);
    }

    const body = await request.json();
    const validation = validateNewsletterSubscribe(body);
    if (!validation.ok) {
      return apiError(validation.error, 400);
    }

    const { email, name, locale, source } = validation.data;
    const siteUrl = getSiteUrl();
    const confirmToken = randomBytes(24).toString("hex");

    const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } });

    if (existing?.status === SubscriberStatus.ACTIVE) {
      return apiSuccess({ alreadySubscribed: true }, "तपाईं पहिले नै सदस्य हुनुहुन्छ");
    }

    const subscriber = existing
      ? await prisma.newsletterSubscriber.update({
          where: { email },
          data: {
            status: SubscriberStatus.PENDING,
            name: name ?? existing.name,
            locale: locale ?? existing.locale,
            source: source ?? existing.source,
            confirmToken,
            confirmedAt: null,
            unsubscribedAt: null,
          },
        })
      : await prisma.newsletterSubscriber.create({
          data: {
            email,
            name,
            locale,
            source,
            status: SubscriberStatus.PENDING,
            confirmToken,
          },
        });

    const confirmUrl = `${siteUrl}/api/newsletter/confirm?token=${confirmToken}`;
    await sendEmail({
      to: subscriber.email,
      subject: `${SITE_CONFIG.nameNp} — सदस्यता पुष्टि गर्नुहोस्`,
      html: `
        <p>नमस्कार! ${SITE_CONFIG.nameNp} न्यूजलेटर सदस्यता पुष्टि गर्न तलको लिङ्क क्लिक गर्नुहोस्:</p>
        <p><a href="${confirmUrl}">सदस्यता पुष्टि गर्नुहोस्</a></p>
        <p style="font-size:12px;color:#666">यदि तपाईंले यो अनुरोध गर्नुभएको होइन भने यो इमेल बेवास्ता गर्नुहोस्।</p>
      `,
      text: `Confirm your ${SITE_CONFIG.name} newsletter subscription:\n${confirmUrl}`,
    });

    return apiSuccess(
      { id: subscriber.id, pending: true },
      "पुष्टि इमेल पठाइएको छ। सदस्यता पूरा गर्न इमेल जाँच गर्नुहोस्।",
      201
    );
  } catch (error) {
    return handleServerError(error, "Failed to subscribe");
  }
}
