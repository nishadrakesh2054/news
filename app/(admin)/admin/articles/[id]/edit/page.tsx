"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArticleForm } from "@/components/admin/ArticleForm";

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
    return <div className="p-12 text-center text-muted-foreground">Loading article data...</div>;
  }

  if (isError || !article) {
    return <div className="p-12 text-center text-destructive">Article not found or failed to load.</div>;
  }

  return <ArticleForm initialData={article} />;
}
