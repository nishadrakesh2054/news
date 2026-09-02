"use client";

import { Bell } from "lucide-react";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

type NotificationRow = {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: string;
};

export default function AdminNotificationsPage() {
  return (
    <AdminResourcePage<NotificationRow>
      title="Notifications"
      icon={Bell}
      description="Push alerts and newsroom notifications"
      queryKey="admin-notifications"
      apiPath="/api/admin/notifications"
      createFields={[
        { name: "title", label: "Title" },
        { name: "body", label: "Message body" },
      ]}
      buildCreatePayload={(v) => ({ title: v.title, body: v.body, type: "SYSTEM", status: "DRAFT" })}
      columns={[
        { key: "title", label: "Title" },
        { key: "type", label: "Type" },
        { key: "status", label: "Status" },
        {
          key: "createdAt",
          label: "Created",
          render: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
      ]}
    />
  );
}
