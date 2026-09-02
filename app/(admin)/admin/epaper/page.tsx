"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Pencil, Search, Trash2, Upload, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBtnGhost,
  adminBtnPrimary,
  adminInput,
  adminPanel,
  adminPanelHeader,
  adminPanelTitle,
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

export default function AdminEPaperPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState("");
  const [publishDate, setPublishDate] = useState("");
  const [editing, setEditing] = useState<EPaperItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCover, setEditCover] = useState("");
  const [editDate, setEditDate] = useState("");

  const { data: epapers = [], isLoading, isError, refetch, isFetching } = useQuery<EPaperItem[]>({
    queryKey: ["admin-epaper"],
    queryFn: async () => {
      const res = await fetch("/api/admin/epaper");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load e-papers");
      return json.data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!pdfFile) throw new Error("PDF file is required");

      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("title", title.trim());
      if (coverImage.trim()) formData.append("coverImage", coverImage.trim());
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
      toast.success("E-paper edition uploaded");
      queryClient.invalidateQueries({ queryKey: ["admin-epaper"] });
      setTitle("");
      setPdfFile(null);
      setCoverImage("");
      setPublishDate("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editing) return;
      const res = await fetch(`/api/admin/epaper/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          coverImage: editCover.trim() || null,
          publishDate: editDate || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Edition updated");
      setEditing(null);
      queryClient.invalidateQueries({ queryKey: ["admin-epaper"] });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Edition title is required");
      return;
    }
    if (!pdfFile) {
      toast.error("Please select a PDF file");
      return;
    }
    uploadMutation.mutate();
  };

  const openEdit = (ep: EPaperItem) => {
    setEditing(ep);
    setEditTitle(ep.title);
    setEditCover(ep.coverImage || "");
    setEditDate(ep.publishDate.slice(0, 10));
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

  const latest = epapers[0];

  return (
    <AdminPageShell
      title="E-paper"
      description="Upload and manage daily PDF editions"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        stats={[
          { label: "Total editions", value: epapers.length },
          { label: "This month", value: thisMonthCount },
          {
            label: "Latest edition",
            value: latest ? new Date(latest.publishDate).toLocaleDateString() : "—",
          },
          { label: "Showing", value: filtered.length },
        ]}
      />

      <section className={adminPanel}>
        <div className={adminPanelHeader}>
          <div>
            <h2 className={adminPanelTitle}>Upload edition</h2>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Add a new PDF edition · max 20 MB · stored on Cloudinary
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-4 sm:p-5">
          <div className="space-y-1.5">
            <label htmlFor="epaper-title" className="text-xs font-medium text-foreground">
              Edition title <span className="text-[#C3272E]">*</span>
            </label>
            <input
              id="epaper-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Daily edition — 2 Sep 2026"
              className={`${adminInput} w-full`}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="epaper-pdf" className="text-xs font-medium text-foreground">
              PDF file <span className="text-[#C3272E]">*</span>
            </label>
            <label
              htmlFor="epaper-pdf"
              className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border/80 bg-muted/20 px-4 py-5 text-center transition-colors hover:border-[#0C4EA0]/40 hover:bg-muted/35"
            >
              <Upload className="h-5 w-5 text-[#0C4EA0]" />
              {pdfFile ? (
                <span className="max-w-full truncate text-xs font-medium text-foreground">
                  {pdfFile.name}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Click to choose PDF or drag file here
                </span>
              )}
              {pdfFile ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setPdfFile(null);
                  }}
                  className="text-[10px] font-medium text-[#C3272E] hover:underline"
                >
                  Remove file
                </button>
              ) : null}
            </label>
            <input
              id="epaper-pdf"
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
              className="sr-only"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="epaper-cover" className="text-xs font-medium text-foreground">
                Cover image URL
                <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="epaper-cover"
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://…"
                className={`${adminInput} w-full font-mono text-[11px]`}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="epaper-date" className="text-xs font-medium text-foreground">
                Publication date
                <span className="ml-1 font-normal text-muted-foreground">(optional)</span>
              </label>
              <input
                id="epaper-date"
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className={`${adminInput} w-full`}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-end">
            <p className="text-center text-[10px] text-muted-foreground sm:mr-auto sm:text-left">
              Title and PDF are required. Date defaults to today if empty.
            </p>
            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className={`${adminBtnPrimary} h-8 min-w-[140px] justify-center px-4`}
            >
              {uploadMutation.isPending ? (
                "Uploading…"
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Upload edition
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      <section className={adminPanel}>
          <div className={adminPanelHeader}>
            <h2 className={adminPanelTitle}>Published editions</h2>
          </div>

          <div className="border-b border-border px-3 py-2">
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
            </div>
          </div>

          {isLoading ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading editions…</p>
          ) : isError ? (
            <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load editions.</p>
          ) : filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-xs text-muted-foreground">
              {search ? "No editions match your search." : "No e-paper editions published yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className={adminTable}>
                <thead className={adminTableHead}>
                  <tr>
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
                        <p className="max-w-md truncate font-medium text-foreground">{ep.title}</p>
                        {ep.coverImage ? <span className={adminBadgeMuted}>Has cover</span> : null}
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
                            onClick={() => openEdit(ep)}
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

      {editing ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`${adminPanel} w-full max-w-md`}>
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">Edit edition</h2>
              <button type="button" onClick={() => setEditing(null)} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4 p-4 sm:p-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Edition title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={`${adminInput} w-full`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Cover image URL</label>
                <input
                  type="url"
                  placeholder="https://…"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  className={`${adminInput} w-full font-mono text-[11px]`}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Publication date</label>
                <input
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className={`${adminInput} w-full`}
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-border/70 pt-4">
                <button type="button" onClick={() => setEditing(null)} className={adminBtnGhost}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => updateMutation.mutate()}
                  disabled={updateMutation.isPending}
                  className={adminBtnPrimary}
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
