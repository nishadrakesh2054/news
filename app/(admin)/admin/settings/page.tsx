"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw, Save } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { WebsiteSectionNav } from "@/components/admin/WebsiteSectionNav";
import { AdminPanel } from "@/components/admin/content";
import { DualImagePicker } from "@/components/admin/DualImagePicker";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminSelect,
} from "@/constants/admin-layout";

type SettingsForm = {
  site_name: string;
  site_name_np: string;
  site_tagline: string;
  press_council_reg: string;
  dept_info_reg: string;
  site_logo_url: string;
  contact_email: string;
  contact_phone: string;
  comment_mode: "everyone" | "registered" | "disabled";
  default_author_status: "DRAFT" | "PUBLISHED";
};

const EMPTY_FORM: SettingsForm = {
  site_name: "",
  site_name_np: "",
  site_tagline: "",
  press_council_reg: "",
  dept_info_reg: "",
  site_logo_url: "",
  contact_email: "",
  contact_phone: "",
  comment_mode: "registered",
  default_author_status: "DRAFT",
};

const fieldLabel =
  "text-[10px] font-medium uppercase tracking-wide text-muted-foreground";

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM);
  const [initial, setInitial] = useState<SettingsForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load settings");
      const next = { ...EMPTY_FORM, ...json.data };
      setForm(next);
      setInitial(next);
      return next;
    },
  });

  const hasChanges = JSON.stringify(form) !== JSON.stringify(initial);

  const resetForm = () => setForm(initial);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Settings saved");
      setInitial(form);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <AdminPageShell
      title="Site settings"
      description="Portal identity, contact details, and editorial defaults"
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
      <WebsiteSectionNav />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Portal identity">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="site-name" className={fieldLabel}>
                    English site name
                  </label>
                  <input
                    id="site-name"
                    type="text"
                    value={form.site_name}
                    onChange={(e) => update("site_name", e.target.value)}
                    className={`${adminInput} w-full`}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="site-name-np" className={fieldLabel}>
                    Nepali site name
                  </label>
                  <input
                    id="site-name-np"
                    type="text"
                    value={form.site_name_np}
                    onChange={(e) => update("site_name_np", e.target.value)}
                    className={`${adminInput} w-full`}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="site-tagline" className={fieldLabel}>
                  Tagline
                </label>
                <input
                  id="site-tagline"
                  type="text"
                  value={form.site_tagline}
                  onChange={(e) => update("site_tagline", e.target.value)}
                  className={`${adminInput} w-full`}
                />
              </div>

              <DualImagePicker
                value={form.site_logo_url}
                onChange={(value) => update("site_logo_url", value)}
                folder="general"
                label="Site logo"
              />
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Press registration">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3 p-3">
              <div className="space-y-1">
                <label htmlFor="dept-reg" className={fieldLabel}>
                  Dept. of Information reg. no.
                </label>
                <input
                  id="dept-reg"
                  type="text"
                  value={form.dept_info_reg}
                  onChange={(e) => update("dept_info_reg", e.target.value)}
                  className={`${adminInput} w-full font-mono`}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="press-reg" className={fieldLabel}>
                  Press Council reg. no.
                </label>
                <input
                  id="press-reg"
                  type="text"
                  value={form.press_council_reg}
                  onChange={(e) => update("press_council_reg", e.target.value)}
                  className={`${adminInput} w-full font-mono`}
                />
              </div>
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Contact">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3 p-3">
              <div className="space-y-1">
                <label htmlFor="contact-email" className={fieldLabel}>
                  Newsroom email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => update("contact_email", e.target.value)}
                  className={`${adminInput} w-full font-mono`}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="contact-phone" className={fieldLabel}>
                  Phone
                </label>
                <input
                  id="contact-phone"
                  type="text"
                  value={form.contact_phone}
                  onChange={(e) => update("contact_phone", e.target.value)}
                  className={`${adminInput} w-full font-mono`}
                />
              </div>
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Editorial defaults">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3 p-3">
              <div className="space-y-1">
                <label htmlFor="comment-mode" className={fieldLabel}>
                  Comment permissions
                </label>
                <select
                  id="comment-mode"
                  value={form.comment_mode}
                  onChange={(e) =>
                    update("comment_mode", e.target.value as SettingsForm["comment_mode"])
                  }
                  className={`${adminSelect} w-full`}
                >
                  <option value="registered">Registered users only</option>
                  <option value="everyone">Everyone</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="author-status" className={fieldLabel}>
                  Default author article status
                </label>
                <select
                  id="author-status"
                  value={form.default_author_status}
                  onChange={(e) =>
                    update(
                      "default_author_status",
                      e.target.value as SettingsForm["default_author_status"]
                    )
                  }
                  className={`${adminSelect} w-full`}
                >
                  <option value="DRAFT">Draft (requires approval)</option>
                  <option value="PUBLISHED">Published immediately</option>
                </select>
              </div>
            </div>
          )}
        </AdminPanel>
      </div>
    </AdminPageShell>
  );
}
