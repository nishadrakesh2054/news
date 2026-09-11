"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { SystemSectionNav } from "@/components/admin/SystemSectionNav";
import { AdminPanel, AdminStatsStrip } from "@/components/admin/content";
import {
  adminBtnPrimary,
  adminBtnSecondary,
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
  adminToolbarSelectStatus,
} from "@/constants/admin-layout";
import { ROLE_LABELS } from "@/constants/permissions";

type ModuleDef = {
  id: string;
  label: string;
  actions: { key: string; label: string }[];
};

type RolesPayload = {
  modules: ModuleDef[];
  matrixRoles: Role[];
  permissionsByRole: Record<string, Record<string, boolean>>;
  catalog: string[];
  superAdmin: { label: string; fullAccess: boolean };
};

const CRUD_COLUMNS = ["Create", "Read", "Update", "Delete"] as const;

function findAction(mod: ModuleDef, label: string) {
  return mod.actions.find((a) => a.label === label);
}

function extraActions(mod: ModuleDef) {
  return mod.actions.filter(
    (a) => !(CRUD_COLUMNS as readonly string[]).includes(a.label)
  );
}

function TickCell({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center justify-center gap-1.5">
      <input
        type="checkbox"
        className="h-3.5 w-3.5 accent-[#0C4EA0]"
        checked={checked}
        onChange={onChange}
        aria-label={label}
      />
    </label>
  );
}

export default function AdminSystemRolesPage() {
  const queryClient = useQueryClient();
  const [activeRole, setActiveRole] = useState<Role>(Role.ADMIN);
  const [draft, setDraft] = useState<Record<string, boolean>>({});
  const [dirty, setDirty] = useState(false);

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const res = await fetch("/api/admin/system/roles");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load permissions");
      return json.data as RolesPayload;
    },
  });

  useEffect(() => {
    if (!data?.permissionsByRole?.[activeRole]) return;
    setDraft({ ...data.permissionsByRole[activeRole] });
    setDirty(false);
  }, [data, activeRole]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/system/roles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: activeRole, permissions: draft }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to save");
      return json;
    },
    onSuccess: () => {
      toast.success(`Saved permissions for ${ROLE_LABELS[activeRole]}`);
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const modules = data?.modules ?? [];
  const matrixRoles = data?.matrixRoles ?? [Role.ADMIN, Role.EDITOR, Role.AUTHOR];
  const enabledCount = useMemo(
    () => Object.values(draft).filter(Boolean).length,
    [draft]
  );

  const toggle = (key: string) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
  };

  const setModuleAll = (mod: ModuleDef, value: boolean) => {
    setDraft((prev) => {
      const next = { ...prev };
      for (const action of mod.actions) next[action.key] = value;
      return next;
    });
    setDirty(true);
  };

  return (
    <AdminPageShell
      title="Roles & permissions"
      description="Tick CRUD access per role. Super Admin always has full access."
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          { label: "Editable roles", value: matrixRoles.length },
          { label: "Modules", value: modules.length || "—" },
          { label: "Ticks on", value: enabledCount },
          { label: "Super Admin", value: "Full" },
        ]}
      />

      <SystemSectionNav />

      <AdminPanel title="Super Admin">
        <p className="px-3 py-2.5 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">
            {data?.superAdmin.label ?? "Super Admin"}
          </span>
          {" — "}
          full access to every module. Locked (not editable). Assign from Users.
        </p>
      </AdminPanel>

      <AdminPanel
        title="Permission matrix"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as Role)}
              className={adminToolbarSelectStatus}
              aria-label="Role to edit"
            >
              {matrixRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role] ?? role}
                </option>
              ))}
            </select>
            {dirty ? (
              <button
                type="button"
                className={adminBtnSecondary}
                onClick={() => {
                  if (data?.permissionsByRole?.[activeRole]) {
                    setDraft({ ...data.permissionsByRole[activeRole] });
                    setDirty(false);
                  }
                }}
              >
                Reset
              </button>
            ) : null}
            <button
              type="button"
              className={adminBtnPrimary}
              disabled={!dirty || saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving…" : "Save changes"}
            </button>
          </div>
        }
      >
        {isLoading ? (
          <p className="px-3 py-6 text-xs text-muted-foreground">Loading matrix…</p>
        ) : modules.length === 0 ? (
          <p className="px-3 py-6 text-xs text-muted-foreground">No permission modules.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th className={`${adminTableHeadCell} min-w-32`}>Module</th>
                  {CRUD_COLUMNS.map((col) => (
                    <th key={col} className={`${adminTableHeadCell} text-center w-20`}>
                      {col}
                    </th>
                  ))}
                  <th className={`${adminTableHeadCell} min-w-36`}>Other</th>
                  <th className={`${adminTableHeadCell} text-right w-24`}>Bulk</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod) => {
                  const extras = extraActions(mod);
                  return (
                    <tr key={mod.id} className={adminTableRow}>
                      <td className={`${adminTableCell} font-medium text-foreground`}>
                        {mod.label}
                      </td>
                      {CRUD_COLUMNS.map((col) => {
                        const action = findAction(mod, col);
                        return (
                          <td key={col} className={`${adminTableCell} text-center`}>
                            {action ? (
                              <TickCell
                                checked={Boolean(draft[action.key])}
                                onChange={() => toggle(action.key)}
                                label={`${mod.label} ${col}`}
                              />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        );
                      })}
                      <td className={adminTableCell}>
                        {extras.length === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                            {extras.map((action) => (
                              <label
                                key={action.key}
                                className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-foreground"
                              >
                                <input
                                  type="checkbox"
                                  className="h-3.5 w-3.5 accent-[#0C4EA0]"
                                  checked={Boolean(draft[action.key])}
                                  onChange={() => toggle(action.key)}
                                />
                                {action.label}
                              </label>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className={`${adminTableCell} text-right`}>
                        <div className="inline-flex items-center gap-1 text-[11px]">
                          <button
                            type="button"
                            className="font-medium text-[#0C4EA0] hover:underline"
                            onClick={() => setModuleAll(mod, true)}
                          >
                            All
                          </button>
                          <span className="text-muted-foreground">/</span>
                          <button
                            type="button"
                            className="font-medium text-muted-foreground hover:underline"
                            onClick={() => setModuleAll(mod, false)}
                          >
                            None
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </AdminPageShell>
  );
}
