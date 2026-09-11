type WebPushModule = {
  setVapidDetails: (subject: string, publicKey: string, privateKey: string) => void;
  sendNotification: (
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload: string
  ) => Promise<void>;
};

let webpushModule: WebPushModule | null | undefined;
let configured = false;

async function getWebPush(): Promise<WebPushModule | null> {
  if (webpushModule !== undefined) return webpushModule;
  try {
    webpushModule = (await import("web-push")) as WebPushModule;
  } catch {
    webpushModule = null;
  }
  return webpushModule;
}

async function ensureWebPushConfigured() {
  if (configured) return true;

  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject = process.env.VAPID_SUBJECT?.trim() || "mailto:info@echomanch.com";

  if (!publicKey || !privateKey) {
    return false;
  }

  const webpush = await getWebPush();
  if (!webpush) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY?.trim() || null;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
  type?: string;
};

export async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  const ready = await ensureWebPushConfigured();
  if (!ready) {
    if (process.env.NODE_ENV === "development") {
      console.info("[push:dev]", subscription.endpoint.slice(0, 40), payload.title);
      return true;
    }
    return false;
  }

  try {
    const webpush = await getWebPush();
    if (!webpush) return false;

    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (error) {
    console.error("[push] delivery failed:", error);
    return false;
  }
}
