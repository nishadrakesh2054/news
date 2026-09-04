"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ExternalLink,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
  adminToolbarRow,
  adminToolbarSearch,
} from "@/constants/admin-layout";

interface EPaperItem {
  id: string;
  title: string;
  pdfUrl: string;
  coverImage: string | null;
  publishDate: string;
  createdAt: string;
}

function CoverPicker({
  id,
  file,
  previewUrl,
  onFile,
  onClearPreview,
}: {
  id: string;
  file: File | null;
  previewUrl: string | null;
  onFile: (file: File | null) => void;
  onClearPreview?: () => void;
}) {
  const localPreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  const shown = localPreview || previewUrl;

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-sm border border-dashed border-border/80 bg-muted/20 px-3 py-3 text-center transition-colors hover:border-[#0C4EA0]/40"
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="h-28 w-auto max-w-full object-contain" />
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-[#0C4EA0]" />
            <span className="text-xs text-muted-foreground">Choose cover from computer (JPG / PNG)</span>
          </>
        )}
        {file ? <span className="max-w-full truncate text-[10px] font-medium">{file.name}</span> : null}
      </label>
      <input
        id={id}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        className="sr-only"
      />
      {(file || previewUrl) && (
        <button
          type="button"
          onClick={() => {
            onFile(null);
            onClearPreview?.();
          }}
          className="text-[10px] font-medium text-[#C3272E] hover:underline"
        >
          Remove cover
        </button>
      )}
    </div>
  );
}

export default function AdminEPaperPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<EPaperItem | null>(null);

  const [title, setTitle] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  const { data: epapers = [], isLoading, isError, refetch, isFetching } = useQuery<EPaperItem[]>({
    queryKey: ["admin-epaper"],
    queryFn: async () => {
      const res = await fetch("/api/admin/epaper");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load e-papers");
      return json.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!pdfFile) throw new Error("PDF file is required");
      if (!coverFile) throw new Error("Cover image is required");

      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("title", title.trim());
      formData.append("coverFile", coverFile);
      if (publishDate) formData.append("publishDate", publishDate);

      const res = await fetch("/api/admin/epaper/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      return json.data;
    },
    onSuccess: () => {
      toast.success("PDF created");
      queryClient.invalidateQueries({ queryKey: ["admin-epaper"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      if (!title.trim()) throw new Error("Title is required");

      const formData = new FormData();
      formData.append("title", title.trim());
      if (publishDate) formData.append("publishDate", publishDate);
      if (coverFile) formData.append("coverFile", coverFile);
      if (pdfFile) formData.append("file", pdfFile);
      if (removeCover && !coverFile) formData.append("removeCover", "1");

      const res = await fetch(`/api/admin/epaper/${editing.id}`, {
        method: "PATCH",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Edition updated");
      queryClient.invalidateQueries({ queryKey: ["admin-epaper"] });
      closeModal();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/epaper/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Delete failed");
    },
    onSuccess: () => {
      toast.success("Edition deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-epaper"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const resetForm = () => {
    setTitle("");
    setPublishDate("");
    setPdfFile(null);
    setCoverFile(null);
    setCoverPreview(null);
    setRemoveCover(false);
  };

  const openCreateModal = () => {
    setEditing(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (ep: EPaperItem) => {
    setEditing(ep);
    setTitle(ep.title);
    setPublishDate(ep.publishDate.slice(0, 10));
    setPdfFile(null);
    setCoverFile(null);
    setCoverPreview(ep.coverImage);
    setRemoveCover(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (editing) {
      updateMutation.mutate();
      return;
    }
    if (!pdfFile) {
      toast.error("Please choose a PDF from your computer");
      return;
    }
    if (!coverFile) {
      toast.error("Please choose a cover image from your computer");
      return;
    }
    createMutation.mutate();
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return epapers;
    const term = search.toLowerCase();
    return epapers.filter((ep) => ep.title.toLowerCase().includes(term));
  }, [epapers, search]);

  const now = new Date();
  const thisMonthCount = epapers.filter((ep) => {
    const d = new Date(ep.publishDate);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const withCover = epapers.filter((ep) => Boolean(ep.coverImage)).length;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminPageShell
      title="E-paper / PDF materials"
      description="Manage PDF editions with cover images for the public card grid"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <button type="button" onClick={openCreateModal} className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New PDF
        </button>
      }
    >
      <AdminStatsStrip
        stats={[
          { label: "Total editions", value: epapers.length },
          { label: "With cover", value: withCover },
          { label: "This month", value: thisMonthCount },
          { label: "Showing", value: filtered.length },
        ]}
      />

      <div className={adminToolbarRow}>
        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search editions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        {search ? (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="inline-flex h-8 shrink-0 items-center px-2 text-xs font-medium text-[#C3272E] hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      <section className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading editions…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load editions.</p>
        ) : filtered.length === 0 ? (
          <div className="px-3 py-10 text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              {search ? "No editions match your search." : "No PDF editions yet."}
            </p>
            {!search ? (
              <button type="button" onClick={openCreateModal} className={adminBtnPrimary}>
                <Plus className="h-3.5 w-3.5" />
                New PDF
              </button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>Cover</th>
                  <th className={adminTableHeadCell}>Title</th>
                  <th className={adminTableHeadCell}>Published</th>
                  <th className={adminTableHeadCell}>Added</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ep) => (
                  <tr key={ep.id} className={adminTableRow}>
                    <td className={adminTableCell}>
                      {ep.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ep.coverImage}
                          alt=""
                          className="h-14 w-10 rounded-sm border border-border object-cover"
                        />
                      ) : (
                        <span className="inline-flex h-14 w-10 items-center justify-center rounded-sm bg-muted text-[9px] text-muted-foreground">
                          No cover
                        </span>
                      )}
                    </td>
                    <td className={adminTableCell}>
                      <p className="max-w-xl whitespace-normal break-words font-medium leading-snug text-foreground">
                        {ep.title}
                      </p>
                    </td>
                    <td className={`${adminTableCell} whitespace-nowrap text-muted-foreground`}>
                      {new Date(ep.publishDate).toLocaleDateString()}
                    </td>
                    <td className={`${adminTableCell} whitespace-nowrap text-muted-foreground`}>
                      {new Date(ep.createdAt).toLocaleDateString()}
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center">
                        <a
                          href={ep.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={adminBtnGhost}
                          title="Open PDF"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => openEditModal(ep)}
                          className={adminBtnGhost}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete edition "${ep.title}"?`)) {
                              deleteMutation.mutate(ep.id);
                            }
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center text-[#C3272E] hover:bg-muted"
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
        )}
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`${adminPanel} w-full max-w-lg`}>
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">
                {editing ? "Edit PDF" : "New PDF"}
              </h2>
              <button type="button" onClick={closeModal} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[80vh] space-y-4 overflow-y-auto p-4 sm:p-5">
              <div className="space-y-1.5">
                <label htmlFor="epaper-modal-title" className="text-xs font-medium text-foreground">
                  Title <span className="text-[#C3272E]">*</span>
                </label>
                <input
                  id="epaper-modal-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. आर्थिक वर्ष २०८३/८४ को बजेट वक्तव्य"
                  className={`${adminInput} w-full`}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="epaper-modal-date" className="text-xs font-medium text-foreground">
                  Publication date
                  <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="epaper-modal-date"
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className={`${adminInput} w-full`}
                />
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground">
                  Cover image {!editing ? <span className="text-[#C3272E]">*</span> : null}
                </p>
                <CoverPicker
                  id="epaper-modal-cover"
                  file={coverFile}
                  previewUrl={removeCover ? null : coverPreview}
                  onFile={(file) => {
                    setCoverFile(file);
                    if (file) setRemoveCover(false);
                  }}
                  onClearPreview={() => {
                    setCoverPreview(null);
                    setRemoveCover(true);
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="epaper-modal-pdf" className="text-xs font-medium text-foreground">
                  PDF file {!editing ? <span className="text-[#C3272E]">*</span> : (
                    <span className="ml-1 font-normal text-muted-foreground">(optional replace)</span>
                  )}
                </label>
                <label
                  htmlFor="epaper-modal-pdf"
                  className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border/80 bg-muted/20 px-4 py-4 text-center transition-colors hover:border-[#0C4EA0]/40"
                >
                  <Upload className="h-5 w-5 text-[#0C4EA0]" />
                  {pdfFile ? (
                    <span className="max-w-full truncate text-xs font-medium">{pdfFile.name}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {editing ? "Keep current PDF, or choose a new one" : "Choose PDF from computer"}
                    </span>
                  )}
                </label>
                <input
                  id="epaper-modal-pdf"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                  className="sr-only"
                />
                {pdfFile ? (
                  <button
                    type="button"
                    onClick={() => setPdfFile(null)}
                    className="text-[10px] font-medium text-[#C3272E] hover:underline"
                  >
                    Remove selected PDF
                  </button>
                ) : editing ? (
                  <a
                    href={editing.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0C4EA0] hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Open current PDF
                  </a>
                ) : null}
              </div>

              <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
                <button type="button" onClick={closeModal} className={adminBtnSecondary}>
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className={adminBtnPrimary}>
                  {isSaving ? "Saving…" : editing ? "Save" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
