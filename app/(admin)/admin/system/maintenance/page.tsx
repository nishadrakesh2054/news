"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Wrench, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default function AdminSystemMaintenancePage() {
  const [form, setForm] = useState({
    maintenanceMode: false,
    maintenanceMessage: "",
    cacheEnabled: true,
    cronEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/system/maintenance")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) setForm(json.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/system/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Maintenance settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell title="System / Maintenance" icon={Wrench}>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-xl border bg-card p-4 space-y-4 max-w-lg">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.maintenanceMode}
              onChange={(e) => setForm((f) => ({ ...f, maintenanceMode: e.target.checked }))}
            />
            Maintenance mode
          </label>
          <textarea
            className="w-full rounded-md border p-3 text-sm min-h-20"
            value={form.maintenanceMessage}
            onChange={(e) => setForm((f) => ({ ...f, maintenanceMessage: e.target.value }))}
            placeholder="Maintenance message"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.cacheEnabled}
              onChange={(e) => setForm((f) => ({ ...f, cacheEnabled: e.target.checked }))}
            />
            Cache enabled
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.cronEnabled}
              onChange={(e) => setForm((f) => ({ ...f, cronEnabled: e.target.checked }))}
            />
            Cron jobs enabled
          </label>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1" />
            Save
          </Button>
        </div>
      )}
    </AdminPageShell>
  );
}
