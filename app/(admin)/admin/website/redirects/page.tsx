"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { WebsiteSectionNav } from "@/components/admin/WebsiteSectionNav";
import { adminBadgeMuted, adminBadgeSuccess } from "@/constants/admin-layout";

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
      description="301/302 URL redirects"
      queryKey="admin-redirects"
      apiPath="/api/admin/website/redirects"
      createFields={[
        { name: "fromPath", label: "From path", placeholder: "/old-article" },
        { name: "toPath", label: "To path", placeholder: "/new-article" },
      ]}
      buildCreatePayload={(v) => ({ fromPath: v.fromPath, toPath: v.toPath, isActive: true })}
      headerSlot={<WebsiteSectionNav />}
      columns={[
        {
          key: "fromPath",
          label: "From",
          render: (row) => <span className="font-mono text-xs">{row.fromPath}</span>,
        },
        {
          key: "toPath",
          label: "To",
          render: (row) => <span className="font-mono text-xs">{row.toPath}</span>,
        },
        {
          key: "isActive",
          label: "Status",
          render: (row) => (
            <span className={row.isActive ? adminBadgeSuccess : adminBadgeMuted}>
              {row.isActive ? "Active" : "Inactive"}
            </span>
          ),
        },
      ]}
    />
  );
}
