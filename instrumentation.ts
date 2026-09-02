export async function register() {
  if (process.env.NODE_ENV !== "production") return;

  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

// Avoid importing @sentry/nextjs at module load — it slows/blocks Turbopack dev compiles.
export async function onRequestError(
  ...args: Parameters<
    typeof import("@sentry/nextjs").captureRequestError
  >
) {
  if (process.env.NODE_ENV !== "production") return;
  if (!process.env.SENTRY_DSN?.trim()) return;

  const Sentry = await import("@sentry/nextjs");
  return Sentry.captureRequestError(...args);
}
