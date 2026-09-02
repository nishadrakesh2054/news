"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default function AdminAccountProfilePage() {
  const [form, setForm] = useState({ name: "", email: "", role: "" });
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/account/profile")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data) {
          setForm({ name: json.data.name, email: json.data.email, role: json.data.role });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: password || undefined,
          currentPassword: password ? currentPassword : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success("Profile updated");
      setPassword("");
      setCurrentPassword("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminPageShell title="My Profile" icon={UserCircle}>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="rounded-xl border bg-card p-4 space-y-3 max-w-md">
          <div className="space-y-1">
            <label className="text-xs font-medium">Name</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Email</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">Role</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm bg-muted" value={form.role} disabled />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium">New password</label>
            <input type="password" className="w-full h-9 rounded-md border px-3 text-sm" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {password ? (
            <div className="space-y-1">
              <label className="text-xs font-medium">Current password</label>
              <input type="password" className="w-full h-9 rounded-md border px-3 text-sm" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
          ) : null}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5 mr-1" />
            Save Profile
          </Button>
        </div>
      )}
    </AdminPageShell>
  );
}
