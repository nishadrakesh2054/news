"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Pencil,
  Clock,
  Radio,
  Plus,
  Zap,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/analytics");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      return json.data;
    },
  });

  const publishedCount = data?.publishedCount ?? 0;
  const breakingCount = data?.breakingCount ?? 0;
  const totalViews = data?.totalViews ?? 0;
  const topArticles = data?.topArticles ?? [];

  return (
    <div className="space-y-3 w-full px-6 py-2 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-serif">
            Newsroom Dashboard
          </h1>
        </div>
        <Link href="/admin/articles/new">
          <Button className="h-8 rounded-lg bg-brand hover:bg-[#0B3F8A] text-white shadow-xs text-[11px] font-bold px-3 py-1 flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Create News</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{isLoading ? "—" : publishedCount}</div>
            <div className="text-xs font-medium text-muted-foreground">Published Articles</div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/20 shrink-0">
            <Pencil className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{isLoading ? "—" : data?.totalArticles ?? 0}</div>
            <div className="text-xs font-medium text-muted-foreground">Total Articles</div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{isLoading ? "—" : totalViews.toLocaleString()}</div>
            <div className="text-xs font-medium text-muted-foreground">Total Views</div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 shrink-0">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight">{isLoading ? "—" : breakingCount}</div>
            <div className="text-xs font-medium text-muted-foreground">Breaking Stories</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/admin/articles/new">
          <button className="w-full flex items-center justify-center space-x-2 rounded-xl border border-brand/20 bg-card py-2.5 px-4 text-xs font-semibold text-brand hover:bg-brand/10 shadow-sm">
            <FileText className="h-4 w-4" />
            <span>New Article</span>
          </button>
        </Link>
        <Link href="/admin/breaking">
          <button className="w-full flex items-center justify-center space-x-2 rounded-xl border border-rose-500/20 bg-card py-2.5 px-4 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 shadow-sm">
            <Zap className="h-4 w-4" />
            <span>Breaking News</span>
          </button>
        </Link>
        <Link href="/admin/live">
          <button className="w-full flex items-center justify-center space-x-2 rounded-xl border border-emerald-500/20 bg-card py-2.5 px-4 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 shadow-sm">
            <Radio className="h-4 w-4" />
            <span>Live Coverage</span>
          </button>
        </Link>
        <Link href="/admin/homepage">
          <button className="w-full flex items-center justify-center space-x-2 rounded-xl border bg-card py-2.5 px-4 text-xs font-semibold text-foreground hover:bg-muted shadow-sm">
            <Home className="h-4 w-4" />
            <span>Homepage Manager</span>
          </button>
        </Link>
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-5">
        <div className="flex items-center justify-between border-b pb-3 mb-2">
          <h3 className="font-bold text-sm">Top Articles by Views</h3>
          <Link href="/admin/analytics" className="text-xs font-medium text-blue-600 hover:underline">
            View analytics
          </Link>
        </div>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-4">Loading...</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] font-bold uppercase text-muted-foreground border-b">
              <tr>
                <th className="py-2">Title</th>
                <th className="py-2">Category</th>
                <th className="py-2 text-right">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {topArticles.map((art: { id: string; title: string; category: { name: string }; views: number }) => (
                <tr key={art.id}>
                  <td className="py-3 pr-2 truncate max-w-md">{art.title}</td>
                  <td className="py-3">{art.category?.name}</td>
                  <td className="py-3 text-right font-mono">{art.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
