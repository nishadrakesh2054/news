import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

export function getSentryDsn(): string | undefined {
  return (
    process.env.SENTRY_DSN?.trim() ||
    process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() ||
    undefined
  );
}

/** Sentry is production-only by default — enabling in dev slows `next dev` a lot. */
export function isSentryEnabled(): boolean {
  if (process.env.SENTRY_ENABLE_DEV === "true") {
    return Boolean(getSentryDsn());
  }
  return isProd && Boolean(getSentryDsn());
}

export function getBaseSentryOptions(): NodeOptions & EdgeOptions & BrowserOptions {
  const dsn = getSentryDsn();

  return {
    dsn,
    enabled: isSentryEnabled(),
    environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || process.env.NODE_ENV,
    tracesSampleRate: isProd ? 0.1 : 1,
  };
}
