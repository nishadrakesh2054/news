"use client";

import { Images } from "lucide-react";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

type GalleryRow = {
  id: string;
  title: string;
  slug: string;
  isPublished: boolean;
  _count?: { items: number };
};

export default function AdminGalleriesPage() {
  return (
    <AdminResourcePage<GalleryRow>
      title="Galleries"
      icon={Images}
      description="Photo galleries and visual stories"
      queryKey="admin-galleries"
      apiPath="/api/admin/galleries"
      createFields={[
        { name: "title", label: "Gallery title" },
        { name: "slug", label: "Slug (optional)" },
      ]}
      buildCreatePayload={(v) => ({ title: v.title, slug: v.slug })}
      columns={[
        { key: "title", label: "Title" },
        { key: "slug", label: "Slug" },
        {
          key: "items",
          label: "Items",
          render: (row) => row._count?.items ?? 0,
        },
        {
          key: "isPublished",
          label: "Status",
          render: (row) => (row.isPublished ? "Published" : "Draft"),
        },
      ]}
    />
  );
}
