"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, RotateCcw, Save } from "lucide-react";
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
  seo_default_title_ne: string;
  seo_default_title_en: string;
  seo_default_description_ne: string;
  seo_default_description_en: string;
  seo_keywords_ne: string;
  seo_keywords_en: string;
  seo_og_image: string;
  seo_og_image_en: string;
  seo_robots: string;
  seo_twitter_handle: string;
};

type SeoInfo = {
  nepaliSiteUrl: string;
  englishSiteUrl: string;
  sitemaps: string[];
  robotsPath: string;
  note: string;
};

const EMPTY_FORM: SeoForm = {
  seo_default_title_ne: "",
  seo_default_title_en: "",
  seo_default_description_ne: "",
  seo_default_description_en: "",
  seo_keywords_ne: "",
  seo_keywords_en: "",
  seo_og_image: "",
  seo_og_image_en: "",
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
  const [info, setInfo] = useState<SeoInfo | null>(null);
  const [saving, setSaving] = useState(false);

  const { isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-website-seo"],
    queryFn: async () => {
      const res = await fetch("/api/admin/website/seo");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Failed to load SEO settings");
      const { info: nextInfo, ...rest } = json.data as SeoForm & { info: SeoInfo };
      const next = { ...EMPTY_FORM, ...rest };
      setForm(next);
      setInitial(next);
      setInfo(nextInfo);
      return next;
    },
  });

  const hasChanges = JSON.stringify(form) !== JSON.stringify(initial);

  const resetForm = () => setForm(initial);

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
      title="Site SEO"
      description="Bilingual site defaults · article SEO is set per story"
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

      <p className="mb-4 text-xs text-muted-foreground">
        These are <span className="font-medium text-foreground">site-wide fallbacks</span> for
        Nepali and English editions. Per-article title/description stay on the article editor.
        Canonical URLs and hreflang are automatic — not edited here.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Nepali edition (नेपाली)">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3 p-3">
              <div className="space-y-1">
                <label htmlFor="seo-title-ne" className={fieldLabel}>
                  Default meta title
                </label>
                <input
                  id="seo-title-ne"
                  type="text"
                  value={form.seo_default_title_ne}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seo_default_title_ne: e.target.value }))
                  }
                  className={`${adminInput} w-full`}
                  placeholder="इको माञ्च | नेपाली समाचार"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="seo-desc-ne" className={fieldLabel}>
                  Default meta description
                </label>
                <textarea
                  id="seo-desc-ne"
                  rows={3}
                  value={form.seo_default_description_ne}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      seo_default_description_ne: e.target.value,
                    }))
                  }
                  className={`${adminInput} min-h-[72px] w-full resize-y py-2`}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="seo-kw-ne" className={fieldLabel}>
                  Keywords (comma-separated)
                </label>
                <input
                  id="seo-kw-ne"
                  type="text"
                  value={form.seo_keywords_ne}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seo_keywords_ne: e.target.value }))
                  }
                  className={`${adminInput} w-full`}
                  placeholder="नेपाल समाचार, राजनीति, खेलकुद"
                />
              </div>
              <DualImagePicker
                value={form.seo_og_image}
                onChange={(value) => setForm((prev) => ({ ...prev, seo_og_image: value }))}
                folder="general"
                label="Default Open Graph image (Nepali)"
              />
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="English edition">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3 p-3">
              <div className="space-y-1">
                <label htmlFor="seo-title-en" className={fieldLabel}>
                  Default meta title
                </label>
                <input
                  id="seo-title-en"
                  type="text"
                  value={form.seo_default_title_en}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seo_default_title_en: e.target.value }))
                  }
                  className={`${adminInput} w-full`}
                  placeholder="Echo Manch | Nepali News"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="seo-desc-en" className={fieldLabel}>
                  Default meta description
                </label>
                <textarea
                  id="seo-desc-en"
                  rows={3}
                  value={form.seo_default_description_en}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      seo_default_description_en: e.target.value,
                    }))
                  }
                  className={`${adminInput} min-h-[72px] w-full resize-y py-2`}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="seo-kw-en" className={fieldLabel}>
                  Keywords (comma-separated)
                </label>
                <input
                  id="seo-kw-en"
                  type="text"
                  value={form.seo_keywords_en}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seo_keywords_en: e.target.value }))
                  }
                  className={`${adminInput} w-full`}
                  placeholder="Nepal news, politics, sports"
                />
              </div>
              <DualImagePicker
                value={form.seo_og_image_en}
                onChange={(value) => setForm((prev) => ({ ...prev, seo_og_image_en: value }))}
                folder="general"
                label="Default Open Graph image (English)"
              />
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Shared (both editions)">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <div className="space-y-3 p-3">
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
              <div className="space-y-1">
                <label htmlFor="seo-twitter" className={fieldLabel}>
                  Twitter / X handle
                </label>
                <input
                  id="seo-twitter"
                  type="text"
                  placeholder="@echomanch"
                  value={form.seo_twitter_handle}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, seo_twitter_handle: e.target.value }))
                  }
                  className={`${adminInput} w-full`}
                />
              </div>
            </div>
          )}
        </AdminPanel>

        <AdminPanel title="Automatic (read-only)">
          <div className="space-y-3 p-3 text-xs text-muted-foreground">
            <p>{info?.note}</p>
            <div className="space-y-1">
              <p className={fieldLabel}>Nepali site</p>
              <p className="font-mono text-foreground">{info?.nepaliSiteUrl ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className={fieldLabel}>English site</p>
              <p className="font-mono text-foreground">{info?.englishSiteUrl ?? "—"}</p>
            </div>
            <div className="space-y-1">
              <p className={fieldLabel}>Robots</p>
              <a
                href={info?.robotsPath ?? "/robots.txt"}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[#0C4EA0] hover:underline"
              >
                /robots.txt
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="space-y-1">
              <p className={fieldLabel}>Sitemaps</p>
              <ul className="space-y-1">
                {(info?.sitemaps ?? []).map((url) => (
                  <li key={url}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 break-all font-mono text-[#0C4EA0] hover:underline"
                    >
                      {url}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AdminPanel>
      </div>
    </AdminPageShell>
  );
}
