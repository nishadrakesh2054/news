"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

type FeaturedArticle = {
  id: string;
  title: string;
  slug: string;
  featuredOrder: number | null;
  category: { name: string };
  author: { name: string };
};

export default function AdminFeaturedPage() {
  const queryClient = useQueryClient();
  const [articleId, setArticleId] = useState("");

  const { data = [], isLoading, refetch, isFetching } = useQuery<FeaturedArticle[]>({
    queryKey: ["admin-featured"],
    queryFn: async () => {
      const res = await fetch("/api/admin/featured");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, isFeatured: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      toast.success("Article featured");
      setArticleId("");
      queryClient.invalidateQueries({ queryKey: ["admin-featured"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch("/api/admin/featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId: id, isFeatured: false }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
    },
    onSuccess: () => {
      toast.success("Removed from featured");
      queryClient.invalidateQueries({ queryKey: ["admin-featured"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AdminPageShell title="Featured News" icon={Star} description="Curate homepage featured stories" onRefresh={() => refetch()} isRefreshing={isFetching}>
      <div className="rounded-xl border bg-card p-4 flex gap-2">
        <input
          className="flex-1 h-9 rounded-md border px-3 text-sm"
          placeholder="Article ID to feature"
          value={articleId}
          onChange={(e) => setArticleId(e.target.value)}
        />
        <Button size="sm" onClick={() => addMutation.mutate()} disabled={!articleId}>
          Add Featured
        </Button>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading...</p>
        ) : (
          <table className="w-full text-xs">
            <thead className="bg-muted/50 text-[10px] uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Author</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">{a.title}</td>
                  <td className="px-4 py-3">{a.category.name}</td>
                  <td className="px-4 py-3">{a.author.name}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => removeMutation.mutate(a.id)}>
                      Unfeature
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminPageShell>
  );
}
