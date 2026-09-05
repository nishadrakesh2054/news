export type ImagePreset = "thumbnail" | "card" | "hero" | "og" | "avatar";

const PRESETS: Record<ImagePreset, string> = {
  thumbnail: "c_fill,w_200,h_150,f_auto,q_auto",
  card: "c_fill,w_640,h_360,f_auto,q_auto",
  /** Large lead / main-story frames (retina ~960–1200 CSS px wide). */
  hero: "c_fill,w_1920,h_1080,f_auto,q_auto:good",
  og: "c_fill,w_1200,h_630,f_auto,q_auto",
  avatar: "c_fill,w_80,h_80,f_auto,q_auto,g_face",
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

export function withImagePresets<T extends { coverImage?: string | null }>(
  article: T,
  preset: ImagePreset = "card"
): T & { coverImage: string | null } {
  return {
    ...article,
    coverImage: optimizeCloudinaryUrl(article.coverImage, preset),
  };
}
