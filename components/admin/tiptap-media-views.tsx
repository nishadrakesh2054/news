"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import ImageExtension from "@tiptap/extension-image";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { X } from "lucide-react";
import { parseVideoEmbedUrl } from "@/lib/tiptap-media-nodes";

function RemoveMediaButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white shadow-sm transition-colors hover:bg-[#C3272E]"
      title="Remove from content"
      aria-label="Remove from content"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}

function ImageNodeView({ node, deleteNode, selected }: NodeViewProps) {
  const src = String(node.attrs.src || "");
  const alt = String(node.attrs.alt || "");

  return (
    <NodeViewWrapper className="relative my-4 block" data-drag-handle>
      <div
        className={`relative overflow-hidden rounded-xl border shadow-sm ${
          selected ? "border-[#0C4EA0] ring-2 ring-[#0C4EA0]/30" : "border-slate-200"
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="max-w-full rounded-xl" draggable={false} />
        <RemoveMediaButton onClick={deleteNode} />
      </div>
    </NodeViewWrapper>
  );
}

function VideoNodeView({ node, deleteNode, selected }: NodeViewProps) {
  const src = String(node.attrs.src || "");

  return (
    <NodeViewWrapper className="relative my-4 block" data-drag-handle>
      <div
        className={`relative overflow-hidden rounded-xl border bg-black shadow-sm ${
          selected ? "border-[#0C4EA0] ring-2 ring-[#0C4EA0]/30" : "border-slate-200"
        }`}
      >
        <video
          src={src}
          controls
          playsInline
          preload="metadata"
          className="max-h-[420px] w-full bg-black"
        />
        <RemoveMediaButton onClick={deleteNode} />
      </div>
    </NodeViewWrapper>
  );
}

function IframeNodeView({ node, deleteNode, selected }: NodeViewProps) {
  const src = String(node.attrs.src || "");
  const title = String(node.attrs.title || "Embedded video");

  return (
    <NodeViewWrapper className="relative my-4 block" data-drag-handle>
      <div
        className={`relative overflow-hidden rounded-xl border bg-black shadow-sm ${
          selected ? "border-[#0C4EA0] ring-2 ring-[#0C4EA0]/30" : "border-slate-200"
        }`}
      >
        <iframe
          src={src}
          title={title}
          className="aspect-video w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <RemoveMediaButton onClick={deleteNode} />
      </div>
    </NodeViewWrapper>
  );
}

/** TipTap image with corner remove control (editor only). */
export const RemovableImage = ImageExtension.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
}).configure({
  HTMLAttributes: {
    class: "rounded-xl max-w-full my-4 border border-slate-200 shadow-sm",
  },
});

/** CDN / uploaded video with corner remove control. */
export const RemovableVideo = Node.create({
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

  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoNodeView);
  },
});

/** YouTube / Vimeo iframe with corner remove control. */
export const RemovableIframe = Node.create({
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

  renderHTML({ HTMLAttributes }) {
    return ["iframe", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(IframeNodeView);
  },
});

export { parseVideoEmbedUrl };
