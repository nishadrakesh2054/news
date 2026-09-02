"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { adminPageContainer } from "@/constants/admin-layout";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: article, isLoading, isError } = useQuery({
    queryKey: ["admin-article", id],
    queryFn: async () => {
      const res = await fetch(`/api/admin/articles/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch article");
      return json.data;
    },
  });

  if (isLoading) {
    return (
      <div className={adminPageContainer}>
        <p className="py-12 text-center text-xs text-muted-foreground">Loading article…</p>
      </div>
    );
  }

  if (isError || !article) {
    return (
      <div className={adminPageContainer}>
        <p className="py-12 text-center text-xs text-destructive">
          Article not found or failed to load.
        </p>
      </div>
    );
  }

  return <ArticleForm initialData={article} />;
}
