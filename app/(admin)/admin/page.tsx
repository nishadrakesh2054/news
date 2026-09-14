"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  FileText,
  MessageSquare,
  Plus,
  ClipboardCheck,
  Zap,
  Star,
  Radio,
  Megaphone,
  Mail,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  AdminDataTable,
  AdminPanel,
  AdminStatsStrip,
} from "@/components/admin/content";
import {
  adminBadge,
  adminBadgeMuted,
  adminBadgeSuccess,
  adminBadgeWarning,
  adminBtnPrimary,
  adminBtnSecondary,
} from "@/constants/admin-layout";

interface ArticleRow {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  status: string;
  views: number;
  isBreaking?: boolean;
  isFeatured?: boolean;
  type?: string;
  publishedAt?: string | null;
  updatedAt: string;
  createdAt: string;
  category?: { name: string; nameNp?: string | null };
  author?: { name: string };
}

interface CommentRow {
  id: string;
  content: string;
  authorName: string | null;
  createdAt: string;
  article: { id: string; title: string; titleNp?: string | null };
}

interface ActivityRow {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  details: string | null;
  createdAt: string;
  user: { name: string } | null;
}

function articleTitle(row: Pick<ArticleRow, "title" | "titleNp">) {
  return row.titleNp || row.title;
}

function statusBadge(status: string) {
  if (status === "PUBLISHED") return adminBadgeSuccess;
  if (status === "PENDING") return adminBadgeWarning;
  if (status === "DRAFT") return adminBadgeMuted;
  return adminBadgeMuted;
}

function formatWhen(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const SHORTCUTS = [
  { href: "/admin/articles/new", label: "New article" },
  { href: "/admin/articles/review", label: "Review queue" },
  { href: "/admin/breaking", label: "Breaking" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/live", label: "Live" },
  { href: "/admin/featured", label: "Featured" },
  { href: "/admin/analytics", label: "Analytics" },
] as const;

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
      return json.data as {
        stats: {
          published: number;
          drafts: number;
          pending: number;
          archived: number;
          breaking: number;
          featured: number;
          live: number;
          totalViews: number;
          pendingComments: number;
          activeAds: number;
          newsletter: number;
          publishedToday: number;
          totalArticles: number;
        };
        queues: {
          needsReview: ArticleRow[];
          recentDrafts: ArticleRow[];
          recentPublished: ArticleRow[];
          topArticles: ArticleRow[];
          pendingComments: CommentRow[];
          activeBreaking: ArticleRow[];
          recentActivity: ActivityRow[];
        };
      };
    },
    refetchInterval: 60_000,
  });

  const stats = data?.stats;
  const queues = data?.queues;

  return (
    <AdminPageShell
      title="Overview"
      description="Live newsroom counts, queues, and recent activity"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <Link href="/admin/articles/new" className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New article
        </Link>
      }
    >
      {isError ? (
        <p className="rounded-sm border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          Could not load dashboard data.{" "}
          <button type="button" className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </p>
      ) : null}

      <AdminStatsStrip
        loading={isLoading}
        stats={[
          {
            label: "Published",
            value: stats?.published ?? 0,
            hint: `${stats?.publishedToday ?? 0} today`,
            icon: Eye,
          },
          {
            label: "Needs review",
            value: stats?.pending ?? 0,
            hint: "Pending approval",
            icon: ClipboardCheck,
          },
          {
            label: "Drafts",
            value: stats?.drafts ?? 0,
            hint: "In progress",
            icon: FileText,
          },
          {
            label: "Total views",
            value: (stats?.totalViews ?? 0).toLocaleString(),
            hint: "All-time article views",
            icon: Eye,
          },
          {
            label: "Breaking",
            value: stats?.breaking ?? 0,
            hint: "Live breaking flag",
            icon: Zap,
          },
          {
            label: "Comments",
            value: stats?.pendingComments ?? 0,
            hint: "Awaiting moderation",
            icon: MessageSquare,
          },
          {
            label: "Featured",
            value: stats?.featured ?? 0,
            hint: "Homepage featured",
            icon: Star,
          },
          {
            label: "Live blogs",
            value: stats?.live ?? 0,
            hint: "Published live type",
            icon: Radio,
          },
          {
            label: "Active ads",
            value: stats?.activeAds ?? 0,
            hint: "Currently running",
            icon: Megaphone,
          },
          {
            label: "Newsletter",
            value: stats?.newsletter ?? 0,
            hint: "Active subscribers",
            icon: Mail,
          },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        {SHORTCUTS.map((item) => (
          <Link key={item.href} href={item.href} className={adminBtnSecondary}>
            {item.label}
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminPanel
          title="Review queue"
          action={
            <Link
              href="/admin/articles/review"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Open review
            </Link>
          }
        >
          <AdminDataTable<ArticleRow>
            loading={isLoading}
            rows={queues?.needsReview ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No articles waiting for review."
            columns={[
              {
                key: "title",
                label: "Title",
                render: (row) => (
                  <Link
                    href={`/admin/articles/${row.id}/edit`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {articleTitle(row)}
                  </Link>
                ),
              },
              {
                key: "author",
                label: "Author",
                render: (row) => row.author?.name ?? "—",
              },
              {
                key: "updatedAt",
                label: "Updated",
                cellClassName: "whitespace-nowrap text-muted-foreground",
                render: (row) => formatWhen(row.updatedAt),
              },
            ]}
          />
        </AdminPanel>

        <AdminPanel
          title="Pending comments"
          action={
            <Link
              href="/admin/comments"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Moderate
            </Link>
          }
        >
          <AdminDataTable<CommentRow>
            loading={isLoading}
            rows={queues?.pendingComments ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No comments waiting."
            columns={[
              {
                key: "content",
                label: "Comment",
                render: (row) => (
                  <span className="line-clamp-2 text-foreground">
                    {row.content}
                  </span>
                ),
              },
              {
                key: "article",
                label: "Article",
                render: (row) => (
                  <Link
                    href={`/admin/articles/${row.article.id}/edit`}
                    className="text-muted-foreground hover:underline"
                  >
                    {row.article.titleNp || row.article.title}
                  </Link>
                ),
              },
              {
                key: "createdAt",
                label: "When",
                cellClassName: "whitespace-nowrap text-muted-foreground",
                render: (row) => formatWhen(row.createdAt),
              },
            ]}
          />
        </AdminPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminPanel
          title="Active breaking"
          action={
            <Link
              href="/admin/breaking"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Manage
            </Link>
          }
        >
          <AdminDataTable<ArticleRow>
            loading={isLoading}
            rows={queues?.activeBreaking ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No breaking stories right now."
            columns={[
              {
                key: "title",
                label: "Title",
                render: (row) => (
                  <Link
                    href={`/admin/articles/${row.id}/edit`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {articleTitle(row)}
                  </Link>
                ),
              },
              {
                key: "views",
                label: "Views",
                align: "right",
                cellClassName: "font-mono tabular-nums",
                render: (row) => row.views.toLocaleString(),
              },
              {
                key: "updatedAt",
                label: "Updated",
                cellClassName: "whitespace-nowrap text-muted-foreground",
                render: (row) => formatWhen(row.updatedAt),
              },
            ]}
          />
        </AdminPanel>

        <AdminPanel
          title="Top articles by views"
          action={
            <Link
              href="/admin/analytics/articles"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              Full report
            </Link>
          }
        >
          <AdminDataTable<ArticleRow>
            loading={isLoading}
            rows={queues?.topArticles ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No published articles yet."
            columns={[
              {
                key: "title",
                label: "Title",
                render: (row) => (
                  <Link
                    href={`/admin/articles/${row.id}/edit`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {articleTitle(row)}
                  </Link>
                ),
              },
              {
                key: "category",
                label: "Category",
                render: (row) =>
                  row.category?.nameNp || row.category?.name || "—",
              },
              {
                key: "views",
                label: "Views",
                align: "right",
                cellClassName: "font-mono tabular-nums text-muted-foreground",
                render: (row) => row.views.toLocaleString(),
              },
            ]}
          />
        </AdminPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AdminPanel
          title="Recently published"
          action={
            <Link
              href="/admin/articles"
              className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
            >
              All articles
            </Link>
          }
        >
          <AdminDataTable<ArticleRow>
            loading={isLoading}
            rows={queues?.recentPublished ?? []}
            rowKey={(row) => row.id}
            emptyMessage="Nothing published yet."
            columns={[
              {
                key: "title",
                label: "Title",
                render: (row) => (
                  <div className="space-y-1">
                    <Link
                      href={`/admin/articles/${row.id}/edit`}
                      className="font-medium text-foreground hover:underline"
                    >
                      {articleTitle(row)}
                    </Link>
                    <div className="flex flex-wrap gap-1">
                      {row.isBreaking ? (
                        <span className={adminBadge}>Breaking</span>
                      ) : null}
                      {row.isFeatured ? (
                        <span className={adminBadgeMuted}>Featured</span>
                      ) : null}
                    </div>
                  </div>
                ),
              },
              {
                key: "author",
                label: "Author",
                render: (row) => row.author?.name ?? "—",
              },
              {
                key: "publishedAt",
                label: "Published",
                cellClassName: "whitespace-nowrap text-muted-foreground",
                render: (row) => formatWhen(row.publishedAt),
              },
            ]}
          />
        </AdminPanel>

        <AdminPanel title="Recent drafts">
          <AdminDataTable<ArticleRow>
            loading={isLoading}
            rows={queues?.recentDrafts ?? []}
            rowKey={(row) => row.id}
            emptyMessage="No drafts."
            columns={[
              {
                key: "title",
                label: "Title",
                render: (row) => (
                  <Link
                    href={`/admin/articles/${row.id}/edit`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {articleTitle(row)}
                  </Link>
                ),
              },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <span className={statusBadge(row.status)}>{row.status}</span>
                ),
              },
              {
                key: "updatedAt",
                label: "Updated",
                cellClassName: "whitespace-nowrap text-muted-foreground",
                render: (row) => formatWhen(row.updatedAt),
              },
            ]}
          />
        </AdminPanel>
      </div>

      <AdminPanel
        title="Recent activity"
        action={
          <Link
            href="/admin/system/audit-logs"
            className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
          >
            Audit log
          </Link>
        }
      >
        <AdminDataTable<ActivityRow>
          loading={isLoading}
          rows={queues?.recentActivity ?? []}
          rowKey={(row) => row.id}
          emptyMessage="No audit activity yet."
          columns={[
            {
              key: "action",
              label: "Action",
              render: (row) => (
                <span className="font-medium text-foreground">{row.action}</span>
              ),
            },
            {
              key: "entity",
              label: "Entity",
              render: (row) => (
                <span className="text-muted-foreground">
                  {row.entity}
                  {row.entityId ? ` · ${row.entityId.slice(0, 8)}` : ""}
                </span>
              ),
            },
            {
              key: "user",
              label: "User",
              render: (row) => row.user?.name ?? "System",
            },
            {
              key: "createdAt",
              label: "When",
              cellClassName: "whitespace-nowrap text-muted-foreground",
              render: (row) => formatWhen(row.createdAt),
            },
          ]}
        />
      </AdminPanel>
    </AdminPageShell>
  );
}
