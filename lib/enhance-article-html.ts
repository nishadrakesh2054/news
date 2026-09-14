import { optimizeAdImageUrl } from "@/lib/cloudinary-url";

/** Optimize inline body images for public article pages. */
export function enhanceArticleBodyHtml(html: string): string {
  if (!html?.trim()) return html;

  return html.replace(
    /<img\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>/gi,
    (_full, before: string, quote: string, src: string, after: string) => {
      const optimized = optimizeAdImageUrl(src, "inline") || src;
      return `<img${before}src=${quote}${optimized}${quote}${after}>`;
    }
  );
}
