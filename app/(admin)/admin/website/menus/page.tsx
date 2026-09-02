"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { WebsiteSectionNav } from "@/components/admin/WebsiteSectionNav";
import {
  adminBadgeMuted,
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

interface MenuItem {
  id: string;
  label: string;
  url: string;
  children?: MenuItem[];
}

interface MenuRow {
  id: string;
  name: string;
  label: string;
  items?: MenuItem[];
}

export default function AdminWebsiteMenusPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuRow | null>(null);

  const [name, setName] = useState("");
  const [label, setLabel] = useState("");
  const [homeUrl, setHomeUrl] = useState("/");

  const { data: menus = [], isLoading, isError, refetch, isFetching } = useQuery<MenuRow[]>({
    queryKey: ["admin-menus"],
    queryFn: async () => {
      const res = await fetch("/api/admin/website/menus");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch menus");
      return json.data;
    },
  });

  const resetForm = () => {
    setName("");
    setLabel("");
    setHomeUrl("/");
    setEditingMenu(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setEditingMenu(null);
    setName("");
    setLabel("");
    setHomeUrl("/");
    setShowForm(true);
  };

  const openEditForm = (menu: MenuRow) => {
    setEditingMenu(menu);
    setName(menu.name);
    setLabel(menu.label);
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      label: string;
      items: { label: string; url: string }[];
    }) => {
      const res = await fetch("/api/admin/website/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create menu");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Menu created");
      queryClient.invalidateQueries({ queryKey: ["admin-menus"] });
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: { label: string } }) => {
      const res = await fetch(`/api/admin/website/menus/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update menu");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Menu updated");
      queryClient.invalidateQueries({ queryKey: ["admin-menus"] });
      resetForm();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/website/menus/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete menu");
    },
    onSuccess: () => {
      toast.success("Menu deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-menus"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMenu) {
      if (!label.trim()) {
        toast.error("Display label is required");
        return;
      }
      updateMutation.mutate({ id: editingMenu.id, payload: { label: label.trim() } });
      return;
    }

    if (!name.trim() || !label.trim()) {
      toast.error("System name and display label are required");
      return;
    }

    createMutation.mutate({
      name: name.trim().toLowerCase(),
      label: label.trim(),
      items: [{ label: "Home", url: homeUrl.trim() || "/" }],
    });
  };

  const countItems = (menu: MenuRow) => {
    const top = menu.items?.length ?? 0;
    const nested =
      menu.items?.reduce((sum, item) => sum + (item.children?.length ?? 0), 0) ?? 0;
    return top + nested;
  };

  return (
    <AdminPageShell
      title="Menus"
      description="Header, footer, and navigation menus"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <button type="button" onClick={openCreateForm} className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New menu
        </button>
      }
    >
      <WebsiteSectionNav />

      {showForm ? (
        <section className={adminPanel}>
          <div className={adminPanelHeader}>
            <h2 className={adminPanelTitle}>{editingMenu ? "Edit menu" : "New menu"}</h2>
            <button type="button" onClick={resetForm} className={adminBtnGhost} title="Close">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 p-3">
            {editingMenu ? (
              <div className="rounded-sm border border-border/70 bg-muted/15 px-3 py-2 text-[10px] text-muted-foreground">
                System name:{" "}
                <span className="font-mono text-foreground">{editingMenu.name}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="menu-name" className="text-xs font-medium text-foreground">
                    System name <span className="text-[#C3272E]">*</span>
                  </label>
                  <input
                    id="menu-name"
                    type="text"
                    required
                    placeholder="header"
                    value={name}
                    onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    className={`${adminInput} w-full font-mono`}
                  />
                  <p className="text-[10px] text-muted-foreground">Lowercase identifier, e.g. header</p>
                </div>
                <div className="space-y-1">
                  <label htmlFor="menu-label" className="text-xs font-medium text-foreground">
                    Display label <span className="text-[#C3272E]">*</span>
                  </label>
                  <input
                    id="menu-label"
                    type="text"
                    required
                    placeholder="Main header"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className={`${adminInput} w-full`}
                  />
                </div>
              </div>
            )}

            {editingMenu ? (
              <div className="space-y-1">
                <label htmlFor="menu-label-edit" className="text-xs font-medium text-foreground">
                  Display label <span className="text-[#C3272E]">*</span>
                </label>
                <input
                  id="menu-label-edit"
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className={`${adminInput} w-full max-w-md`}
                />
              </div>
            ) : null}

            {!editingMenu ? (
              <div className="space-y-1">
                <label htmlFor="menu-home-url" className="text-xs font-medium text-foreground">
                  First link URL
                </label>
                <input
                  id="menu-home-url"
                  type="text"
                  placeholder="/"
                  value={homeUrl}
                  onChange={(e) => setHomeUrl(e.target.value)}
                  className={`${adminInput} w-full max-w-md font-mono`}
                />
                <p className="text-[10px] text-muted-foreground">
                  Creates a default &quot;Home&quot; item — edit links later in menu builder
                </p>
              </div>
            ) : null}

            <div className="flex justify-end gap-2 border-t border-border/70 pt-3">
              <button type="button" onClick={resetForm} className={adminBtnSecondary}>
                Cancel
              </button>
              <button
                type="submit"
                className={adminBtnPrimary}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingMenu ? "Save" : "Create"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading menus…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load menus.</p>
        ) : menus.length === 0 ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">No menus yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={adminTableHeadCell}>System name</th>
                  <th className={adminTableHeadCell}>Display label</th>
                  <th className={adminTableHeadCell}>Items</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {menus.map((menu) => (
                  <tr key={menu.id} className={adminTableRow}>
                    <td className={`${adminTableCell} font-mono text-xs`}>{menu.name}</td>
                    <td className={`${adminTableCell} font-medium text-foreground`}>{menu.label}</td>
                    <td className={adminTableCell}>
                      <span className={adminBadgeMuted}>{countItems(menu)}</span>
                    </td>
                    <td className={`${adminTableCell} text-right`}>
                      <div className="inline-flex items-center">
                        <button
                          type="button"
                          onClick={() => openEditForm(menu)}
                          className={adminBtnGhost}
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete menu "${menu.label}"?`)) {
                              deleteMutation.mutate(menu.id);
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
