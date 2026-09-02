"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { Users, Shield, RefreshCw, Search, X, UserCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();

      if (res.ok && data.data) {
        setUsers(data.data);
      } else {
        toast.error(data.error || "Failed to load users");
      }
    } catch {
      toast.error("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (!ignore && res.ok && data.data) {
          setUsers(data.data);
        }
      } catch {
        // ignore
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      setUpdatingId(userId);
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || `Role updated to ${newRole}`);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      } else {
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Error updating user role");
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      search.trim() === "" ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === Role.ADMIN).length;
  const editorCount = users.filter((u) => u.role === Role.EDITOR).length;
  const authorCount = users.filter((u) => u.role === Role.AUTHOR).length;

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case Role.EDITOR:
        return "bg-[#027081]/10 text-[#027081] border-[#027081]/20";
      case Role.AUTHOR:
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
    }
  };

  return (
    <div className="w-full space-y-3 px-4 py-3 pb-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-base font-bold tracking-tight text-foreground font-serif flex items-center gap-2">
            <Users className="h-5 w-5 text-[#027081]" />
            <span>User Accounts & RBAC Permissions</span>
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            className="h-8 px-2.5 text-xs rounded-lg border-border font-medium hover:bg-muted"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin text-[#027081]" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Users</p>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{users.length}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <Users className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Admins</p>
            <p className="text-xl font-extrabold text-rose-600 mt-0.5">{adminCount}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <Shield className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Editors</p>
            <p className="text-xl font-extrabold text-[#027081] mt-0.5">{editorCount}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-[#027081]/10 text-[#027081] flex items-center justify-center">
            <UserCheck className="h-4 w-4" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-3.5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Authors</p>
            <p className="text-xl font-extrabold text-purple-600 mt-0.5">{authorCount}</p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Lock className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Unified Filter Toolbar */}
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-1">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-card border border-border rounded-sm px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-[#027081] shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="EDITOR">EDITOR</option>
            <option value="AUTHOR">AUTHOR</option>
            <option value="READER">READER</option>
          </select>

          {(search || roleFilter !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRoleFilter("ALL");
              }}
              className="text-xs text-rose-600 hover:underline font-bold px-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Users Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex flex-col items-center justify-center space-y-2">
            <div className="h-5 w-5 border-2 border-[#027081] border-t-transparent rounded-full animate-spin" />
            <span>Loading user accounts...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            No user accounts found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-slate-50/80 dark:bg-slate-900/60 uppercase text-[10px] tracking-wider text-muted-foreground font-bold">
                <tr>
                  <th className="px-4 py-3">User Name / Email</th>
                  <th className="px-4 py-3">Role & Access Level</th>
                  <th className="px-4 py-3">Articles Authored</th>
                  <th className="px-4 py-3">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-xs text-foreground">{u.name}</div>
                      <div className="text-[11px] font-mono text-muted-foreground">{u.email}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-extrabold outline-none cursor-pointer ${getRoleBadge(u.role)}`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="EDITOR">EDITOR</option>
                        <option value="AUTHOR">AUTHOR</option>
                        <option value="READER">READER</option>
                      </select>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-muted-foreground font-semibold">
                      {u._count.articles} stories
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
