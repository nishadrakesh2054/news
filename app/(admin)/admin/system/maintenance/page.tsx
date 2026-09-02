"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { RotateCcw, Save } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { SystemSectionNav } from "@/components/admin/SystemSectionNav";
import { AdminPanel } from "@/components/admin/content";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
} from "@/constants/admin-layout";

type MaintenanceForm = {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  cacheEnabled: boolean;
  cronEnabled: boolean;
};

const EMPTY_FORM: MaintenanceForm = {
  maintenanceMode: false,
  maintenanceMessage: "",
  cacheEnabled: true,
  cronEnabled: true,
};

const fieldLabel =
  "text-[10px] font-medium uppercase tracking-wide text-muted-foreground";

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 border-b border-border px-3 py-2.5 last:border-b-0 hover:bg-muted/20">
      <span>
        <span className="text-xs font-medium text-foreground">{label}</span>
        {description ? (
          <span className="mt-0.5 block text-[11px] text-muted-foreground">{description}</span>
        ) : null}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded-sm border-border"
      />
    </label>
  );
}

export default function AdminSystemMaintenancePage() {
  const [form, setForm] = useState<MaintenanceForm>(EMPTY_FORM);
  const [initial, setInitial] = useState<MaintenanceForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-maintenance"],
    queryFn: async () => {
      const res = await fetch("/api/admin/system/maintenance");
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
      const res = await fetch("/api/admin/system/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Maintenance settings saved");
      setInitial(form);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell
      title="Maintenance"
      description="Maintenance mode, cache, and background jobs"
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
      <SystemSectionNav />

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminPanel title="Site availability">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <>
              <ToggleRow
                label="Maintenance mode"
                description="Show a maintenance page to public visitors"
                checked={form.maintenanceMode}
                onChange={(checked) => setForm((f) => ({ ...f, maintenanceMode: checked }))}
              />
              <div className="space-y-1 p-3">
                <label htmlFor="maintenance-message" className={fieldLabel}>
                  Maintenance message
                </label>
                <textarea
                  id="maintenance-message"
                  rows={4}
                  value={form.maintenanceMessage}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maintenanceMessage: e.target.value }))
                  }
                  placeholder="The site is temporarily unavailable…"
                  className={`${adminInput} min-h-[88px] w-full resize-y py-2`}
                />
              </div>
            </>
          )}
        </AdminPanel>

        <AdminPanel title="System services">
          {isLoading ? (
            <p className="px-3 py-6 text-xs text-muted-foreground">Loading…</p>
          ) : (
            <>
              <ToggleRow
                label="Cache enabled"
                description="Use application cache for faster page loads"
                checked={form.cacheEnabled}
                onChange={(checked) => setForm((f) => ({ ...f, cacheEnabled: checked }))}
              />
              <ToggleRow
                label="Cron jobs enabled"
                description="Run scheduled background tasks"
                checked={form.cronEnabled}
                onChange={(checked) => setForm((f) => ({ ...f, cronEnabled: checked }))}
              />
            </>
          )}
        </AdminPanel>
      </div>
    </AdminPageShell>
  );
}
