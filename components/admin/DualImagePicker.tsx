"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, ImageIcon, Link as LinkIcon, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DualImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

interface MediaAsset {
  id: string;
  filename: string;
  url: string;
  folder: string;
  size: number;
}

export function DualImagePicker({
  value,
  onChange,
  folder = "general",
  label = "Banner / Cover Image",
}: DualImagePickerProps) {
  const [activeTab, setActiveTab] = useState<"file" | "url" | "library">("file");
  const [isUploading, setIsUploading] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(value || "");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_FILE_SIZE = 500 * 1024; // 500 KB
  const VALID_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];

  // Query Media Assets for Library Modal
  const { data: mediaData } = useQuery({
    queryKey: ["admin-media-library-picker"],
    queryFn: async () => {
      const res = await fetch("/api/admin/media?type=image&limit=24");
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to load library");
      return json.data;
    },
    enabled: isLibraryOpen,
  });

  const mediaList: MediaAsset[] = mediaData?.media || [];

  // Local file upload handler
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!VALID_TYPES.includes(file.type)) {
      toast.error(`Only PNG, JPG, JPEG, WEBP, and GIF images are supported`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`Image exceeds 500 KB limit (${(file.size / 1024).toFixed(0)} KB)`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to upload image");

      const uploadedUrl = json.data[0]?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
        setUrlInput(uploadedUrl);
        toast.success("Image uploaded successfully!");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to upload image";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a valid image URL");
      return;
    }
    onChange(urlInput.trim());
    toast.success("Image URL applied");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-semibold uppercase text-muted-foreground">
          {label}
        </label>
        <span className="text-[10px] text-muted-foreground">Local file or Web URL</span>
      </div>

      {/* Preview Thumbnail if Value exists */}
      {value ? (
        <div className="relative rounded-sm border border-border/70 bg-muted/20 p-2 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Selected Preview"
              className="h-12 w-16 object-cover rounded-lg border border-border shrink-0 shadow-2xs"
            />
            <div className="min-w-0">
              <p className="font-mono text-xs font-semibold text-foreground truncate max-w-xs">{value}</p>
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <Check className="h-3 w-3" />
                <span>Image Selected</span>
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onChange("");
              setUrlInput("");
            }}
            className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-500/10 shrink-0"
            title="Remove Image"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        /* Selector Tabs: Local File vs URL vs Media Library */
        <div className="space-y-2">
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-sm border border-border/70">
            <button
              type="button"
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "file"
                  ? "bg-[#0C4EA0] text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Local File</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab("library");
                setIsLibraryOpen(true);
              }}
              className={`flex-1 py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "library"
                  ? "bg-[#0C4EA0] text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              <span>Media Library</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`flex-1 py-1 px-2.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "url"
                  ? "bg-[#0C4EA0] text-white shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LinkIcon className="h-3.5 w-3.5" />
              <span>Image URL</span>
            </button>
          </div>

          {/* TAB 1: LOCAL FILE UPLOAD */}
          {activeTab === "file" && (
            <div className="border border-dashed border-border/70 hover:border-[#0C4EA0] rounded-sm p-4 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
              {isUploading ? (
                <div className="flex items-center justify-center space-x-2 text-[#0C4EA0] text-xs font-semibold">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading to server...</span>
                </div>
              ) : (
                <label className="cursor-pointer space-y-1 block">
                  <Upload className="h-5 w-5 text-[#0C4EA0] mx-auto" />
                  <p className="text-xs font-bold text-foreground">Click to select image file from computer</p>
                  <p className="text-[10px] text-muted-foreground">Supports PNG, JPG, WEBP, GIF (Max 500 KB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </label>
              )}
            </div>
          )}

          {/* TAB 2: DIRECT IMAGE URL */}
          {activeTab === "url" && (
            <div className="flex items-center space-x-2">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-mono outline-none focus:border-[#0C4EA0]"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleApplyUrl}
                className="bg-[#0C4EA0] text-white text-xs font-bold h-8 px-3 rounded-lg"
              >
                Apply URL
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Media Asset Library Picker Drawer Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-sm border border-border/70 shadow-xs p-5 space-y-4 animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-[#0C4EA0]" />
                <span>Select Image from Media Library</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Media Gallery Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-72 overflow-y-auto p-1">
              {mediaList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onChange(item.url);
                    setUrlInput(item.url);
                    setIsLibraryOpen(false);
                    toast.success("Image selected from library");
                  }}
                  className="group relative rounded-sm border border-border/70 overflow-hidden h-24 bg-muted cursor-pointer hover:border-[#0C4EA0] transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold bg-[#0C4EA0] px-2 py-0.5 rounded">
                      Select
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsLibraryOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
