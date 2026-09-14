import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SubscriberStatus } from "@prisma/client";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")?.trim();
  const siteUrl = getSiteUrl();

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/?newsletter=invalid`);
  }

  try {
    const subscriber = await prisma.newsletterSubscriber.findFirst({
      where: { confirmToken: token, status: SubscriberStatus.PENDING },
    });

    if (!subscriber) {
      return NextResponse.redirect(`${siteUrl}/?newsletter=invalid`);
    }

    await prisma.newsletterSubscriber.update({
      where: { id: subscriber.id },
      data: {
        status: SubscriberStatus.ACTIVE,
        confirmedAt: new Date(),
        confirmToken: null,
      },
    });

    return NextResponse.redirect(`${siteUrl}/?newsletter=confirmed`);
  } catch {
    return NextResponse.redirect(`${siteUrl}/?newsletter=error`);
  }
}
