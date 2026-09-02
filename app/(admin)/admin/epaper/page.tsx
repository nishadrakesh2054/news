"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Plus, Search, Upload, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
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
  const [pdfUrl, setPdfUrl] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [publishDate, setPublishDate] = useState("");

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
    mutationFn: async (payload: {
      title: string;
      pdfUrl: string;
      coverImage?: string;
      publishDate?: string;
    }) => {
      const res = await fetch("/api/admin/epaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || json.message || "Failed to publish");
      return json.data;
    },
    onSuccess: () => {
      toast.success("E-paper edition published");
      queryClient.invalidateQueries({ queryKey: ["admin-epaper"] });
      setTitle("");
      setPdfUrl("");
      setCoverImage("");
      setPublishDate("");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !pdfUrl.trim()) {
      toast.error("Title and PDF URL are required");
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      pdfUrl: pdfUrl.trim(),
      coverImage: coverImage.trim() || undefined,
      publishDate: publishDate || undefined,
    });
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
      description="Publish daily PDF editions for readers"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        stats={[
          { label: "Total editions", value: epapers.length },
          { label: "This month", value: thisMonthCount },
          {
            label: "Latest edition",
            value: latest
              ? new Date(latest.publishDate).toLocaleDateString()
              : "—",
          },
          { label: "Showing", value: filtered.length },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className={adminPanel}>
          <div className={adminPanelHeader}>
            <h2 className={adminPanelTitle}>New edition</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3 p-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Edition title <span className="text-[#C3272E]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Daily edition — 2 Sep 2026"
                className={adminInput}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                PDF URL <span className="text-[#C3272E]">*</span>
              </label>
              <input
                type="url"
                required
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://…/edition.pdf"
                className={`${adminInput} font-mono`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Cover image URL</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Optional thumbnail"
                className={`${adminInput} font-mono`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Publication date</label>
              <input
                type="date"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className={adminInput}
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className={`${adminBtnPrimary} w-full justify-center`}
            >
              {createMutation.isPending ? (
                "Publishing…"
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Publish edition
                </>
              )}
            </button>
          </form>
        </section>

        <section className={`${adminPanel} lg:col-span-2`}>
          <div className={adminPanelHeader}>
            <h2 className={adminPanelTitle}>Published editions</h2>
            <button
              type="button"
              onClick={() => {
                setTitle("");
                setPdfUrl("");
                setCoverImage("");
                setPublishDate("");
              }}
              className="inline-flex h-7 items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
              Clear form
            </button>
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
                    <th className={`${adminTableHeadCell} text-right`}>PDF</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ep) => (
                    <tr key={ep.id} className={adminTableRow}>
                      <td className={adminTableCell}>
                        <p className="max-w-md truncate font-medium text-foreground">{ep.title}</p>
                        {ep.coverImage ? (
                          <span className={adminBadgeMuted}>Has cover</span>
                        ) : null}
                      </td>
                      <td className={`${adminTableCell} whitespace-nowrap text-muted-foreground`}>
                        {new Date(ep.publishDate).toLocaleDateString()}
                      </td>
                      <td className={`${adminTableCell} whitespace-nowrap text-muted-foreground`}>
                        {new Date(ep.createdAt).toLocaleDateString()}
                      </td>
                      <td className={`${adminTableCell} text-right`}>
                        <a
                          href={ep.pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-7 items-center gap-1 px-2 text-xs font-medium text-[#0C4EA0] hover:underline"
                        >
                          Open
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}
