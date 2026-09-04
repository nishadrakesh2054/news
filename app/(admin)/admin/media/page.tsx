"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload,
  Search,
  LayoutGrid,
  List,
  Copy,
  Pencil,
  Trash2,
  X,
  Loader2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import { MediaThumb } from "@/components/admin/MediaThumb";
import {
  adminBadgeMuted,
  adminBtnDanger,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
  adminSelect,
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
  adminToolbarRow,
  adminToolbarSearch,
  adminToolbarSelectMd,
  adminToolbarSelectSm,
} from "@/constants/admin-layout";

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

const FOLDER_OPTIONS = [
  { value: "ALL", label: "All folders" },
  { value: "articles", label: "Articles" },
  { value: "ads", label: "Advertisements" },
  { value: "general", label: "General" },
];

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [inspectingItem, setInspectingItem] = useState<MediaItem | null>(null);

  const [uploadFolder, setUploadFolder] = useState("articles");
  const [uploadAltText, setUploadAltText] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [editAltText, setEditAltText] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editFilename, setEditFilename] = useState("");
  const [editFolder, setEditFolder] = useState("articles");

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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/media/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete media asset");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Media deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setInspectingItem(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

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
      toast.success("Media updated");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      setInspectingItem(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("file", file));
      formData.append("folder", uploadFolder);
      if (uploadAltText) formData.append("altText", uploadAltText);
      if (uploadCaption) formData.append("caption", uploadCaption);

      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to upload files");

      toast.success(`Uploaded ${json.data.length} file(s)`);
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      closeUploadModal();
      setUploadAltText("");
      setUploadCaption("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied");
  };

  const openUploadModal = () => {
    setUploadFolder("articles");
    setUploadAltText("");
    setUploadCaption("");
    setIsUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    if (isUploading) return;
    setIsUploadModalOpen(false);
  };

  const openInspector = (item: MediaItem) => {
    setInspectingItem(item);
    setEditAltText(item.altText || "");
    setEditCaption(item.caption || "");
    setEditFilename(item.filename || "");
    setEditFolder(item.folder || "articles");
  };

  const closeInspector = () => {
    setInspectingItem(null);
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

  const isFiltered = search.trim() !== "" || folderFilter !== "ALL";

  const mediaList: MediaItem[] = data?.media || [];
  const metrics = data?.metrics || { totalFiles: 0, totalSizeBytes: 0, imageCount: 0 };
  const pagination = data?.pagination;

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <AdminPageShell
      title="Media library"
      description="Upload and manage images for articles and site content"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <button type="button" onClick={openUploadModal} className={adminBtnPrimary}>
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Total assets", value: metrics.totalFiles },
          { label: "Storage used", value: formatSize(metrics.totalSizeBytes) },
          { label: "Images", value: metrics.imageCount },
          { label: "Folders", value: 3 },
        ]}
      />

      <div className={adminToolbarRow}>
        <select
          value={folderFilter}
          onChange={(e) => {
            setFolderFilter(e.target.value);
            setPage(1);
          }}
          className={adminToolbarSelectMd}
        >
          {FOLDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search filename or alt text…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className={`${adminInput} w-full pl-7 pr-7`}
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        {isFiltered ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setFolderFilter("ALL");
              setPage(1);
            }}
            className="inline-flex h-8 shrink-0 items-center px-2 text-xs font-medium text-[#C3272E] hover:underline"
          >
            Reset
          </button>
        ) : null}

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="inline-flex h-8 items-center gap-px rounded-sm border border-border bg-card p-px">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`inline-flex h-[30px] w-8 items-center justify-center rounded-sm ${
                viewMode === "grid" ? "bg-[#0C4EA0] text-white" : "text-muted-foreground hover:bg-muted"
              }`}
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`inline-flex h-[30px] w-8 items-center justify-center rounded-sm ${
                viewMode === "list" ? "bg-[#0C4EA0] text-white" : "text-muted-foreground hover:bg-muted"
              }`}
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Per page</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className={adminToolbarSelectSm}
            >
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <p className="py-8 text-center text-xs text-muted-foreground">Loading media…</p>
      ) : isError ? (
        <p className="py-8 text-center text-xs text-destructive">Failed to load media.</p>
      ) : mediaList.length === 0 ? (
        <div className={`${adminPanel} px-3 py-10 text-center`}>
          <p className="text-xs text-muted-foreground">No media found.</p>
          <button
            type="button"
            onClick={openUploadModal}
            className={`${adminBtnPrimary} mt-3`}
          >
            Upload files
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {mediaList.map((item) => (
            <div key={item.id} className={`${adminPanel} group overflow-hidden`}>
              <div className="relative flex h-28 items-center justify-center border-b border-border bg-muted/20">
                <MediaThumb
                  url={item.url}
                  mimeType={item.mimeType}
                  filename={item.filename}
                  altText={item.altText}
                  caption={item.caption}
                  className="h-full w-full object-cover"
                  iconSize="md"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(item.url)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-white/90 text-foreground hover:bg-white"
                    title="Copy URL"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openInspector(item)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-white/90 text-foreground hover:bg-white"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${item.filename}"?`)) deleteMutation.mutate(item.id);
                    }}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-sm bg-[#C3272E] text-white hover:bg-[#a82128]"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="absolute bottom-1 right-1 rounded-sm bg-black/70 px-1 py-0.5 text-[9px] font-mono text-white">
                  {formatSize(item.size)}
                </span>
              </div>
              <div className="space-y-0.5 p-2">
                <p className="truncate text-xs font-medium text-foreground" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className={adminBadgeMuted}>{item.folder}</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={adminPanel}>
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Preview</th>
                  <th className={adminTableHeadCell}>Filename</th>
                  <th className={adminTableHeadCell}>Folder</th>
                  <th className={adminTableHeadCell}>Size</th>
                  <th className={adminTableHeadCell}>Dimensions</th>
                  <th className={adminTableHeadCell}>Uploaded</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mediaList.map((item) => (
                  <tr key={item.id} className={adminTableRow}>
                    <td className={adminTableCell}>
                      <MediaThumb
                        url={item.url}
                        mimeType={item.mimeType}
                        filename={item.filename}
                        altText={item.altText}
                        caption={item.caption}
                        className="h-8 w-8 border border-border object-cover"
                        fallbackClassName="flex h-8 w-8 items-center justify-center border border-border bg-muted/35 text-muted-foreground"
                        iconSize="sm"
                      />
                    </td>
                    <td className={adminTableCell}>
                      <p className="max-w-xs truncate font-medium text-foreground">{item.filename}</p>
                      {item.altText ? (
                        <p className="max-w-xs truncate text-[11px] text-muted-foreground">
                          {item.altText}
                        </p>
                      ) : null}
                    </td>
                    <td className={`${adminTableCell} text-muted-foreground`}>{item.folder}</td>
                    <td className={`${adminTableCell} font-mono text-muted-foreground`}>
                      {formatSize(item.size)}
                    </td>
                    <td className={`${adminTableCell} font-mono text-muted-foreground`}>
                      {item.width && item.height ? `${item.width}×${item.height}` : "—"}
                    </td>
                    <td className={`${adminTableCell} text-muted-foreground`}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.url)}
                          className={adminBtnGhost}
                          title="Copy URL"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openInspector(item)}
                          className={adminBtnGhost}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete "${item.filename}"?`)) deleteMutation.mutate(item.id);
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-muted"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <div>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of{" "}
            {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={adminBtnSecondary}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="font-medium text-foreground">
              {page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={adminBtnSecondary}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}

      {isUploadModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`${adminPanel} w-full max-w-md`}>
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Upload media</h2>
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isUploading}
                className="text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <div className="space-y-1">
                <label htmlFor="upload-folder" className="text-xs font-medium text-foreground">
                  Folder
                </label>
                <select
                  id="upload-folder"
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className={`${adminSelect} w-full`}
                >
                  <option value="articles">Articles</option>
                  <option value="ads">Advertisements</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="upload-alt" className="text-xs font-medium text-foreground">
                  Alt text
                </label>
                <input
                  id="upload-alt"
                  type="text"
                  placeholder="Image description…"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  className={`${adminInput} w-full`}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="upload-caption" className="text-xs font-medium text-foreground">
                  Caption
                </label>
                <input
                  id="upload-caption"
                  type="text"
                  placeholder="Photo credit…"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  className={`${adminInput} w-full`}
                />
              </div>

              <div className="rounded-sm border border-dashed border-border/70 bg-muted/20 p-6 text-center transition-colors hover:border-[#0C4EA0] hover:bg-muted/30">
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2 text-[#0C4EA0]">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-xs font-medium">Uploading…</span>
                  </div>
                ) : (
                  <label className="block cursor-pointer space-y-2">
                    <Upload className="mx-auto h-5 w-5 text-[#0C4EA0]" />
                    <p className="text-xs font-medium text-foreground">Choose image files</p>
                    <p className="text-[10px] text-muted-foreground">
                      PNG, JPG, WEBP, GIF — max 500 KB each
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

            <div className="flex justify-end gap-2 border-t border-border/70 px-4 py-3">
              <button
                type="button"
                onClick={closeUploadModal}
                disabled={isUploading}
                className={adminBtnSecondary}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {inspectingItem ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`${adminPanel} flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden`}>
            <div className="flex shrink-0 items-center justify-between border-b border-border/70 px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Edit media</h2>
              <button
                type="button"
                onClick={closeInspector}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <div className="mb-3 overflow-hidden rounded-sm border border-border/70 bg-muted/20">
                {inspectingItem.mimeType.startsWith("video/") &&
                inspectingItem.mimeType !== "video/youtube" &&
                !inspectingItem.url.includes("youtube.com/embed") ? (
                  <video
                    src={inspectingItem.url}
                    controls
                    className="mx-auto max-h-44 w-full object-contain"
                  />
                ) : (
                  <MediaThumb
                    url={inspectingItem.url}
                    mimeType={inspectingItem.mimeType}
                    filename={inspectingItem.filename}
                    altText={inspectingItem.altText}
                    caption={inspectingItem.caption}
                    className="mx-auto max-h-44 w-full object-contain"
                    fallbackClassName="flex h-44 w-full items-center justify-center bg-muted/35 text-muted-foreground"
                    iconSize="lg"
                  />
                )}
              </div>

              <div className="mb-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(inspectingItem.url)}
                  className={`${adminBtnSecondary} flex-1`}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy URL
                </button>
                <a
                  href={inspectingItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className={adminBtnGhost}
                  title="Open in new tab"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              <form id="media-edit-form" onSubmit={handleUpdateSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="edit-filename" className="text-xs font-medium text-foreground">
                    Filename
                  </label>
                  <input
                    id="edit-filename"
                    type="text"
                    value={editFilename}
                    onChange={(e) => setEditFilename(e.target.value)}
                    className={`${adminInput} w-full`}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-alt" className="text-xs font-medium text-foreground">
                    Alt text
                  </label>
                  <input
                    id="edit-alt"
                    type="text"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    className={`${adminInput} w-full`}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-caption" className="text-xs font-medium text-foreground">
                    Caption
                  </label>
                  <input
                    id="edit-caption"
                    type="text"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    className={`${adminInput} w-full`}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="edit-folder" className="text-xs font-medium text-foreground">
                    Folder
                  </label>
                  <select
                    id="edit-folder"
                    value={editFolder}
                    onChange={(e) => setEditFolder(e.target.value)}
                    className={`${adminSelect} w-full`}
                  >
                    <option value="articles">Articles</option>
                    <option value="ads">Advertisements</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="rounded-sm border border-border/70 bg-muted/15 px-3 py-2 text-[10px] text-muted-foreground">
                  <p>Size: {formatSize(inspectingItem.size)}</p>
                  <p>Type: {inspectingItem.mimeType}</p>
                  {inspectingItem.width && inspectingItem.height ? (
                    <p>
                      Dimensions: {inspectingItem.width}×{inspectingItem.height}
                    </p>
                  ) : null}
                  <p>Uploaded: {new Date(inspectingItem.createdAt).toLocaleString()}</p>
                </div>
              </form>
            </div>

            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border/70 px-4 py-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${inspectingItem.filename}"?`)) {
                    deleteMutation.mutate(inspectingItem.id);
                  }
                }}
                className={adminBtnDanger}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
              <div className="flex gap-2">
                <button type="button" onClick={closeInspector} className={adminBtnSecondary}>
                  Cancel
                </button>
                <button
                  type="submit"
                  form="media-edit-form"
                  className={adminBtnPrimary}
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
