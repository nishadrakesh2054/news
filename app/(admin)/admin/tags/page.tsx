"use client";

import { Tag } from "lucide-react";
import { AdminResourcePage } from "@/components/admin/AdminResourcePage";

type TagRow = { id: string; name: string; slug: string; _count?: { articles: number } };

export default function AdminTagsPage() {
  return (
    <AdminResourcePage<TagRow>
      title="Tags"
      icon={Tag}
      description="Manage article tags and SEO keywords"
      queryKey="admin-tags"
      apiPath="/api/admin/tags"
      createFields={[
        { name: "name", label: "Tag name", placeholder: "Politics" },
        { name: "slug", label: "Slug (optional)", placeholder: "politics" },
      ]}
      buildCreatePayload={(v) => ({ name: v.name, slug: v.slug })}
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        {
          key: "articles",
          label: "Articles",
          render: (row) => row._count?.articles ?? 0,
        },
      ]}
    />
  );
}
