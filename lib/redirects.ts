/**
 * Public CMS redirects — loaded in Node (Next.js 16 Proxy defaults to Node.js).
 */

type RedirectRow = { fromPath: string; toPath: string };

type CacheEntry = {
  map: Map<string, string>;
  loadedAt: number;
};

const CACHE_TTL_MS = 60_000;
let cache: CacheEntry | null = null;

/** Bust in-process cache after admin create/update/delete. */
export function invalidateRedirectCache() {
  cache = null;
}

function normalizeLookupPath(pathname: string): string[] {
  if (!pathname) return ["/"];
  let path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const noTrail = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  const withTrail = noTrail === "/" ? "/" : `${noTrail}/`;
  return [...new Set([path, noTrail, withTrail])];
}

export function normalizeFromPath(input: string): string {
  let path = input.trim();
  if (!path.startsWith("/")) path = `/${path}`;
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  return path;
}

async function loadActiveRedirects(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const { prisma } = await import("@/lib/prisma");
  const rows: RedirectRow[] = await prisma.redirect.findMany({
    where: { isActive: true },
    select: { fromPath: true, toPath: true },
  });
  for (const row of rows) {
    map.set(normalizeFromPath(row.fromPath), row.toPath.trim());
  }
  return map;
}

async function getRedirectMap(): Promise<Map<string, string>> {
  const now = Date.now();
  if (cache && now - cache.loadedAt < CACHE_TTL_MS) {
    return cache.map;
  }
  const map = await loadActiveRedirects();
  cache = { map, loadedAt: now };
  return map;
}

/**
 * Resolve an active CMS redirect for a public pathname.
 * Returns null when no rule matches.
 */
export async function resolvePublicRedirect(pathname: string): Promise<string | null> {
  // Never redirect system surfaces
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  ) {
    return null;
  }

  try {
    const map = await getRedirectMap();
    if (map.size === 0) return null;

    for (const candidate of normalizeLookupPath(pathname)) {
      const to = map.get(normalizeFromPath(candidate));
      if (!to) continue;
      const normalizedTo = to.trim();
      if (!normalizedTo) continue;
      // Prevent trivial loops
      if (normalizeFromPath(candidate) === normalizeFromPath(normalizedTo)) continue;
      return normalizedTo;
    }
    return null;
  } catch {
    return null;
  }
}
