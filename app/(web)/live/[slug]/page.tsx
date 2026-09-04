"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Radio, Clock, User, ChevronRight, RefreshCw } from "lucide-react";
import { formatTimeAgoNp } from "@/lib/nepaliDate";

interface LiveUpdateItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface LiveArticleDetail {
  id: string;
  title: string;
  titleNp?: string | null;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  createdAt: string;
  author: {
    name: string;
  };
  liveUpdates: LiveUpdateItem[];
}

export default function LiveCoveragePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<LiveArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveBlog = useCallback(async () => {
    try {
      const res = await fetch(`/api/articles/${slug}`);
      const json = await res.json();
      if (json.success && json.data) {
        setArticle(json.data);
        setLastUpdated(new Date());
      }
    } catch (e) {
      console.error("Failed to fetch live updates", e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    let ignore = false;

    async function loadLiveBlog() {
      try {
        const res = await fetch(`/api/articles/${slug}`);
        const json = await res.json();
        if (!ignore && json.success && json.data) {
          setArticle(json.data);
          setLastUpdated(new Date());
        }
      } catch (e) {
        console.error("Failed to fetch live updates", e);
      } finally {
        if (!ignore) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    }

    loadLiveBlog();
    const interval = setInterval(loadLiveBlog, 30000);
    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center text-muted-foreground">
        <Radio className="h-8 w-8 animate-pulse text-[#027081] mx-auto mb-2" />
        <p>प्रत्यक्ष समाचार अपडेट लोड हुँदैछ...</p>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12 text-center text-muted-foreground">
        <p>लाइभ समाचार भेटिएन।</p>
        <Link href="/" className="text-[#027081] font-bold underline mt-2 block">
          गृहपृष्ठमा फर्कनुहोस्
        </Link>
      </main>
    );
  }

  const title = article.titleNp || article.title;
  const liveUpdatesCount = article.liveUpdates?.length ?? 0;
  const liveStatus = isRefreshing ? "ताजा पार्दै…" : "प्रत्यक्ष";

  return (
    <main className="w-full bg-background pb-16">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="rounded-2xl border border-rose-200 bg-linear-to-r from-rose-50 via-white to-amber-50 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                ब्रेकिङ अलर्ट
              </span>
              <span className="rounded-full border border-rose-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-rose-700">
                {liveStatus}
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              अन्तिम अपडेट: {formatTimeAgoNp(lastUpdated)}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-foreground">
            {article.excerpt || "प्रत्यक्ष कभरेज घटनाक्रमअनुसार निरन्तर अद्यावधिक हुँदैछ।"}
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground border-b border-border/40 pb-3">
          <Link href="/" className="hover:text-[#027081]">गृह</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#027081] font-bold">प्रत्यक्ष प्रसारण</span>
        </nav>

        {/* Live Blog Banner Header */}
        <header className="space-y-4 border-b border-border pb-6">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center space-x-2 bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
              <Radio className="h-3.5 w-3.5 animate-pulse" />
              <span>प्रत्यक्ष कभरेज</span>
            </div>

            <button
              onClick={() => {
                setIsRefreshing(true);
                fetchLiveBlog();
              }}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 text-xs text-[#027081] hover:underline font-bold cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>ताजा पार्नुहोस्</span>
            </button>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground leading-tight tracking-tight font-serif">
            {title}
          </h1>

          {article.excerpt && (
            <p className="text-base sm:text-lg text-muted-foreground font-serif leading-relaxed">
              {article.excerpt}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">स्थिति</p>
              <p className="mt-1 text-base font-extrabold text-[#027081]">{liveStatus}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">अपडेट</p>
              <p className="mt-1 text-base font-extrabold text-[#027081]">{liveUpdatesCount}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">अन्तिम अपडेट</p>
              <p className="mt-1 text-base font-extrabold text-[#027081]">{formatTimeAgoNp(lastUpdated)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-muted-foreground font-mono pt-2">
            <span className="flex items-center gap-1 text-foreground font-bold">
              <User className="h-3.5 w-3.5 text-[#027081]" />
              <span>{article.author.name || "सम्पादकीय टोली"}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-[#027081]" />
              <span>अन्तिम अपडेट: {lastUpdated.toLocaleTimeString("ne-NP")}</span>
            </span>
          </div>
        </header>

        <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#027081]/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#027081]">
                विशेष कभरेज
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">लाइभ डेस्क</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            यो कभरेज वास्तविक समयमा अद्यावधिक हुँदैछ। प्रमाणित नयाँ विकासक्रम टाइमलाइनको माथि थपिन्छ।
          </p>
        </section>

        {/* Featured Cover Image if available */}
        {article.coverImage && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-sm max-h-112.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.coverImage} alt={title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Real-time Timeline Feed */}
        <section className="space-y-6 pt-4">
          <h3 className="text-xl font-extrabold text-foreground font-serif border-b-2 border-[#027081] pb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#027081]" />
            <span>अद्यावधिक समाचार टाइमलाइन</span>
          </h3>

          {article.liveUpdates && article.liveUpdates.length > 0 ? (
            <div className="relative border-l-2 border-[#027081]/40 ml-4 space-y-8 pl-6">
              {article.liveUpdates.map((update) => (
                <div key={update.id} className="relative group">
                  {/* Timeline dot */}
                  <span className="absolute -left-7.75 top-1.5 h-3.5 w-3.5 rounded-full bg-[#027081] border-2 border-background shadow-xs group-first:bg-rose-600 group-first:animate-ping" />

                  <div className="bg-card border border-border/70 rounded-xl p-5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-border/40 pb-2">
                      <h4 className="text-base sm:text-lg font-bold text-foreground font-serif">
                        {update.title}
                      </h4>
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                        {formatTimeAgoNp(update.createdAt)}
                      </span>
                    </div>

                    <div
                      className="prose dark:prose-invert max-w-none text-sm sm:text-base text-foreground font-sans leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: update.content }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed rounded-xl text-muted-foreground">
              प्रत्यक्ष अपडेटहरू पोस्ट गरिँदैछन्। केही क्षणमा पुनः हेर्नुहोस्।
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
