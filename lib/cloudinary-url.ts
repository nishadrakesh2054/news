export type ImagePreset = "thumbnail" | "card" | "hero" | "og" | "avatar";

/** Ad delivery slots — high quality + retina (sidebar was blurry without this). */
export type AdImageSlot = "sidebar" | "leaderboard" | "sticky" | "inline";

const PRESETS: Record<ImagePreset, string> = {
  thumbnail: "c_fill,w_200,h_150,f_auto,q_auto",
  card: "c_fill,w_640,h_360,f_auto,q_auto",
  /** Large lead / main-story frames (retina ~960–1200 CSS px wide). */
  hero: "c_fill,w_1600,h_900,f_auto,q_auto:good",
  og: "c_fill,w_1200,h_630,f_auto,q_auto",
  avatar: "c_fill,w_80,h_80,f_auto,q_auto,g_face",
};

/** Prefer sharp banners: limit scale (no crop), best quality, 2× DPR. */
const AD_PRESETS: Record<AdImageSlot, string> = {
  /** ~300×250 sidebar at 2× */
  sidebar: "c_limit,w_800,q_auto:best,f_auto,dpr_2.0",
  leaderboard: "c_fit,w_1456,h_180,q_auto:best,f_auto,dpr_2.0",
  sticky: "c_fit,w_1456,h_180,q_auto:best,f_auto,dpr_2.0",
  inline: "c_limit,w_1200,q_auto:best,f_auto,dpr_2.0",
};

function hasTransformSegment(url: string): boolean {
  const uploadIdx = url.indexOf("/upload/");
  if (uploadIdx === -1) return false;
  const afterUpload = url.slice(uploadIdx + "/upload/".length);
  const firstSegment = afterUpload.split("/")[0] ?? "";
  if (!firstSegment || firstSegment.startsWith("v")) return false;
  return firstSegment.includes("_") || firstSegment.includes(",");
}

/** Apply Cloudinary delivery transforms (f_auto WebP/AVIF, responsive size, quality). */
export function optimizeCloudinaryUrl(
  url: string | null | undefined,
  preset: ImagePreset = "card"
): string | null {
  if (!url) return null;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (hasTransformSegment(url)) return url;

  const transform = PRESETS[preset];
  return url.replace("/upload/", `/upload/${transform}/`);
}

/**
 * Crisp ad image delivery. Replaces any prior upload/transform segment so ads
 * are not stuck on low-res baked transforms (common cause of blurry sidebars).
 */
export function optimizeAdImageUrl(
  url: string | null | undefined,
  slot: AdImageSlot = "sidebar"
): string | null {
  if (!url) return null;
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  const transform = AD_PRESETS[slot];
  return url.replace(/\/upload\/(?:[^/]+\/)?/, `/upload/${transform}/`);
}

export function withImagePresets<T extends { coverImage?: string | null }>(
  article: T,
  preset: ImagePreset = "card"
): T & { coverImage: string | null } {
  return {
    ...article,
    coverImage: optimizeCloudinaryUrl(article.coverImage, preset),
  };
}
