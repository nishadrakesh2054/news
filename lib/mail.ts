import { getJsonSetting } from "@/lib/settings-store";

export type MailConfig = {
  resendApiKey: string;
  fromEmail: string;
  fromName: string;
};

const MAIL_SETTINGS_KEY = "mail_config";

export const DEFAULT_MAIL_CONFIG: MailConfig = {
  resendApiKey: "",
  fromEmail: "",
  fromName: "Echo Manch",
};

export async function getMailConfig(): Promise<MailConfig> {
  const envKey = process.env.RESEND_API_KEY?.trim() ?? "";
  const stored = await getJsonSetting<MailConfig>(MAIL_SETTINGS_KEY, DEFAULT_MAIL_CONFIG);
  return {
    ...DEFAULT_MAIL_CONFIG,
    ...stored,
    resendApiKey: stored.resendApiKey || envKey,
    fromEmail: stored.fromEmail || process.env.MAIL_FROM_EMAIL?.trim() || "",
    fromName: stored.fromName || process.env.MAIL_FROM_NAME?.trim() || DEFAULT_MAIL_CONFIG.fromName,
  };
}

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{ sent: boolean; reason?: string }> {
  const config = await getMailConfig();

  if (!config.resendApiKey || !config.fromEmail) {
    if (process.env.NODE_ENV === "development") {
      console.info("[mail:dev]", input.to, input.subject);
      return { sent: true, reason: "logged-in-dev" };
    }
    return { sent: false, reason: "mail-not-configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[mail] Resend error:", err);
    return { sent: false, reason: "provider-error" };
  }

  return { sent: true };
}
