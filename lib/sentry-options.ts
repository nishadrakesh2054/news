import type { BrowserOptions, EdgeOptions, NodeOptions } from "@sentry/nextjs";

const isProd = process.env.NODE_ENV === "production";

export function getSentryDsn(): string | undefined {
  return (
    process.env.SENTRY_DSN?.trim() ||
    process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() ||
    undefined
  );
}

export function getBaseSentryOptions(): NodeOptions & EdgeOptions & BrowserOptions {
  const dsn = getSentryDsn();

  return {
    dsn,
    enabled: Boolean(dsn),
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
    tracesSampleRate: isProd ? 0.1 : 1,
  };
}
