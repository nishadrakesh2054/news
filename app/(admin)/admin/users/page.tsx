"use client";

import { FormEvent, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Ban, CheckCircle2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Role } from "@prisma/client";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { SystemSectionNav } from "@/components/admin/SystemSectionNav";
import { AdminDataTable, AdminPanel, AdminStatsStrip } from "@/components/admin/content";
import {
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
  adminSelect,
  adminToolbarRow,
  adminToolbarSearch,
  adminToolbarSelectStatus,
} from "@/constants/admin-layout";
import { ROLE_LABELS } from "@/constants/permissions";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  _count: {
    articles: number;
    comments: number;
  };
}

const ROLE_OPTIONS = ["ALL", "SUPER_ADMIN", "ADMIN", "EDITOR", "AUTHOR", "READER"] as const;

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: Role.AUTHOR,
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const isSuper = session?.user?.role === Role.SUPER_ADMIN;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);

  const { data: users = [], isLoading, isError, error, refetch, isFetching } = useQuery<UserItem[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users?limit=100");
      const json = await res.json();
      if (!res.ok || !json.data) throw new Error(json.error || "Failed to load users");
      return json.data.users ?? json.data;
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: Role }) => {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update role");
      return json;
    },
    onSuccess: (_data, variables) => {
      toast.success(`Role updated to ${ROLE_LABELS[variables.role] ?? variables.role}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setUpdatingId(null),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create user");
      return json;
    },
    onSuccess: () => {
      toast.success(
        `User created as ${ROLE_LABELS[form.role] ?? form.role}. They get that role’s permissions.`
      );
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingUser) throw new Error("No user selected");
      const payload: { name: string; email: string; password?: string } = {
        name: form.name,
        email: form.email,
      };
      if (form.password.trim()) payload.password = form.password;
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update user");
      return json;
    },
    onSuccess: () => {
      toast.success("Name and email updated");
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const activeMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");
      return json;
    },
    onSuccess: (_d, v) => {
      toast.success(v.isActive ? "User enabled" : "User disabled");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete user");
      return json;
    },
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term === "" ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term);
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const superCount = users.filter((u) => u.role === Role.SUPER_ADMIN).length;
  const adminCount = users.filter((u) => u.role === Role.ADMIN).length;
  const editorCount = users.filter((u) => u.role === Role.EDITOR).length;
  const authorCount = users.filter((u) => u.role === Role.AUTHOR).length;

  const handleRoleChange = (userId: string, newRole: Role) => {
    setUpdatingId(userId);
    roleMutation.mutate({ userId, role: newRole });
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({ ...emptyForm, role: Role.AUTHOR });
    setModalOpen(true);
  };

  const openEditModal = (user: UserItem) => {
    if (!isSuper && user.role === Role.SUPER_ADMIN) {
      toast.error("Only Super Admin can edit a Super Admin");
      return;
    }
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingUser) updateMutation.mutate();
    else createMutation.mutate();
  };

  const hasFilters = search.trim() !== "" || roleFilter !== "ALL";
  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminPageShell
      title="Users"
      description="Add people with a temporary password. They change it and update profile on first login."
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <button type="button" onClick={openCreateModal} className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          Add user
        </button>
      }
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Total users", value: users.length },
          { label: "Super Admins", value: superCount },
          { label: "Admins", value: adminCount },
          { label: "Editors / Authors", value: `${editorCount} / ${authorCount}` },
        ]}
      />

      <SystemSectionNav />

      <div className={adminToolbarRow}>
        <div className={adminToolbarSearch}>
          <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${adminInput} w-full pl-8 pr-7`}
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

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={adminToolbarSelectStatus}
        >
          {ROLE_OPTIONS.map((role) => (
            <option key={role} value={role}>
              {role === "ALL" ? "All roles" : ROLE_LABELS[role as Role] ?? role}
            </option>
          ))}
        </select>

        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setRoleFilter("ALL");
            }}
            className={adminBtnGhost}
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <AdminPanel title="User accounts">
        {isError ? (
          <p className="px-3 py-6 text-xs text-destructive">
            {error?.message ?? "Failed to load users."}
          </p>
        ) : (
          <AdminDataTable
            loading={isLoading}
            rows={filteredUsers}
            rowKey={(row) => row.id}
            emptyMessage="No users yet. Click Add user to create one."
            columns={[
              {
                key: "name",
                label: "Name",
                render: (row) => (
                  <div>
                    <div className="font-medium text-foreground">{row.name}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{row.email}</div>
                  </div>
                ),
              },
              {
                key: "role",
                label: "Role",
                render: (row) => (
                  <select
                    value={row.role}
                    disabled={
                      updatingId === row.id ||
                      (!isSuper &&
                        (row.role === Role.SUPER_ADMIN || row.role === Role.ADMIN))
                    }
                    onChange={(e) => handleRoleChange(row.id, e.target.value as Role)}
                    className={adminSelect}
                  >
                    {isSuper ? <option value="SUPER_ADMIN">Super Admin</option> : null}
                    {isSuper || row.role === Role.ADMIN ? (
                      <option value="ADMIN">Admin</option>
                    ) : null}
                    <option value="EDITOR">Editor</option>
                    <option value="AUTHOR">Author</option>
                    <option value="READER">Reader</option>
                  </select>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <span
                    className={
                      row.isActive === false
                        ? "text-[11px] font-medium text-[#C3272E]"
                        : "text-[11px] font-medium text-emerald-700"
                    }
                  >
                    {row.isActive === false ? "Disabled" : "Active"}
                  </span>
                ),
              },
              {
                key: "articles",
                label: "Articles",
                align: "right",
                cellClassName: "font-mono tabular-nums text-muted-foreground",
                render: (row) => row._count.articles,
              },
              {
                key: "createdAt",
                label: "Joined",
                cellClassName: "whitespace-nowrap text-muted-foreground",
                render: (row) => new Date(row.createdAt).toLocaleDateString(),
              },
              {
                key: "actions",
                label: "Actions",
                align: "right",
                render: (row) => {
                  const locked = !isSuper && row.role === Role.SUPER_ADMIN;
                  const isSelf = row.id === session?.user?.id;
                  return (
                    <div className="inline-flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        disabled={locked}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#0C4EA0] hover:bg-[#0C4EA0]/10 disabled:opacity-40"
                        title="Edit name & email"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={locked || isSelf || activeMutation.isPending}
                        onClick={() =>
                          activeMutation.mutate({
                            userId: row.id,
                            isActive: row.isActive === false,
                          })
                        }
                        className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted disabled:opacity-40"
                        title={row.isActive === false ? "Enable user" : "Disable user"}
                      >
                        {row.isActive === false ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                        ) : (
                          <Ban className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        disabled={locked || isSelf || deleteMutation.isPending}
                        onClick={() => {
                          if (
                            confirm(
                              `Delete user "${row.name}"? This cannot be undone.`
                            )
                          ) {
                            deleteMutation.mutate(row.id);
                          }
                        }}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-[#C3272E] hover:bg-[#C3272E]/10 disabled:opacity-40"
                        title="Delete user"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                },
              },
            ]}
          />
        )}
      </AdminPanel>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className={`${adminPanel} w-full max-w-md`}>
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <h2 className="text-sm font-semibold text-foreground">
                {editingUser ? "Edit user" : "Add user"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 p-4">
              <div className="space-y-1">
                <label htmlFor="user-name" className="text-xs font-medium text-foreground">
                  Name
                </label>
                <input
                  id="user-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`${adminInput} w-full`}
                  placeholder="e.g. Desk Editor"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="user-email" className="text-xs font-medium text-foreground">
                  Email
                </label>
                <input
                  id="user-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={`${adminInput} w-full`}
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="user-password" className="text-xs font-medium text-foreground">
                  {editingUser ? "Temporary password (optional)" : "Temporary password"}
                </label>
                <input
                  id="user-password"
                  type="password"
                  required={!editingUser}
                  minLength={editingUser ? undefined : PASSWORD_MIN_LENGTH}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className={`${adminInput} w-full`}
                  placeholder={
                    editingUser
                      ? "Leave blank to keep current password"
                      : `Min ${PASSWORD_MIN_LENGTH} chars · letter + number · uppercase or symbol`
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Must be changed on first login.
                </p>
              </div>

              {!editingUser ? (
                <div className="space-y-1">
                  <label htmlFor="user-role" className="text-xs font-medium text-foreground">
                    Role
                  </label>
                  <select
                    id="user-role"
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                    className={`${adminSelect} w-full`}
                  >
                  {isSuper ? <option value="SUPER_ADMIN">Super Admin</option> : null}
                  {isSuper ? <option value="ADMIN">Admin</option> : null}
                  <option value="EDITOR">Editor</option>
                  <option value="AUTHOR">Author</option>
                  <option value="READER">Reader</option>
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    This role’s ticks from Roles & permissions apply automatically.
                  </p>
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-1">
                <button type="button" className={adminBtnSecondary} onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className={adminBtnPrimary} disabled={saving}>
                  {saving
                    ? editingUser
                      ? "Saving…"
                      : "Creating…"
                    : editingUser
                      ? "Save changes"
                      : "Create user"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
