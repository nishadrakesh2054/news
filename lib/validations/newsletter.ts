export type NewsletterSubscribeInput = {
  email: string;
  name?: string;
  locale?: string;
  source?: string;
};

export function validateNewsletterSubscribe(body: unknown):
  | { ok: true; data: NewsletterSubscribeInput }
  | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid request body" };
  }

  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "कृपया मान्य इमेल ठेगाना दिनुहोस्" };
  }

  const name = typeof input.name === "string" ? input.name.trim() : undefined;
  const locale = typeof input.locale === "string" ? input.locale.trim() : "ne";
  const source = typeof input.source === "string" ? input.source.trim() : undefined;

  return { ok: true, data: { email, name, locale, source } };
}
