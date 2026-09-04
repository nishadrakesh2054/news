import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "a",
  "img",
  "blockquote",
  "figure",
  "figcaption",
  "hr",
  "span",
  "div",
  "sub",
  "sup",
  "pre",
  "code",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
];

const ALLOWED_ATTR = [
  "class",
  "title",
  "href",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "colspan",
  "rowspan",
];

/** Reject javascript:, data:, and protocol-relative // URLs. */
function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("#")) return true;
  const lower = trimmed.toLowerCase();
  if (lower.startsWith("//")) return false;
  if (lower.startsWith("mailto:")) {
    return !lower.includes("javascript:");
  }
  if (lower.startsWith("/") && !lower.startsWith("//")) return true;
  return lower.startsWith("https://") || lower.startsWith("http://");
}

let hooksRegistered = false;

function ensureHooks() {
  if (hooksRegistered) return;
  hooksRegistered = true;
  DOMPurify.addHook("afterSanitizeAttributes", (node) => {
    if (!node || typeof (node as Element).hasAttribute !== "function") return;
    const el = node as Element;
    if (el.hasAttribute("href") && !isSafeUrl(el.getAttribute("href") || "")) {
      el.removeAttribute("href");
    }
    if (el.hasAttribute("src") && !isSafeUrl(el.getAttribute("src") || "")) {
      el.removeAttribute("src");
    }
    if (el.tagName === "A") {
      el.setAttribute("rel", "noopener noreferrer");
    }
  });
}

/** Sanitize rich HTML from the article editor before save and on public render. */
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html?.trim()) return "";
  ensureHooks();

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
    FORBID_ATTR: ["style", "onerror", "onload", "onclick"],
  });
}

/** Sanitize live-update HTML (same policy as articles). */
export function sanitizeLiveUpdateHtml(html: string | null | undefined): string {
  return sanitizeArticleHtml(html);
}

const AD_SCRIPT_HOST_ALLOWLIST = [
  "googletagmanager.com",
  "googleadservices.com",
  "googlesyndication.com",
  "doubleclick.net",
  "pagead2.googlesyndication.com",
  "adservice.google.com",
  "connect.facebook.net",
  "cdn.ampproject.org",
];

function isAllowedAdScriptSrc(src: string): boolean {
  try {
    const url = new URL(src);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return AD_SCRIPT_HOST_ALLOWLIST.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`)
    );
  } catch {
    return false;
  }
}

/**
 * Constrain ad script snippets: keep only https <script src> from known ad CDNs.
 * Inline scripts and unknown hosts are stripped.
 */
export function sanitizeAdScriptCode(code: string | null | undefined): string {
  if (!code?.trim()) return "";

  const scripts: string[] = [];
  const scriptRe = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;
  while ((match = scriptRe.exec(code)) !== null) {
    const attrs = match[1] || "";
    const srcMatch = /\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
    const src = srcMatch?.[1] ?? srcMatch?.[2] ?? srcMatch?.[3] ?? "";
    if (src && isAllowedAdScriptSrc(src)) {
      const asyncAttr = /\basync\b/i.test(attrs) ? " async" : "";
      const deferAttr = /\bdefer\b/i.test(attrs) ? " defer" : "";
      scripts.push(`<script src="${src.replace(/"/g, "")}"${asyncAttr}${deferAttr}></script>`);
    }
  }

  // Allow Google AdSense <ins class="adsbygoogle"> placeholders (no event handlers)
  const insParts: string[] = [];
  const insRe = /<ins\b([^>]*)>/gi;
  while ((match = insRe.exec(code)) !== null) {
    const attrs = match[1] || "";
    if (/on\w+\s*=/i.test(attrs)) continue;
    const classMatch = /\bclass\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
    const cls = classMatch?.[1] ?? classMatch?.[2] ?? "";
    if (!cls.includes("adsbygoogle")) continue;
    const safeAttrs = attrs
      .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
      .replace(/\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/gi, (m) =>
        /display\s*:\s*block/i.test(m) ? ' style="display:block"' : ""
      );
    insParts.push(`<ins${safeAttrs}></ins>`);
  }

  return [...scripts, ...insParts].join("\n");
}
