"use client";

import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { adminInput } from "@/constants/admin-layout";

export type ArticleSearchResult = {
  id: string;
  title: string;
  titleNp: string | null;
  slug: string;
  status: string;
  category: { name: string; nameNp?: string | null };
};

type ArticleSearchPickerProps = {
  onSelect: (article: ArticleSearchResult) => void;
  excludeIds?: string[];
  placeholder?: string;
};

export function ArticleSearchPicker({
  onSelect,
  excludeIds = [],
  placeholder = "Search published articles…",
}: ArticleSearchPickerProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ArticleSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search: query.trim(),
          status: "PUBLISHED",
          limit: "8",
        });
        const res = await fetch(`/api/admin/articles?${params.toString()}`);
        const json = await res.json();
        if (res.ok && json.data?.articles) {
          setResults(
            (json.data.articles as ArticleSearchResult[]).filter(
              (article) => !excludeIds.includes(article.id)
            )
          );
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, excludeIds]);

  return (
    <div className="relative w-full max-w-xl">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`${adminInput} w-full pl-7 pr-7`}
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>

      {query.trim() ? (
        <div className="absolute z-20 mt-1 w-full rounded-sm border border-border/70 bg-card shadow-md">
          {loading ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-3 py-2 text-xs text-muted-foreground">No published articles found.</p>
          ) : (
            <ul className="max-h-56 overflow-y-auto py-1">
              {results.map((article) => (
                <li key={article.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(article);
                      setQuery("");
                      setResults([]);
                    }}
                    className="flex w-full flex-col gap-0.5 px-3 py-2 text-left hover:bg-muted/40"
                  >
                    <span className="truncate text-xs font-medium text-foreground">
                      {article.titleNp || article.title}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground">
                      {article.category.nameNp || article.category.name} · /{article.slug}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
