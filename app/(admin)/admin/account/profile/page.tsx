"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw, Save } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminPanel } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
} from "@/constants/admin-layout";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
}

function formatRole(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

export default function AdminAccountProfilePage() {
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery<ProfileData>({
    queryKey: ["admin-account-profile"],
    queryFn: async () => {
      const res = await fetch("/api/admin/account/profile");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load profile");
      return json.data;
    },
  });

  useEffect(() => {
    if (!data) return;
    setForm({ name: data.name, email: data.email, role: data.role });
  }, [data]);

  const resetForm = () => {
    if (!data) return;
    setForm({ name: data.name, email: data.email, role: data.role });
    setPassword("");
    setCurrentPassword("");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    if (password && !currentPassword) {
      toast.error("Enter your current password to set a new one");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          password: password || undefined,
          currentPassword: password ? currentPassword : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Profile updated");
      setPassword("");
      setCurrentPassword("");
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
  data &&
  (form.name !== data.name ||
    form.email !== data.email ||
    password.length > 0);

  return (
    <AdminPageShell
      title="My profile"
      description="Account details and password settings"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <>
          <button
            type="button"
            onClick={resetForm}
            disabled={isLoading || !hasChanges}
            className={adminBtnSecondary}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || isLoading || !hasChanges}
            className={adminBtnPrimary}
          >
            <Save className="h-3 w-3" />
            {saving ? "Saving…" : "Save changes"}
          </button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Profile details">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading profile…</p>
          ) : (
            <div className="space-y-3 p-3">
              <div className="space-y-1">
                <label
                  htmlFor="profile-name"
                  className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Display name
                </label>
                <input
                  id="profile-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={`${adminInput} w-full`}
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="profile-email"
                  className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Email address
                </label>
                <input
                  id="profile-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className={`${adminInput} w-full`}
                />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Role
                </span>
                <div className="flex h-8 items-center">
                  <span className={adminBadgeMuted}>{formatRole(form.role)}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Role is assigned by an administrator and cannot be changed here.
                </p>
              </div>
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Password">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3 p-3">
              <p className="text-xs text-muted-foreground">
                Leave blank to keep your current password. You will need your current
                password to set a new one.
              </p>

              <div className="space-y-1">
                <label
                  htmlFor="profile-new-password"
                  className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  New password
                </label>
                <input
                  id="profile-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${adminInput} w-full`}
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="profile-current-password"
                  className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Current password
                </label>
                <input
                  id="profile-current-password"
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={!password}
                  className={`${adminInput} w-full disabled:cursor-not-allowed disabled:opacity-50`}
                />
              </div>
            </div>
          )}
        </AdminPanel>
      </div>
    </AdminPageShell>
  );
}
