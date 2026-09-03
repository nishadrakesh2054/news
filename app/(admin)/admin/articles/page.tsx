"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  ImageIcon,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Eye,
  Zap,
  Clock,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { AdminStatsStrip } from "@/components/admin/content";
import {
  adminBadgeMuted,
  adminBtnGhost,
  adminBtnPrimary,
  adminBtnSecondary,
  adminInput,
  adminPanel,
  adminSelect,
  adminTable,
  adminTableCell,
  adminTableHead,
  adminTableHeadCell,
  adminTableRow,
  adminToolbarPanel,
  adminToolbarFilters,
  adminToolbarSearch,
  adminToolbarSelectMd,
  adminToolbarSelectSm,
  adminToolbarSelectStatus,
} from "@/constants/admin-layout";
import { ArticleStatus, ArticleType, LanguageEdition } from "@prisma/client";
import { NEPAL_PROVINCES, getProvinceLabel } from "@/constants/provinces";

interface ArticleItem {
  id: string;
  title: string;
  titleNp: string | null;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  status: ArticleStatus;
  type: ArticleType;
  languageEdition?: LanguageEdition;
  isFeatured: boolean;
  isBreaking: boolean;
  views: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  province: number | null;
  district: string | null;
  createdAt: string;
  author: {
    name: string;
    email: string;
  };
  category: {
    id: string;
    name: string;
    nameNp: string | null;
  };
  tags: Array<{ id: string; name: string; slug: string }>;
}

interface TagOption {
  id: string;
  name: string;
  slug: string;
}

interface CategoryOption {
  id: string;
  name: string;
  nameNp: string | null;
  slug: string;
}

type SortField = "title" | "views" | "createdAt" | "status";

export default function AdminArticlesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [tagFilter, setTagFilter] = useState<string>("ALL");
  const [provinceFilter, setProvinceFilter] = useState<string>("ALL");
  const [languageFilter, setLanguageFilter] = useState<string>("ALL");
  const [districtFilter, setDistrictFilter] = useState<string>("");
  const [scheduledOnly, setScheduledOnly] = useState(false);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch Categories for Filter Dropdown
  const { data: categoriesData = [] } = useQuery<CategoryOption[]>({
    queryKey: ["admin-categories-filter"],
    queryFn: async () => {
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to fetch categories");
      return json.data;
    },
  });

  const { data: tagsData = [] } = useQuery<TagOption[]>({
    queryKey: ["admin-tags-filter"],
    queryFn: async () => {
      const res = await fetch("/api/admin/tags");
      const json = await res.json();
      if (!res.ok) throw new Error("Failed to fetch tags");
      return json.data;
    },
  });

  // Fetch Articles with Server Query Params
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: [
      "admin-articles",
      search,
      statusFilter,
      typeFilter,
      categoryFilter,
      tagFilter,
      provinceFilter,
      languageFilter,
      districtFilter,
      scheduledOnly,
      page,
      limit,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search.trim()) params.append("search", search.trim());
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (typeFilter !== "ALL") params.append("type", typeFilter);
      if (categoryFilter !== "ALL") params.append("categoryId", categoryFilter);
      if (tagFilter !== "ALL") params.append("tagId", tagFilter);
      if (provinceFilter !== "ALL") params.append("province", provinceFilter);
      if (languageFilter !== "ALL") params.append("languageEdition", languageFilter);
      if (districtFilter.trim()) params.append("district", districtFilter.trim());
      if (scheduledOnly) params.append("scheduled", "true");

      const res = await fetch(`/api/admin/articles?${params.toString()}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to fetch articles");
      return json.data;
    },
  });

  // Toggle status mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ArticleStatus }) => {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          ...(status === ArticleStatus.PUBLISHED ? { scheduledAt: null } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update article status");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete article");
      return json.data;
    },
    onSuccess: () => {
      toast.success("Article deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-articles"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const sortedArticles = useMemo(() => {
    const rawArticles: ArticleItem[] = data?.articles || [];
    return [...rawArticles].sort((a, b) => {
      let valA: string | number = a[sortField as keyof ArticleItem] as string | number;
      let valB: string | number = b[sortField as keyof ArticleItem] as string | number;

      if (sortField === "title") {
        valA = (a.titleNp || a.title).toLowerCase();
        valB = (b.titleNp || b.title).toLowerCase();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data?.articles, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setTagFilter("ALL");
    setProvinceFilter("ALL");
    setLanguageFilter("ALL");
    setDistrictFilter("");
    setScheduledOnly(false);
    setPage(1);
    toast.success("Filters reset");
  };

  const isFiltered =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    tagFilter !== "ALL" ||
    provinceFilter !== "ALL" ||
    languageFilter !== "ALL" ||
    districtFilter.trim() !== "" ||
    scheduledOnly;

  const pagination = data?.pagination;
  const summary = data?.summary;
  const filteredHint = isFiltered ? "Matching filters" : "All articles";

  const formatLanguageLabel = (edition?: LanguageEdition) => {
    switch (edition) {
      case LanguageEdition.ENGLISH_ONLY:
        return "EN";
      case LanguageEdition.BOTH:
        return "NE+EN";
      default:
        return "NE";
    }
  };

  const formatTypeLabel = (type: ArticleType) => {
    switch (type) {
      case ArticleType.BREAKING:
        return "Breaking";
      case ArticleType.LIVE:
        return "Live";
      case ArticleType.OPINION:
        return "Opinion";
      case ArticleType.FEATURE:
        return "Feature";
      default:
        return "Standard";
    }
  };

  const formatScheduledAt = (value: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString("en-NP", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [now] = useState(() => Date.now());

  const isScheduledPending = (art: ArticleItem) => {
    if (!art.scheduledAt) return false;
    const scheduled = new Date(art.scheduledAt);
    return (
      scheduled.getTime() > now &&
      (art.status === ArticleStatus.DRAFT || art.status === ArticleStatus.PENDING)
    );
  };

  const statusOptions = [
    { value: "ALL", label: "All statuses" },
    { value: "PUBLISHED", label: "Published" },
    { value: "PENDING", label: "Review queue" },
    { value: "DRAFT", label: "Draft" },
    { value: "ARCHIVED", label: "Archived" },
  ];

  return (
    <AdminPageShell
      title="Articles"
      description="Manage stories, drafts, and published content"
      onRefresh={() => refetch()}
      isRefreshing={isFetching}
      actions={
        <Link href="/admin/articles/new" className={adminBtnPrimary}>
          <Plus className="h-3.5 w-3.5" />
          New article
        </Link>
      }
    >
      <AdminStatsStrip
        loading={isLoading}
        stats={[
          {
            label: "Total articles",
            value: summary?.total ?? 0,
            hint: filteredHint,
            icon: FileText,
          },
          {
            label: "Published",
            value: summary?.published ?? 0,
            hint:
              summary?.pending && summary.pending > 0
                ? `${summary.pending} in review`
                : "Live on site",
            icon: Eye,
          },
          {
            label: "Drafts",
            value: summary?.draft ?? 0,
            hint:
              summary?.scheduled && summary.scheduled > 0
                ? `${summary.scheduled} scheduled`
                : summary?.archived && summary.archived > 0
                  ? `${summary.archived} archived`
                  : "Not published",
            icon: Clock,
          },
          {
            label: "Total views",
            value: (summary?.views ?? 0).toLocaleString(),
            hint:
              summary?.breaking && summary.breaking > 0
                ? `${summary.breaking} breaking`
                : "Across filtered set",
            icon: Zap,
          },
        ]}
      />

      <div className={adminToolbarPanel}>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className={adminToolbarSearch}>
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className={`${adminInput} w-full pl-7 pr-7`}
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground lg:ml-auto">
            <span>Rows</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className={adminToolbarSelectSm}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className={`${adminToolbarFilters} border-t border-border/50 pt-2`}>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className={adminToolbarSelectStatus}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className={adminToolbarSelectMd}
          >
            <option value="ALL">All categories</option>
            {categoriesData.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameNp || cat.name}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className={adminToolbarSelectMd}
          >
            <option value="ALL">All formats</option>
            <option value="STANDARD">Standard</option>
            <option value="BREAKING">Breaking</option>
            <option value="LIVE">Live</option>
            <option value="OPINION">Opinion</option>
            <option value="FEATURE">Feature</option>
          </select>

          <select
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1);
            }}
            className={adminToolbarSelectMd}
          >
            <option value="ALL">All tags</option>
            {tagsData.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>

          <select
            value={provinceFilter}
            onChange={(e) => {
              setProvinceFilter(e.target.value);
              setPage(1);
            }}
            className={adminToolbarSelectMd}
          >
            <option value="ALL">All provinces</option>
            {NEPAL_PROVINCES.map((province) => (
              <option key={province.value} value={province.value}>
                {province.label}
              </option>
            ))}
          </select>

          <select
            value={languageFilter}
            onChange={(e) => {
              setLanguageFilter(e.target.value);
              setPage(1);
            }}
            className={adminToolbarSelectMd}
          >
            <option value="ALL">All languages</option>
            <option value="NEPALI_ONLY">Nepali only</option>
            <option value="ENGLISH_ONLY">English only</option>
            <option value="BOTH">Both editions</option>
          </select>

          <input
            type="text"
            placeholder="District…"
            value={districtFilter}
            onChange={(e) => {
              setDistrictFilter(e.target.value);
              setPage(1);
            }}
            className={`${adminInput} h-8 w-full min-w-[7rem] sm:w-28`}
          />

          <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-sm border border-border/70 px-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={scheduledOnly}
              onChange={(e) => {
                setScheduledOnly(e.target.checked);
                setPage(1);
              }}
              className="h-3.5 w-3.5 rounded-sm accent-[#0C4EA0]"
            />
            Scheduled
          </label>

          {isFiltered ? (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-8 items-center px-2 text-xs font-medium text-[#C3272E] hover:underline"
            >
              Reset filters
            </button>
          ) : null}
        </div>
      </div>

      <div className={adminPanel}>
        {isLoading ? (
          <p className="px-3 py-8 text-center text-xs text-muted-foreground">Loading articles…</p>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-xs text-destructive">Failed to load articles.</p>
        ) : sortedArticles.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-muted-foreground">
            <p>No articles match your filters.</p>
            {isFiltered ? (
              <button type="button" onClick={resetFilters} className={`${adminBtnGhost} mt-2`}>
                Clear filters
              </button>
            ) : null}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={adminTable}>
              <thead className={adminTableHead}>
                <tr>
                  <th
                    className={`${adminTableHeadCell} cursor-pointer select-none`}
                    onClick={() => handleSort("title")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Title
                      {sortField === "title" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </span>
                  </th>
                  <th className={adminTableHeadCell}>Category</th>
                  <th className={adminTableHeadCell}>Format</th>
                  <th
                    className={`${adminTableHeadCell} cursor-pointer select-none`}
                    onClick={() => handleSort("status")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Status
                      {sortField === "status" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </span>
                  </th>
                  <th
                    className={`${adminTableHeadCell} cursor-pointer select-none`}
                    onClick={() => handleSort("views")}
                  >
                    <span className="inline-flex items-center gap-1">
                      Views
                      {sortField === "views" ? (
                        sortOrder === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </span>
                  </th>
                  <th className={adminTableHeadCell}>Author</th>
                  <th className={`${adminTableHeadCell} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedArticles.map((art) => (
                  <tr key={art.id} className={adminTableRow}>
                    <td className={`${adminTableCell} max-w-md`}>
                      <div className="flex items-center gap-2.5">
                        {art.coverImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={art.coverImage}
                            alt=""
                            className="h-8 w-8 shrink-0 border border-border/70 object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-dashed border-border/70 bg-muted/20 text-muted-foreground">
                            <ImageIcon className="h-3.5 w-3.5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="mb-0.5 flex flex-wrap gap-1">
                            {art.isFeatured ? <span className={adminBadgeMuted}>Lead</span> : null}
                            {art.isBreaking ? (
                              <span className="inline-flex items-center rounded-sm border border-[#C3272E]/30 bg-[#C3272E]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#C3272E]">
                                Breaking
                              </span>
                            ) : null}
                            <span className={adminBadgeMuted}>{formatLanguageLabel(art.languageEdition)}</span>
                            {isScheduledPending(art) ? (
                              <span className="inline-flex items-center rounded-sm border border-[#0C4EA0]/30 bg-[#0C4EA0]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#0C4EA0]">
                                Scheduled
                              </span>
                            ) : null}
                          </div>
                          <p className="truncate font-medium text-foreground">
                            {art.titleNp || art.title}
                          </p>
                          {art.titleNp ? (
                            <p className="truncate text-[11px] text-muted-foreground">{art.title}</p>
                          ) : null}
                          {isScheduledPending(art) ? (
                            <p className="truncate text-[10px] text-[#0C4EA0]">
                              Publishes {formatScheduledAt(art.scheduledAt)}
                            </p>
                          ) : null}
                          {art.province || art.district ? (
                            <p className="truncate text-[10px] text-muted-foreground">
                              {[getProvinceLabel(art.province), art.district].filter(Boolean).join(" · ")}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className={`${adminTableCell} whitespace-nowrap`}>
                      <span className={adminBadgeMuted}>
                        {art.category.nameNp || art.category.name}
                      </span>
                    </td>
                    <td className={`${adminTableCell} whitespace-nowrap`}>
                      <span className={adminBadgeMuted}>{formatTypeLabel(art.type)}</span>
                    </td>
                    <td className={`${adminTableCell} whitespace-nowrap`}>
                      <select
                        value={art.status}
                        onChange={(e) =>
                          statusMutation.mutate({
                            id: art.id,
                            status: e.target.value as ArticleStatus,
                          })
                        }
                        className={`${adminSelect} h-7 w-auto min-w-[108px]`}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING">Review</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </td>
                    <td className={`${adminTableCell} whitespace-nowrap font-mono tabular-nums text-muted-foreground`}>
                      {art.views.toLocaleString()}
                    </td>
                    <td className={`${adminTableCell} whitespace-nowrap text-muted-foreground`}>
                      {art.author.name}
                    </td>
                    <td className={`${adminTableCell} whitespace-nowrap text-right`}>
                      <div className="inline-flex items-center">
                        <a
                          href={`/article/${art.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={adminBtnGhost}
                          title="View public page"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <Link href={`/admin/articles/${art.id}/edit`} className={adminBtnGhost} title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete article "${art.title}"?`)) {
                              deleteMutation.mutate(art.id);
                            }
                          }}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-sm text-destructive hover:bg-muted"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex flex-col items-center justify-between gap-3 pt-1 text-xs text-muted-foreground sm:flex-row">
          <div>
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)} of{" "}
            {pagination.total}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className={adminBtnSecondary}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>
            <span className="font-medium text-foreground">
              {page} / {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={adminBtnSecondary}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : null}
    </AdminPageShell>
  );
}
