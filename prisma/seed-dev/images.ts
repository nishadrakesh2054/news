/**
 * Free landscape image sources for seed data.
 * Prefer curated Unsplash CDN URLs (no key). Optional Unsplash/Pexels API + Cloudinary upload.
 */

export type ImageResult = {
  url: string;
  alt: string;
  source: "unsplash-cdn" | "unsplash-api" | "pexels-api" | "fallback";
  width: number;
  height: number;
};

/** Curated Unsplash photo IDs by theme — landscape ~16:9 via w=1200. */
const THEME_PHOTOS: Record<string, string[]> = {
  politics: [
    "photo-1529107386315-e1a2ed48a620",
    "photo-1541872703-74c5e44368f9",
    "photo-1523995462485-3d171b5c8fa9",
  ],
  business: [
    "photo-1486406146926-c627a92ad1ab",
    "photo-1454165804606-c3d57bc86b40",
    "photo-1460925895917-afdab827c52f",
  ],
  economy: [
    "photo-1611974789855-9c2a0a7236a3",
    "photo-1579621970563-ebecfc0b1449",
    "photo-1554224155-6726b3ff858f",
  ],
  technology: [
    "photo-1518770660439-4636190af475",
    "photo-1485827404703-89b55fcc595e",
    "photo-1677442136019-21780ecad995",
  ],
  sports: [
    "photo-1531415074968-036ba1b575da",
    "photo-1574629810360-7efbbe195018",
    "photo-1461896836934-ffe607ba6851",
  ],
  entertainment: [
    "photo-1485846234645-a62644f84728",
    "photo-1514525253161-7a46d19cd819",
    "photo-1470229722913-7c0e2dbbafd3",
  ],
  health: [
    "photo-1576091160399-112ba8d25d1d",
    "photo-1516549655169-df83a0774514",
    "photo-1584820927498-cfe5211fd8bf",
  ],
  education: [
    "photo-1523050854058-8df90110c9f1",
    "photo-1503676260728-1c00da094a0b",
    "photo-1523240795612-9a054b0db644",
  ],
  society: [
    "photo-1529156069898-49953e39b3ac",
    "photo-1469571486292-0ba58a3f068b",
    "photo-1511632765486-a01980e01a18",
  ],
  world: [
    "photo-1451187580459-43490279c0fa",
    "photo-1526778548025-fa2f459cd5c1",
    "photo-1488085061387-422e29b40080",
  ],
  lifestyle: [
    "photo-1511988617509-a57c8a288659",
    "photo-1490645935967-10de6ba17061",
    "photo-1544367567-0f2fcb009e0b",
  ],
  tourism: [
    "photo-1544735716-392fe2489ffa",
    "photo-1506905925346-21bda4d32df4",
    "photo-1585409677983-0f6c41ca9c3b",
  ],
  agriculture: [
    "photo-1500937386664-56d1dfef3859",
    "photo-1464226184884-fa280b87c399",
    "photo-1625246333195-78d9c38ad449",
  ],
  science: [
    "photo-1532094349884-543bc11b234d",
    "photo-1507413245164-6160d8298b31",
    "photo-1576086213369-97a306d36557",
  ],
  environment: [
    "photo-1441974231531-c6227db76b6e",
    "photo-1470071459604-3b5ec3a7fe05",
    "photo-1469474968028-56623f02e42e",
  ],
  national: [
    "photo-1605640840607-3a4a1d3e0f0e",
    "photo-1548013146-72479768bada",
    "photo-1587474260584-136574528ed5",
  ],
  international: [
    "photo-1526304640581-d334cdbbf46e",
    "photo-1497366754035-f200968a6e72",
    "photo-1436491865332-7a61a109cc05",
  ],
  opinion: [
    "photo-1454165804606-c3d57bc86b40",
    "photo-1504711434969-e33886168f5c",
    "photo-1585829365295-ab7cd400c167",
  ],
  australia: [
    "photo-1506973035872-a4ec16b8e8d9",
    "photo-1523482580671-df8aefe9c0b0",
    "photo-1624138784614-87fd1b6528f8",
    "photo-1545044846-351bb90d8203",
  ],
  default: [
    "photo-1504711434969-e33886168f5c",
    "photo-1495020689067-958852a1665a",
    "photo-1585829365295-ab7cd400c167",
  ],
};

const imageCache = new Map<string, ImageResult>();

function unsplashCdn(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=675&q=80`;
}

function pickThemeKey(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("australia") || q.includes("sydney") || q.includes("melbourne")) return "australia";
  for (const key of Object.keys(THEME_PHOTOS)) {
    if (key !== "default" && q.includes(key)) return key;
  }
  return "default";
}

async function tryUnsplashApi(query: string): Promise<ImageResult | null> {
  const key = process.env.IMAGE_PROVIDER_API_KEY || process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  try {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("per_page", "1");
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      results?: Array<{ urls?: { regular?: string }; alt_description?: string }>;
    };
    const hit = data.results?.[0];
    if (!hit?.urls?.regular) return null;
    return {
      url: `${hit.urls.regular}&w=1200`,
      alt: hit.alt_description || query,
      source: "unsplash-api",
      width: 1200,
      height: 675,
    };
  } catch {
    return null;
  }
}

async function tryPexelsApi(query: string): Promise<ImageResult | null> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return null;
  try {
    const url = new URL("https://api.pexels.com/v1/search");
    url.searchParams.set("query", query);
    url.searchParams.set("orientation", "landscape");
    url.searchParams.set("per_page", "1");
    const res = await fetch(url, {
      headers: { Authorization: key },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      photos?: Array<{ src?: { large?: string }; alt?: string }>;
    };
    const hit = data.photos?.[0];
    if (!hit?.src?.large) return null;
    return {
      url: hit.src.large,
      alt: hit.alt || query,
      source: "pexels-api",
      width: 1200,
      height: 675,
    };
  } catch {
    return null;
  }
}

async function maybeUploadCloudinary(url: string, publicId: string): Promise<string> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !apiKey || !apiSecret) return url;
  if (process.env.SEED_UPLOAD_CLOUDINARY !== "1") return url;

  try {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({ cloud_name: cloud, api_key: apiKey, api_secret: apiSecret, secure: true });
    const result = await cloudinary.uploader.upload(url, {
      folder: "seed-dev",
      public_id: publicId.slice(0, 100),
      overwrite: false,
      resource_type: "image",
    });
    return result.secure_url || url;
  } catch {
    return url;
  }
}

export async function resolveSeedImage(
  query: string,
  seedKey: string
): Promise<ImageResult> {
  const cacheKey = `${pickThemeKey(query)}:${seedKey}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  let result =
    (await tryUnsplashApi(query)) ||
    (await tryPexelsApi(query)) ||
    null;

  if (!result) {
    const theme = pickThemeKey(query);
    const pool = THEME_PHOTOS[theme] || THEME_PHOTOS.default;
    const idx = Math.abs(hash(seedKey)) % pool.length;
    const photoId = pool[idx];
    result = {
      url: unsplashCdn(photoId),
      alt: `${theme} news illustration`,
      source: "unsplash-cdn",
      width: 1200,
      height: 675,
    };
  }

  const finalUrl = await maybeUploadCloudinary(result.url, `seed-${seedKey}`);
  result = { ...result, url: finalUrl };
  imageCache.set(cacheKey, result);
  return result;
}

function hash(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  return h;
}
