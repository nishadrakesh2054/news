"use client";

import { ArrowRightLeft } from "lucide-react";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

type RedirectRow = {
  id: string;
  fromPath: string;
  toPath: string;
  isActive: boolean;
};

export default function AdminWebsiteRedirectsPage() {
  return (
    <AdminResourcePage<RedirectRow>
      title="Redirects"
      icon={ArrowRightLeft}
      description="301/302 URL redirects"
      queryKey="admin-redirects"
      apiPath="/api/admin/website/redirects"
      createFields={[
        { name: "fromPath", label: "From path", placeholder: "/old-article" },
        { name: "toPath", label: "To path", placeholder: "/new-article" },
      ]}
      buildCreatePayload={(v) => ({ fromPath: v.fromPath, toPath: v.toPath, isActive: true })}
      columns={[
        { key: "fromPath", label: "From" },
        { key: "toPath", label: "To" },
        {
          key: "isActive",
          label: "Active",
          render: (row) => (row.isActive ? "Yes" : "No"),
        },
      ]}
    />
  );
}
