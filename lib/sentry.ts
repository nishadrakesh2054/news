import { logger } from "@/lib/logger";

/**
 * Optional Sentry-compatible error report via envelope API.
 * Set SENTRY_DSN to enable; no-ops otherwise (no SDK dependency required).
 */
export async function captureException(
  error: unknown,
  context?: Record<string, unknown>
): Promise<void> {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn) return;

  try {
    const url = new URL(dsn);
    // DSN: https://<key>@<host>/<project>
    const publicKey = url.username;
    const projectId = url.pathname.replace(/^\//, "");
    const ingest = `${url.protocol}//${url.host}/api/${projectId}/store/`;

    const err =
      error instanceof Error
        ? { type: error.name, value: error.message, stacktrace: { frames: [] } }
        : { type: "Error", value: String(error) };

    await fetch(ingest, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${publicKey}, sentry_client=echomanch/1.0`,
      },
      body: JSON.stringify({
        message: err.value,
        level: "error",
        platform: "node",
        exception: { values: [err] },
        extra: context,
        timestamp: Date.now() / 1000,
      }),
      keepalive: true,
    }).catch(() => undefined);
  } catch (e) {
    logger.warn("Sentry capture failed", { error: e });
  }
}
