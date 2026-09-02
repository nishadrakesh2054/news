import DOMPurify from "isomorphic-dompurify";

const ARTICLE_CONFIG: Parameters<typeof DOMPurify.sanitize>[1] = {
  ALLOWED_TAGS: [
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
  ],
  ALLOWED_ATTR: [
    "href",
    "src",
    "alt",
    "title",
    "class",
    "target",
    "rel",
    "width",
    "height",
    "colspan",
    "rowspan",
  ],
  ALLOW_DATA_ATTR: false,
  ADD_ATTR: ["target"],
  FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "input", "style", "link", "meta", "base"],
};

/** Sanitize rich HTML from the article editor before save and on public render. */
export function sanitizeArticleHtml(html: string | null | undefined): string {
  if (!html?.trim()) return "";
  return DOMPurify.sanitize(html, ARTICLE_CONFIG);
}
