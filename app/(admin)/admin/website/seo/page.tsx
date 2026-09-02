"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default function AdminWebsiteSeoPage() {
  const [form, setForm] = useState({
    seo_default_title: "",
    seo_default_description: "",
    seo_canonical_url: "",
    seo_og_image: "",
    seo_robots: "index,follow",
    seo_twitter_handle: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/website/seo")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setForm((prev) => ({ ...prev, ...json.data }));
      })
      .finally(() => setLoading(false));
  }, []);

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
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell title="SEO" icon={Search} description="Default meta tags and social sharing">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-xl border bg-card p-4 space-y-3 max-w-2xl">
          {Object.entries(form).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium">{key.replace(/_/g, " ")}</label>
              <input
                className="w-full h-9 rounded-md border px-3 text-sm"
                value={value}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1" />
            Save SEO
          </Button>
        </div>
      )}
    </AdminPageShell>
  );
}
