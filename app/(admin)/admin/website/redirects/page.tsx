"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { WebsiteSectionNav } from "@/components/admin/WebsiteSectionNav";
import {
  adminBadgeMuted,
  adminBadgeSuccess,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
  adminPanelHeader,
  adminPanelTitle,
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
} from "@/constants/admin-layout";

interface RedirectItem {
  id: string;
  fromPath: string;
  toPath: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminWebsiteRedirectsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<RedirectItem | null>(null);

  const [fromPath, setFromPath] = useState("");
  const [toPath, setToPath] = useState("");
  const [isActive, setIsActive] = useState(true);

  const { data: redirects = [], isLoading, isError, refetch, isFetching } = useQuery<RedirectItem[]>({
    queryKey: ["admin-redirects"],
    queryFn: async () => {
      const res = await fetch("/api/admin/website/redirects?limit=200");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch redirects");
      return Array.isArray(json.data) ? json.data : json.data?.items ?? [];
    },
  });

  const resetForm = () => {
    setFromPath("");
    setToPath("");
    setIsActive(true);
    setEditingRedirect(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingRedirect(null);
    setFromPath("");
    setToPath("");
    setIsActive(true);
    setShowForm(true);
  };

  const openEditForm = (item: RedirectItem) => {
    setEditingRedirect(item);
    setFromPath(item.fromPath);
    setToPath(item.toPath);
    setIsActive(item.isActive);
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: { fromPath: string; toPath: string; isActive: boolean }) => {
      const res = await fetch("/api/admin/website/redirects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create redirect");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Redirect created");
      queryClient.invalidateQueries({ queryKey: ["admin-redirects"] });
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: { fromPath: string; toPath: string; isActive: boolean };
    }) => {
      const res = await fetch(`/api/admin/website/redirects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update redirect");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Redirect updated");
      queryClient.invalidateQueries({ queryKey: ["admin-redirects"] });
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/website/redirects/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete redirect");
    },
    onSuccess: () => {
      toast.success("Redirect deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-redirects"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromPath.trim() || !toPath.trim()) {
      toast.error("From and to paths are required");
      return;
    }

    const payload = {
      fromPath: fromPath.trim(),
      toPath: toPath.trim(),
      isActive,
    };

    if (editingRedirect) {
      updateMutation.mutate({ id: editingRedirect.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <AdminPageShell
      title="Redirects"
      description="301/302 URL redirects"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <button type="button" onClick={openCreateForm} className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New redirect
        </button>
      }
    >
      <WebsiteSectionNav />

      {showForm ? (
        <section className={adminPanel}>
          <div className={adminPanelHeader}>
            <h2 className={adminPanelTitle}>
              {editingRedirect ? "Edit redirect" : "New redirect"}
            </h2>
            <button type="button" onClick={resetForm} className={adminBtnGhost} title="Close">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 p-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="redirect-from" className="text-xs font-medium text-foreground">
                  From path <span className="text-[#C3272E]">*</span>
                </label>
                <input
                  id="redirect-from"
                  type="text"
                  required
                  placeholder="/old-article"
                  value={fromPath}
                  onChange={(e) => setFromPath(e.target.value)}
                  className={`${adminInput} w-full font-mono`}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="redirect-to" className="text-xs font-medium text-foreground">
                  To path <span className="text-[#C3272E]">*</span>
                </label>
                <input
                  id="redirect-to"
                  type="text"
                  required
                  placeholder="/new-article"
                  value={toPath}
                  onChange={(e) => setToPath(e.target.value)}
                  className={`${adminInput} w-full font-mono`}
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded-sm border-border accent-[#0C4EA0]"
              />
              Active redirect
            </label>

            <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
              <button type="button" onClick={resetForm} className={adminBtnSecondary}>
                Cancel
              </button>
              <button
                type="submit"
                className={adminBtnPrimary}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingRedirect ? "Save" : "Create"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading redirects…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load redirects.</p>
        ) : redirects.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">No redirects yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>From</th>
                  <th className={adminTableHeadCell}>To</th>
                  <th className={adminTableHeadCell}>Status</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {redirects.map((item) => (
                  <tr key={item.id} className={adminTableRow}>
                    <td className={`${adminTableCell} font-mono text-xs`}>{item.fromPath}</td>
                    <td className={`${adminTableCell} font-mono text-xs text-muted-foreground`}>
                      {item.toPath}
                    </td>
                    <td className={adminTableCell}>
                      <span className={item.isActive ? adminBadgeSuccess : adminBadgeMuted}>
                        {item.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center">
                        <button
                          type="button"
                          onClick={() => openEditForm(item)}
                          className={adminBtnGhost}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete redirect ${item.fromPath}?`)) {
                              deleteMutation.mutate(item.id);
                            }
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
        )}
      </div>
    </AdminPageShell>
  );
}
