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

const GLOBAL_ATTRS = new Set(["class", "title"]);
const TAG_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "target", "rel", "title"]),
  img: new Set(["src", "alt", "title", "width", "height"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan"]),
};

const VOID_TAGS = new Set(["br", "hr", "img"]);

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("#")) return true;
  const lower = trimmed.toLowerCase();
  return (
    lower.startsWith("https://") ||
    lower.startsWith("http://") ||
    lower.startsWith("/") ||
    lower.startsWith("mailto:")
  );
}

function sanitizeAttributes(tag: string, rawAttrs: string): string {
  const allowed = new Set([...GLOBAL_ATTRS, ...(TAG_ATTRS[tag] ?? [])]);
  const kept: string[] = [];
  const attrPattern = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(rawAttrs)) !== null) {
    const name = match[1].toLowerCase();
    if (name.startsWith("on") || name === "style" || name.startsWith("data-")) continue;
    if (!allowed.has(name)) continue;
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    if ((name === "href" || name === "src") && !isSafeUrl(value)) continue;
    const safeValue = value.replace(/"/g, "&quot;");
    kept.push(`${name}="${safeValue}"`);
  }

  if (tag === "a") {
    if (!kept.some((attr) => attr.startsWith("rel="))) {
      kept.push('rel="noopener noreferrer"');
    }
  }

  return kept.length ? ` ${kept.join(" ")}` : "";
}

/** Sanitize rich HTML from the article editor before save and on public render. */
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html?.trim()) return "";

  const withoutDangerous = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
    .replace(/<embed[\s\S]*?>/gi, "");

  return withoutDangerous.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (full, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    const closing = full.startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (closing) return VOID_TAGS.has(tag) ? "" : `</${tag}>`;
    const attrs = sanitizeAttributes(tag, rawAttrs);
    if (VOID_TAGS.has(tag)) return `<${tag}${attrs}>`;
    return `<${tag}${attrs}>`;
  });
}
