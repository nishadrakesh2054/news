type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

function write(level: LogLevel, message: string, meta?: LogMeta) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }

  if (level === "error" && process.env.SENTRY_DSN) {
    void reportSentryError(message, meta);
  }
}

async function reportSentryError(message: string, meta?: LogMeta) {
  try {
    const { captureException, captureMessage, init } = await import("@sentry/nextjs");
    if (!globalThis.__sentryInitialized) {
      init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 });
      globalThis.__sentryInitialized = true;
    }
    if (meta?.error instanceof Error) {
      captureException(meta.error, { extra: meta });
    } else {
      captureMessage(message, { level: "error", extra: meta });
    }
  } catch {
    // Sentry optional — never break the app
  }
}

declare global {
  var __sentryInitialized: boolean | undefined;
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => write("debug", message, meta),
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, meta?: LogMeta) => write("error", message, meta),
};
