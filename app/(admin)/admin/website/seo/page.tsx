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

type SeoForm = {
  seo_default_title: string;
  seo_default_description: string;
  seo_canonical_url: string;
  seo_og_image: string;
  seo_robots: string;
  seo_twitter_handle: string;
};

const EMPTY_FORM: SeoForm = {
  seo_default_title: "",
  seo_default_description: "",
  seo_canonical_url: "",
  seo_og_image: "",
  seo_robots: "index,follow",
  seo_twitter_handle: "",
};

const ROBOTS_OPTIONS = [
  "index,follow",
  "index,nofollow",
  "noindex,follow",
  "noindex,nofollow",
];

const fieldLabel =
  "text-[10px] font-medium uppercase tracking-wide text-muted-foreground";

export default function AdminWebsiteSeoPage() {
  const [form, setForm] = useState<SeoForm>(EMPTY_FORM);
  const [initial, setInitial] = useState<SeoForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-website-seo"],
    queryFn: async () => {
      const res = await fetch("/api/admin/website/seo");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load SEO settings");
      const next = { ...EMPTY_FORM, ...json.data };
      setForm(next);
      setInitial(next);
      return next;
    },
  });

  const hasChanges = JSON.stringify(form) !== JSON.stringify(initial);

  const resetForm = () => {
    setForm(initial);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/website/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("SEO settings saved");
      setInitial(form);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell
      title="SEO"
      description="Default meta tags, robots, and social sharing"
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
        <AdminPanel title="Meta defaults">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3 p-3">
              <div className="space-y-1">
                <label htmlFor="seo-title" className={fieldLabel}>
                  Default meta title
                </label>
                <input
                  id="seo-title"
                  type="text"
                  value={form.seo_default_title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seo_default_title: e.target.value }))
                  }
                  className={`${adminInput} w-full`}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="seo-description" className={fieldLabel}>
                  Default meta description
                </label>
                <textarea
                  id="seo-description"
                  rows={3}
                  value={form.seo_default_description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seo_default_description: e.target.value }))
                  }
                  className={`${adminInput} min-h-[72px] w-full resize-y py-2`}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="seo-robots" className={fieldLabel}>
                  Robots directive
                </label>
                <select
                  id="seo-robots"
                  value={form.seo_robots}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seo_robots: e.target.value }))
                  }
                  className={`${adminSelect} w-full`}
                >
                  {ROBOTS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Social & canonical">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3 p-3">
              <div className="space-y-1">
                <label htmlFor="seo-canonical" className={fieldLabel}>
                  Canonical URL
                </label>
                <input
                  id="seo-canonical"
                  type="url"
                  value={form.seo_canonical_url}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seo_canonical_url: e.target.value }))
                  }
                  className={`${adminInput} w-full font-mono`}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="seo-twitter" className={fieldLabel}>
                  Twitter handle
                </label>
                <input
                  id="seo-twitter"
                  type="text"
                  placeholder="@yourhandle"
                  value={form.seo_twitter_handle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seo_twitter_handle: e.target.value }))
                  }
                  className={`${adminInput} w-full`}
                />
              </div>

              <DualImagePicker
                value={form.seo_og_image}
                onChange={(value) => setForm((prev) => ({ ...prev, seo_og_image: value }))}
                folder="general"
                label="Default Open Graph image"
              />
            </div>
          )}
        </AdminPanel>
      </div>
    </AdminPageShell>
  );
}
