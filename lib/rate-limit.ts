type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

const MAX_KEYS = 10_000;

function pruneIfNeeded() {
  if (store.size <= MAX_KEYS) return;
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
  if (store.size > MAX_KEYS) {
    const excess = store.size - Math.floor(MAX_KEYS / 2);
    let i = 0;
    for (const key of store.keys()) {
      if (i++ >= excess) break;
      store.delete(key);
    }
  }
}

/**
 * In-process rate limiter. For multi-instance production, set REDIS_URL /
 * Upstash and swap this implementation; until then limits are best-effort per instance.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSec?: number } {
  pruneIfNeeded();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  store.set(key, entry);
  return { allowed: true };
}

/** Prefer rightmost trusted proxy hop when behind a reverse proxy. */
export function getClientIp(request: Request): string {
  return getClientIpFromHeaders(request.headers);
}

/** Shared IP extraction for Request headers and Next.js `headers()`. */
export function getClientIpFromHeaders(headersList: Headers): string {
  const realIp = headersList.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    // Last hop is typically the edge proxy's view of the client on Vercel/Cloudflare
    return parts[parts.length - 1] || "unknown";
  }
  return "unknown";
}
