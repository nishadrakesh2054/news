"use client";

import { Suspense, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Camera, RotateCcw, Save, Trash2, UserRound } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminPanel } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
} from "@/constants/admin-layout";
import { PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import { MAX_ADMIN_IMAGE_BYTES, MAX_ADMIN_IMAGE_LABEL } from "@/constants/media";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  createdAt: string;
  mustChangePassword: boolean;
}

function formatRole(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function AdminAccountProfilePage() {
  return (
    <Suspense fallback={<p className="text-xs text-muted-foreground">Loading profile…</p>}>
      <ProfilePageInner />
    </Suspense>
  );
}

function ProfilePageInner() {
  const searchParams = useSearchParams();
  const forcePassword = searchParams.get("forcePassword") === "1";

  const { data, isLoading, refetch, isFetching } = useQuery<ProfileData>({
    queryKey: ["admin-account-profile"],
    queryFn: async () => {
      const res = await fetch("/api/admin/account/profile");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load profile");
      return json.data;
    },
  });

  return (
    <AdminPageShell
      title="My profile"
      description="Photo, name, email, and password"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      {isLoading || !data ? (
        <p className="text-xs text-muted-foreground">Loading profile…</p>
      ) : (
        <ProfileEditor
          key={`${data.id}-${data.name}-${data.email}-${data.image}-${data.mustChangePassword}`}
          data={data}
          forcePassword={forcePassword || data.mustChangePassword}
          onSaved={refetch}
        />
      )}
    </AdminPageShell>
  );
}

function ProfileEditor({
  data,
  forcePassword,
  onSaved,
}: {
  data: ProfileData;
  forcePassword: boolean;
  onSaved: () => void;
}) {
  const router = useRouter();
  const { update } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: data.name,
    email: data.email,
    role: data.role,
    image: data.image,
  });
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const previewUrl = form.image;

  const resetForm = () => {
    setForm({
      name: data.name,
      email: data.email,
      role: data.role,
      image: data.image,
    });
    setPassword("");
    setCurrentPassword("");
  };

  const handleAvatarUpload = async (files: FileList | null) => {
    if (!files?.[0]) return;
    const file = files[0];
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Use PNG, JPG, WEBP, or GIF");
      return;
    }
    if (file.size > MAX_ADMIN_IMAGE_BYTES) {
      toast.error(`Image must be ${MAX_ADMIN_IMAGE_LABEL} or smaller`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "avatars");
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Upload failed");
      const url = json.data?.[0]?.url as string | undefined;
      if (!url) throw new Error("Upload failed");
      setForm((f) => ({ ...f, image: url }));
      toast.success("Photo ready — save to apply");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    if (forcePassword && !password) {
      toast.error("Set a new password to continue");
      return;
    }

    const emailChanging = form.email.trim().toLowerCase() !== data.email.toLowerCase();
    if ((password || emailChanging) && !currentPassword) {
      toast.error(
        forcePassword
          ? "Enter the temporary password you were given"
          : emailChanging && !password
            ? "Enter your current password to change email"
            : "Enter your current password to set a new one"
      );
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
          image: form.image,
          password: password || undefined,
          currentPassword:
            password || emailChanging ? currentPassword : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      if (password) {
        toast.success("Password updated. Sign in with your new password.");
        await signOut({ redirect: false });
        router.replace("/login");
        router.refresh();
        return;
      }

      toast.success("Profile updated");
      setPassword("");
      setCurrentPassword("");
      await update();
      onSaved();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    form.name !== data.name ||
    form.email !== data.email ||
    form.image !== data.image ||
    password.length > 0 ||
    forcePassword;

  const joined = new Date(data.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <>
      {forcePassword ? (
        <div className="mb-4 rounded-sm border border-[#C3272E]/30 bg-[#C3272E]/5 px-3 py-2.5 text-xs text-foreground">
          <p className="font-semibold text-[#C3272E]">Set your own password</p>
          <p className="mt-1 text-muted-foreground">
            Update your photo, name, or email if you like, then set a new password using the
            temporary password as current. You must finish this before using the rest of admin.
          </p>
        </div>
      ) : null}

      <div className={`${adminPanel} mb-4 overflow-hidden`}>
        <div className="border-b border-border/70 bg-linear-to-r from-[#0C4EA0]/8 via-card to-[#C3272E]/5 px-4 py-5 sm:px-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-border/70 bg-muted text-lg font-semibold text-muted-foreground shadow-xs">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span aria-hidden>{initials(form.name || data.name)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-card text-[#0C4EA0] shadow-xs hover:bg-muted disabled:opacity-50"
                  title="Change photo"
                >
                  {uploading ? (
                    <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-[#0C4EA0]/40" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleAvatarUpload(e.target.files)}
                />
              </div>

              <div className="min-w-0 space-y-1">
                <h2 className="truncate text-base font-semibold text-foreground">
                  {form.name || "Your name"}
                </h2>
                <p className="truncate font-mono text-[11px] text-muted-foreground">
                  {form.email}
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-0.5">
                  <span className={adminBadgeMuted}>{formatRole(form.role)}</span>
                  <span className="text-[11px] text-muted-foreground">Joined {joined}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {form.image ? (
                <button
                  type="button"
                  className={adminBtnGhost}
                  onClick={() => setForm((f) => ({ ...f, image: null }))}
                >
                  <Trash2 className="h-3 w-3" />
                  Remove photo
                </button>
              ) : (
                <button
                  type="button"
                  className={adminBtnSecondary}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  <UserRound className="h-3 w-3" />
                  {uploading ? "Uploading…" : "Add photo"}
                </button>
              )}
              <button
                type="button"
                onClick={resetForm}
                disabled={!hasChanges || forcePassword}
                className={adminBtnSecondary}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving || (!hasChanges && !forcePassword) || (forcePassword && !password)
                }
                className={adminBtnPrimary}
              >
                <Save className="h-3 w-3" />
                {saving ? "Saving…" : forcePassword ? "Save & continue" : "Save changes"}
              </button>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Square photo works best · PNG/JPG/WEBP/GIF · max {MAX_ADMIN_IMAGE_LABEL}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Account details">
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
                placeholder="How your name appears on articles"
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
                placeholder="you@example.com"
              />
              <p className="text-[11px] text-muted-foreground">Used for sign-in.</p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Role
              </span>
              <div className="flex h-8 items-center">
                <span className={adminBadgeMuted}>{formatRole(form.role)}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Assigned by an administrator — not editable here.
              </p>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel title="Password">
          <div className="space-y-3 p-3">
            <p className="text-xs text-muted-foreground">
              {forcePassword
                ? `Choose a new password (min ${PASSWORD_MIN_LENGTH} characters, letter + number). Use the temporary password below.`
                : "Leave blank to keep your current password."}
            </p>

            <div className="space-y-1">
              <label
                htmlFor="profile-new-password"
                className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                New password{forcePassword ? " *" : ""}
              </label>
              <input
                id="profile-new-password"
                type="password"
                autoComplete="new-password"
                required={forcePassword}
                minLength={PASSWORD_MIN_LENGTH}
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
                {forcePassword ? "Temporary password *" : "Current password"}
              </label>
              <input
                id="profile-current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={!password && !forcePassword && form.email === data.email}
                className={`${adminInput} w-full disabled:cursor-not-allowed disabled:opacity-50`}
              />
              <p className="text-[11px] text-muted-foreground">
                Required when changing password or email.
              </p>
            </div>
          </div>
        </AdminPanel>
      </div>
    </>
  );
}
