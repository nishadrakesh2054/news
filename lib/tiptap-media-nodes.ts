import { Node, mergeAttributes } from "@tiptap/core";

/** YouTube / Vimeo / Facebook / Cloudinary embeds in article body. */
export const ArticleIframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      title: { default: "Embedded video" },
      frameborder: { default: "0" },
      allowfullscreen: { default: "true" },
      allow: {
        default:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      },
      class: { default: "article-embed-iframe" },
    };
  },

  parseHTML() {
    return [{ tag: "iframe[src]" }];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, string> }) {
    return ["iframe", mergeAttributes(HTMLAttributes)];
  },
});

/** Self-hosted or CDN MP4/WebM in article body. */
export const ArticleVideo = Node.create({
  name: "video",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      controls: { default: "true" },
      preload: { default: "metadata" },
      playsinline: { default: "true" },
      class: { default: "article-prose-video" },
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, string> }) {
    return ["video", mergeAttributes(HTMLAttributes)];
  },
});

export function parseVideoEmbedUrl(raw: string): string | null {
  const input = raw.trim();
  if (!input) return null;

  try {
    const u = new URL(input);
    const host = u.hostname.toLowerCase().replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const embedMatch = /^\/embed\/([^/?]+)/.exec(u.pathname);
      if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;
      const shortsMatch = /^\/shorts\/([^/?]+)/.exec(u.pathname);
      if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }

    if (host === "vimeo.com") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
    }

    if (host === "player.vimeo.com") {
      return u.protocol === "https:" ? u.toString() : null;
    }

    if (host.includes("facebook.com")) {
      return u.protocol === "https:" ? u.toString() : null;
    }

    if (host.includes("cloudinary.com") && u.pathname.includes("/video/")) {
      return u.protocol === "https:" ? u.toString() : null;
    }
  } catch {
    return null;
  }

  return null;
}
