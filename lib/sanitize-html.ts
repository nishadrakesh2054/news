/**
 * SSR-safe HTML sanitizers — no jsdom / isomorphic-dompurify.
 * (Those crash on Vercel Node 24: ERR_REQUIRE_ESM in html-encoding-sniffer.)
 */

const ALLOWED_TAGS = new Set([
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
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);

const ALLOWED_ATTR = new Set([
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
]);

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

function decodeAttrValue(raw: string): string {
  return raw
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function sanitizeAttributes(tag: string, attrText: string): string {
  if (!attrText?.trim()) {
    return tag === "a" ? ' rel="noopener noreferrer"' : "";
  }

  const kept: string[] = [];
  const attrRe =
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;
  while ((match = attrRe.exec(attrText)) !== null) {
    const name = match[1].toLowerCase();
    if (name.startsWith("on")) continue;
    if (!ALLOWED_ATTR.has(name)) continue;

    const raw = match[2] ?? match[3] ?? match[4] ?? "";
    const value = decodeAttrValue(raw);

    if ((name === "href" || name === "src") && !isSafeUrl(value)) {
      continue;
    }

    const escaped = value.replace(/"/g, "&quot;");
    kept.push(`${name}="${escaped}"`);
  }

  if (tag === "a") {
    const withoutRel = kept.filter((a) => !a.startsWith("rel="));
    withoutRel.push('rel="noopener noreferrer"');
    return withoutRel.length ? ` ${withoutRel.join(" ")}` : "";
  }

  return kept.length ? ` ${kept.join(" ")}` : "";
}

/**
 * Allowlist-based sanitizer for article / live HTML.
 * Strips scripts, event handlers, and unsafe URLs without DOM APIs.
 */
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html?.trim()) return "";

  let out = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|textarea|button|svg|math|link|meta|base)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<\/?(script|style|iframe|object|embed|form|input|textarea|button|svg|math|link|meta|base)\b[^>]*\/?>/gi, "");

  out = out.replace(/<\/?([a-zA-Z][\w:-]*)(\s[^>]*)?\/?>/g, (full, rawTag: string, rawAttrs?: string) => {
    const isClose = full.startsWith("</");
    const selfClosing = /\/\s*>$/.test(full);
    const tag = rawTag.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) return "";

    if (isClose) {
      if (VOID_TAGS.has(tag)) return "";
      return `</${tag}>`;
    }

    const attrs = sanitizeAttributes(tag, rawAttrs || "");
    if (VOID_TAGS.has(tag) || selfClosing) {
      return `<${tag}${attrs} />`;
    }
    return `<${tag}${attrs}>`;
  });

  return out;
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
