"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  FolderTree,
  Upload,
  Search,
  LayoutGrid,
  List,
  Copy,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  ImageIcon,
  FileText,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaItem {
  id: string;
  filename: string;
  url: string;
  publicId: string | null;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  altText: string | null;
  caption: string | null;
  folder: string;
  createdAt: string;
  uploader?: {
    name: string;
    email: string;
  };
}

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [inspectingItem, setInspectingItem] = useState<MediaItem | null>(null);

  // Upload Form state
  const [uploadFolder, setUploadFolder] = useState("articles");
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Edit details state
  const [editAltText, setEditAltText] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editFilename, setEditFilename] = useState("");
  const [editFolder, setEditFolder] = useState("articles");

  // Fetch Media Assets
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-media", search, folderFilter, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) params.append("search", search.trim());
      if (folderFilter !== "ALL") params.append("folder", folderFilter);

      const res = await fetch(`/api/admin/media?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch media assets");
      return json.data;
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete media asset");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Media asset deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      if (inspectingItem) setInspectingItem(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: Record<string, unknown> }) => {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update media details");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Media details saved");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setInspectingItem(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Handle Multi-file Upload
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("file", file));
      formData.append("folder", uploadFolder);
      if (uploadAltText) formData.append("altText", uploadAltText);
      if (uploadCaption) formData.append("caption", uploadCaption);

      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to upload files");

      toast.success(`Successfully uploaded ${json.data.length} file(s)`);
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setIsUploadModalOpen(false);
      setUploadAltText("");
      setUploadCaption("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Upload failed";
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Image URL copied to clipboard!");
  };

  const openInspector = (item: MediaItem) => {
    setInspectingItem(item);
    setEditAltText(item.altText || "");
    setEditCaption(item.caption || "");
    setEditFilename(item.filename || "");
    setEditFolder(item.folder || "articles");
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectingItem) return;
    updateMutation.mutate({
      id: inspectingItem.id,
      payload: {
        altText: editAltText,
        caption: editCaption,
        filename: editFilename,
        folder: editFolder,
      },
    });
  };

  const mediaList: MediaItem[] = data?.media || [];
  const metrics = data?.metrics || { totalFiles: 0, totalSizeBytes: 0, imageCount: 0 };
  const pagination = data?.pagination;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="w-full space-y-3 px-6 py-2 pb-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-serif flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-[#027081]" />
            <span>Media Asset Library</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-8 px-2.5 text-xs rounded-lg border-border font-medium hover:bg-muted"
            title="Refresh library"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? "animate-spin text-[#027081]" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="h-8 rounded-lg bg-brand hover:bg-[#0B3F8A] text-white shadow-xs text-[11px] font-bold px-3 py-1 flex items-center gap-1.5 transition-all duration-200"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Assets</span>
          </Button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Assets</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{metrics.totalFiles}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <ImageIcon className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Storage Used</p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {formatSize(metrics.totalSizeBytes)}
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Image Assets</p>
            <p className="text-xl font-extrabold text-purple-600 mt-0.5">{metrics.imageCount}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <ImageIcon className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Asset Folders</p>
            <p className="text-xl font-extrabold text-[#027081] mt-0.5">3 Folders</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-[#027081]/10 text-[#027081] flex items-center justify-center">
            <FolderTree className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-1">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search filename or ALT text..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-card border border-border rounded-sm pl-8 pr-7 py-1.5 text-xs text-foreground outline-none focus:border-[#027081] shadow-2xs transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Folder Filter */}
          <select
            value={folderFilter}
            onChange={(e) => {
              setFolderFilter(e.target.value);
              setPage(1);
            }}
            className="bg-card border border-border rounded-sm px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-[#027081] shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Folders</option>
            <option value="articles">Articles</option>
            <option value="ads">Advertisements</option>
            <option value="general">General</option>
          </select>

          {(search || folderFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setFolderFilter("ALL");
                setPage(1);
              }}
              className="text-xs text-rose-600 hover:underline font-bold px-1"
            >
              Reset
            </button>
          )}
        </div>

        {/* View Mode & Page Limit */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 border border-border rounded-lg p-0.5 bg-muted/40">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1 rounded ${viewMode === "grid" ? "bg-background text-[#027081]" : "text-muted-foreground"}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1 rounded ${viewMode === "list" ? "bg-background text-[#027081]" : "text-muted-foreground"}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground font-medium">
            <span>Per page:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-background border border-border rounded-lg px-2 py-1 text-xs font-bold text-foreground outline-none focus:border-[#027081]"
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
          <div className="h-5 w-5 border-2 border-[#027081] border-t-transparent rounded-full animate-spin" />
          <span>Loading media assets...</span>
        </div>
      ) : isError ? (
        <div className="p-12 text-center text-xs text-rose-500 font-semibold">
          Failed to load media assets.
        </div>
      ) : mediaList.length === 0 ? (
        <div className="p-12 text-center text-xs text-muted-foreground space-y-2 bg-card rounded-xl border border-border">
          <p className="font-semibold">No media assets found matching your criteria.</p>
          <Button
            size="sm"
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#027081] text-white text-xs"
          >
            Upload First Asset
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-xl border border-border overflow-hidden group shadow-2xs hover:border-[#027081]/60 transition-all flex flex-col justify-between"
            >
              {/* Thumbnail Container */}
              <div className="relative h-32 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.altText || item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />

                {/* Format Badge Overlay */}
                <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                  {item.mimeType.split("/")[1] || "IMG"}
                </span>

                {/* Size Badge */}
                <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-[8px] font-mono px-1.5 py-0.5 rounded">
                  {formatSize(item.size)}
                </span>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(item.url)}
                    className="h-8 w-8 p-0 rounded-lg bg-white/20 text-white hover:bg-white/40"
                    title="Copy URL"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => openInspector(item)}
                    className="h-8 w-8 p-0 rounded-lg bg-white/20 text-white hover:bg-white/40"
                    title="Edit Details"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (confirm(`Delete "${item.filename}"?`)) deleteMutation.mutate(item.id);
                    }}
                    className="h-8 w-8 p-0 rounded-lg bg-rose-600/80 text-white hover:bg-rose-600"
                    title="Delete File"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Title & Metadata Details Footer */}
              <div className="p-2.5 space-y-1">
                <p className="font-semibold text-xs text-foreground truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span>{item.folder}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* LIST VIEW DATA TABLE */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-slate-50/80 dark:bg-slate-900/60 uppercase text-[10px] tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Filename</th>
                  <th className="px-4 py-3">Folder</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Dimensions</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {mediaList.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-2.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.filename}
                        className="h-10 w-10 object-cover rounded-lg border border-border shrink-0"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="font-bold text-xs text-foreground truncate max-w-xs">{item.filename}</p>
                      {item.altText && (
                        <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                          ALT: {item.altText}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap font-medium text-xs text-muted-foreground uppercase">
                      {item.folder}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {formatSize(item.size)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {item.width && item.height ? `${item.width}×${item.height}` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2.5 text-right space-x-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.url)}
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
                        title="Copy Public URL"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openInspector(item)}
                        className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-[#027081]"
                        title="Edit Details"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete "${item.filename}"?`)) deleteMutation.mutate(item.id);
                        }}
                        className="h-8 w-8 p-0 rounded-lg text-rose-500 hover:bg-rose-500/10"
                        title="Delete Asset"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div>
            Showing <strong className="text-foreground">{(page - 1) * limit + 1}</strong>–
            <strong className="text-foreground">{Math.min(page * limit, pagination.total)}</strong> of{" "}
            <strong className="text-foreground">{pagination.total}</strong> assets
          </div>

          <div className="flex items-center space-x-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 text-xs px-3 rounded-lg border-border"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              <span>Previous</span>
            </Button>

            <span className="px-2 font-bold text-foreground">
              {page} / {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 text-xs px-3 rounded-lg border-border"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Interactive Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-in fade-in-50">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Upload className="h-4 w-4 text-[#027081]" />
                <span>Upload Media Assets</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Folder Selector */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase">Target Folder</label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs font-semibold text-foreground outline-none focus:border-[#027081]"
                >
                  <option value="articles">Articles</option>
                  <option value="ads">Advertisements</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* Alt Text & Caption */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">ALT Text (SEO)</label>
                  <input
                    type="text"
                    placeholder="Image description..."
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#027081]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">Caption / Credit</label>
                  <input
                    type="text"
                    placeholder="Photo credit..."
                    value={uploadCaption}
                    onChange={(e) => setUploadCaption(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#027081]"
                  />
                </div>
              </div>

              {/* File Drop Area */}
              <div className="border-2 border-dashed border-border hover:border-[#027081] rounded-xl p-6 text-center bg-muted/20 hover:bg-muted/40 transition-colors">
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center space-y-2 text-[#027081]">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-xs font-semibold">Uploading to Cloudinary & DB...</span>
                  </div>
                ) : (
                  <label className="cursor-pointer space-y-2 block">
                    <div className="h-10 w-10 rounded-full bg-[#027081]/10 text-[#027081] flex items-center justify-center mx-auto">
                      <Upload className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-bold text-foreground">
                      Click to choose files (Max 500 KB per image)
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Supports PNG, JPG, JPEG, WEBP, GIF
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex justify-end border-t border-border/60 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsUploadModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Details Inspector Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-2xl border border-border shadow-2xl p-6 space-y-5 animate-in fade-in-50 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-[#027081]" />
                <span>Media Asset Details</span>
              </h2>
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Image Preview */}
              <div className="space-y-2">
                <div className="rounded-xl border border-border overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center h-52">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inspectingItem.url}
                    alt={inspectingItem.filename}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(inspectingItem.url)}
                    className="w-full text-xs font-semibold h-8 rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5 text-[#027081]" />
                    <span>Copy Public URL</span>
                  </Button>

                  <a
                    href={inspectingItem.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex"
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 rounded-lg text-muted-foreground"
                      title="Open full size image"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Editable Metadata Form */}
              <form onSubmit={handleUpdateSubmit} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">Filename</label>
                  <input
                    type="text"
                    value={editFilename}
                    onChange={(e) => setEditFilename(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#027081]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">ALT Text (SEO)</label>
                  <input
                    type="text"
                    placeholder="Describe image for search engines..."
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#027081]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">Caption / Credit</label>
                  <input
                    type="text"
                    placeholder="Photo credit..."
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs outline-none focus:border-[#027081]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase">Folder</label>
                  <select
                    value={editFolder}
                    onChange={(e) => setEditFolder(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs font-semibold outline-none focus:border-[#027081]"
                  >
                    <option value="articles">Articles</option>
                    <option value="ads">Advertisements</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="pt-2 text-[11px] text-muted-foreground space-y-1 border-t border-border/60">
                  <p><strong>Size:</strong> {formatSize(inspectingItem.size)}</p>
                  <p><strong>Type:</strong> {inspectingItem.mimeType}</p>
                  <p><strong>Uploaded:</strong> {new Date(inspectingItem.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between border-t border-border/60 pt-3">
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Delete "${inspectingItem.filename}"?`)) {
                        deleteMutation.mutate(inspectingItem.id);
                      }
                    }}
                    className="h-8 text-xs px-2.5 bg-rose-600 text-white"
                  >
                    Delete Asset
                  </Button>

                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateMutation.isPending}
                    className="bg-[#027081] text-white text-xs font-semibold px-4 h-8 rounded-lg"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
