import { optimizeCloudinaryUrl } from "@/lib/cloudinary-url";

/** Optimize inline body images for public article pages (lighter than ad presets). */
export function enhanceArticleBodyHtml(html: string): string {
  if (!html?.trim()) return html;

  return html.replace(
    /<img\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>/gi,
    (_full, before: string, quote: string, src: string, after: string) => {
      const optimized = optimizeCloudinaryUrl(src, "card") || src;
      const attrs = `${before}${after}`;
      const hasLoading = /\bloading\s*=/i.test(attrs);
      const hasDecoding = /\bdecoding\s*=/i.test(attrs);
      const extras = `${hasLoading ? "" : ' loading="lazy"'}${
        hasDecoding ? "" : ' decoding="async"'
      }`;
      return `<img${before}src=${quote}${optimized}${quote}${after}${extras}>`;
    }
  );
}
