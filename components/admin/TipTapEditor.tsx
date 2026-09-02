"use client";

import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import ImageExtension from "@tiptap/extension-image";
import UnderlineExtension from "@tiptap/extension-underline";
import PlaceholderExtension from "@tiptap/extension-placeholder";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Undo,
  Redo,
  RemoveFormatting,
  Code,
  GripVertical,
  Trash2,
  X,
  Plus,
  Loader2,
  MoveUp,
  MoveDown,
  Check,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface TipTapEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  variant?: "default" | "longform";
}

interface SelectedImageItem {
  id: string;
  url: string;
  name: string;
}

function getTextStats(html: string) {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = text ? text.split(" ").filter(Boolean).length : 0;
  const chars = text.length;
  const readingMinutes = words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0;
  const pages = words > 0 ? Math.max(1, Math.ceil(words / 300)) : 0;
  return { words, chars, readingMinutes, pages };
}

export function TipTapEditor({
  value,
  onChange,
  placeholder = "Write rich article body content...",
  variant = "default",
}: TipTapEditorProps) {
  const isLongform = variant === "longform";
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<SelectedImageItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isExpanded) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isExpanded]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-[#0C4EA0] underline font-medium",
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: "rounded-xl max-w-full my-4 border border-slate-200 dark:border-slate-800 shadow-sm",
        },
      }),
      PlaceholderExtension.configure({
        placeholder,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: isLongform
          ? "prose dark:prose-invert prose-sm sm:prose-base max-w-none min-h-[28rem] sm:min-h-[32rem] px-4 py-5 sm:px-6 font-sans outline-none focus:outline-none leading-relaxed text-foreground"
          : "prose dark:prose-invert max-w-none min-h-90 p-4 font-sans text-sm outline-none focus:outline-none leading-relaxed text-foreground",
      },
    },
  });

  if (!editor) {
    return (
      <div
        className={`w-full rounded-sm border border-border/70 bg-card p-4 animate-pulse flex items-center justify-center text-xs text-muted-foreground ${
          isLongform ? "min-h-[28rem]" : "min-h-90"
        }`}
      >
        Loading editor...
      </div>
    );
  }

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImageUrl = () => {
    const url = window.prompt("Enter Image URL:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const MAX_FILE_SIZE = 500 * 1024; // 500 KB limit
  const VALID_IMAGE_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

  // Handle local multiple file upload
  const handleLocalFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const fileArray = Array.from(files);
    const uploadedList: SelectedImageItem[] = [];

    for (const file of fileArray) {
      // 1. Format check
      if (!VALID_IMAGE_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" rejected: Only PNG, JPG, JPEG, and WEBP supported`);
        continue;
      }

      // 2. Size check (Max 500 KB)
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" exceeds 500 KB limit (${(file.size / 1024).toFixed(0)} KB)`);
        continue;
      }

      let finalUrl = "";

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "articles");

        const res = await fetch("/api/admin/media", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (res.ok && Array.isArray(json.data) && json.data[0]?.url) {
          finalUrl = json.data[0].url;
        } else if (res.ok && json.data?.url) {
          finalUrl = json.data.url;
        }
      } catch (err) {
        console.error("Upload error, using fallback Data URL:", err);
      }

      // Local fallback if API fails or CDN not configured
      if (!finalUrl) {
        finalUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
      }

      uploadedList.push({
        id: Math.random().toString(36).substring(7),
        url: finalUrl,
        name: file.name,
      });
    }

    setSelectedImages((prev) => [...prev, ...uploadedList]);
    setIsUploading(false);
    toast.success(`${uploadedList.length} image(s) loaded`);
  };

  // Drag and Drop reordering logic
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updated = [...selectedImages];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setSelectedImages(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= selectedImages.length) return;

    const updated = [...selectedImages];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    setSelectedImages(updated);
  };

  const removeImage = (id: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const insertAllImages = () => {
    if (selectedImages.length === 0) return;

    selectedImages.forEach((img) => {
      editor.chain().focus().setImage({ src: img.url }).run();
    });

    toast.success(`Inserted ${selectedImages.length} image(s) into article`);
    setSelectedImages([]);
    setIsModalOpen(false);
  };

  const stats = getTextStats(value);

  return (
    <div
      className={
        isExpanded
          ? "fixed inset-0 z-50 flex flex-col bg-[#F8FAFC] p-3 sm:p-4"
          : "relative w-full"
      }
    >
      <div
        className={`flex w-full flex-col overflow-hidden rounded-sm border border-border/70 bg-card shadow-xs transition-colors duration-150 focus-within:border-[#0C4EA0]/60 ${
          isExpanded ? "mx-auto h-full max-w-5xl flex-1" : ""
        }`}
      >
      {/* Editor Toolbar */}
      <div
        className={`flex flex-wrap items-center gap-1 border-b border-border/70 bg-muted/30 p-2 select-none ${
          isLongform ? "sticky top-0 z-10" : ""
        }`}
      >
        {/* Text Formatting Group */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("bold") ? "bg-[#0C4EA0]/15 text-[#0C4EA0] font-bold" : "text-muted-foreground"}`}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("italic") ? "bg-[#0C4EA0]/15 text-[#0C4EA0]" : "text-muted-foreground"}`}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("underline") ? "bg-[#0C4EA0]/15 text-[#0C4EA0]" : "text-muted-foreground"}`}
          title="Underline"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("strike") ? "bg-[#0C4EA0]/15 text-[#0C4EA0]" : "text-muted-foreground"}`}
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Headings Group */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("heading", { level: 1 }) ? "bg-[#0C4EA0]/15 text-[#0C4EA0]" : "text-muted-foreground"}`}
          title="Heading 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-[#0C4EA0]/15 text-[#0C4EA0]" : "text-muted-foreground"}`}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("heading", { level: 3 }) ? "bg-[#0C4EA0]/15 text-[#0C4EA0]" : "text-muted-foreground"}`}
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Lists & Quotes */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("bulletList") ? "bg-[#0C4EA0]/15 text-[#0C4EA0]" : "text-muted-foreground"}`}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("orderedList") ? "bg-[#0C4EA0]/15 text-[#0C4EA0]" : "text-muted-foreground"}`}
          title="Ordered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("blockquote") ? "bg-[#0C4EA0]/15 text-[#0C4EA0]" : "text-muted-foreground"}`}
          title="Blockquote"
        >
          <Quote className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("codeBlock") ? "bg-[#0C4EA0]/15 text-[#0C4EA0]" : "text-muted-foreground"}`}
          title="Code Block"
        >
          <Code className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Links & Image Controls */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addLink}
          className={`h-7 w-7 p-0 rounded ${editor.isActive("link") ? "bg-[#0C4EA0]/15 text-[#0C4EA0]" : "text-muted-foreground"}`}
          title="Insert Link"
        >
          <LinkIcon className="h-3.5 w-3.5" />
        </Button>

        {/* Local Multiple Image Select & Drag Reorder Button (Icon Only) */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="h-7 px-2 gap-1 rounded bg-[#0C4EA0]/10 text-[#0C4EA0] hover:bg-[#0C4EA0]/20 transition-colors"
          title="Local Image Select & Drag Re-order"
        >
          <Upload className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold hidden sm:inline">Upload Images</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addImageUrl}
          className="h-7 w-7 p-0 rounded text-muted-foreground"
          title="Insert Image URL"
        >
          <ImageIcon className="h-3.5 w-3.5" />
        </Button>

        <div className="h-4 w-[1px] bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Undo, Redo, Clear */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-7 w-7 p-0 rounded text-muted-foreground disabled:opacity-30"
          title="Undo"
        >
          <Undo className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-7 w-7 p-0 rounded text-muted-foreground disabled:opacity-30"
          title="Redo"
        >
          <Redo className="h-3.5 w-3.5" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="h-7 w-7 p-0 rounded text-muted-foreground"
          title="Clear Formatting"
        >
          <RemoveFormatting className="h-3.5 w-3.5" />
        </Button>

        {isLongform ? (
          <>
            <div className="mx-1 h-4 w-px bg-border/70" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded((v) => !v)}
              className="h-7 gap-1 rounded px-2 text-muted-foreground hover:text-[#0C4EA0]"
              title={isExpanded ? "Exit fullscreen" : "Fullscreen editor"}
            >
              {isExpanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
              <span className="hidden text-[11px] font-medium sm:inline">
                {isExpanded ? "Exit" : "Expand"}
              </span>
            </Button>
          </>
        ) : null}
      </div>

      {/* Editor Main Content Area — grows with article length */}
      <div
        className={
          isExpanded
            ? "min-h-0 flex-1 overflow-y-auto bg-card"
            : isLongform
              ? "max-h-none overflow-visible bg-card"
              : ""
        }
      >
        <EditorContent editor={editor} />
      </div>

      {isLongform ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-muted/20 px-3 py-2 text-[10px] text-muted-foreground">
          <span>
            {stats.words.toLocaleString()} words · {stats.chars.toLocaleString()} characters
          </span>
          <span>
            {stats.words > 0
              ? `~${stats.readingMinutes} min read · ~${stats.pages} page${stats.pages === 1 ? "" : "s"}`
              : "Start writing — stats update as you type"}
          </span>
        </div>
      ) : null}
      </div>

      {/* Hidden File Input for Multiple Selection */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleLocalFiles(e.target.files)}
      />

      {/* Interactive Local Multi-Image Upload & Drag Re-order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in-50 zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center space-x-2">
                <Upload className="h-4 w-4 text-[#0C4EA0]" />
                <h3 className="font-bold text-sm text-foreground">
                  Select Local Images & Drag to Re-order
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* File Select Trigger Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#0C4EA0] rounded-xl p-6 text-center cursor-pointer transition-colors duration-150 bg-muted/20 hover:bg-muted/40 space-y-2"
              >
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center space-y-2 text-[#0C4EA0]">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs font-semibold">Processing images...</span>
                  </div>
                ) : (
                  <>
                    <div className="h-10 w-10 rounded-full bg-[#0C4EA0]/10 text-[#0C4EA0] flex items-center justify-center mx-auto">
                      <Plus className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">
                        Click to select local image files (Multiple allowed)
                      </p>
                      <p className="text-[11px] text-muted-foreground pt-0.5">
                        PNG, JPG, WEBP, GIF supported
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Selected Images Draggable Ordering Queue */}
              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Selected ({selectedImages.length}) — Drag rows to change order</span>
                    <button
                      type="button"
                      onClick={() => setSelectedImages([])}
                      className="text-rose-500 hover:underline text-[11px]"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {selectedImages.map((img, idx) => (
                      <div
                        key={img.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-background hover:border-[#0C4EA0]/60 transition-all cursor-grab active:cursor-grabbing ${
                          draggedIndex === idx ? "opacity-40 border-dashed border-[#0C4EA0]" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-xs font-mono font-bold text-[#0C4EA0] w-4">
                            #{idx + 1}
                          </span>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.name}
                            className="h-10 w-10 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                            {img.name}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            title="Move Up"
                          >
                            <MoveUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, "down")}
                            disabled={idx === selectedImages.length - 1}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                            title="Move Down"
                          >
                            <MoveDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(img.id)}
                            className="p-1 text-rose-500 hover:bg-rose-500/10 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={insertAllImages}
                disabled={selectedImages.length === 0}
                className="bg-[#0C4EA0] hover:bg-[#0a3d82] text-white font-semibold text-xs px-4 h-8 rounded-lg flex items-center space-x-1.5 shadow-2xs disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Insert {selectedImages.length} Image(s) in Order</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
