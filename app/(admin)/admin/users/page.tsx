"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, X } from "lucide-react";
import { Role } from "@prisma/client";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { SystemSectionNav } from "@/components/admin/SystemSectionNav";
import { AdminDataTable, AdminPanel, AdminStatsStrip } from "@/components/admin/content";
import {
  adminBtnGhost,
  adminSelect,
  adminToolbarRow,
  adminToolbarSearch,
  adminToolbarSelectStatus,
} from "@/constants/admin-layout";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  _count: {
    articles: number;
    comments: number;
  };
}

const ROLE_OPTIONS = ["ALL", "ADMIN", "EDITOR", "AUTHOR", "READER"] as const;

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data: users = [], isLoading, isError, error, refetch, isFetching } = useQuery<UserItem[]>({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      const json = await res.json();
      if (!res.ok || !json.data) throw new Error(json.error || "Failed to load users");
      return json.data;
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
      toast.success(`Role updated to ${variables.role}`);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setUpdatingId(null),
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

  const adminCount = users.filter((u) => u.role === Role.ADMIN).length;
  const editorCount = users.filter((u) => u.role === Role.EDITOR).length;
  const authorCount = users.filter((u) => u.role === Role.AUTHOR).length;

  const handleRoleChange = (userId: string, newRole: Role) => {
    setUpdatingId(userId);
    roleMutation.mutate({ userId, role: newRole });
  };

  const hasFilters = search.trim() !== "" || roleFilter !== "ALL";

  return (
    <AdminPageShell
      title="Users"
      description="Manage accounts and role-based access"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Total users", value: users.length },
          { label: "Admins", value: adminCount },
          { label: "Editors", value: editorCount },
          { label: "Authors", value: authorCount },
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
            className={`${adminSelect} w-full pl-8 pr-7`}
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
              {role === "ALL" ? "All roles" : role}
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
            emptyMessage="No users match your filters."
            columns={[
              {
                key: "name",
                label: "User",
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
                    disabled={updatingId === row.id}
                    onChange={(e) => handleRoleChange(row.id, e.target.value as Role)}
                    className={adminSelect}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="EDITOR">Editor</option>
                    <option value="AUTHOR">Author</option>
                    <option value="READER">Reader</option>
                  </select>
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
            ]}
          />
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
