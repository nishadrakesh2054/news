import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { formatTimeAgoNp } from "@/lib/nepaliDate";
import { FolderTree, ChevronRight } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return { title: "श्रेणी भेटिएन | नेपाल खबर" };
  }

  const name = category.nameNp || category.name;
  return {
    title: `${name} समाचार`,
    description: `${name} श्रेणीका सबै समाचार, अपडेट र विशेष रिपोर्टहरू | नेपाल खबर`,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
    openGraph: {
      title: `${name} समाचार | नेपाल खबर`,
      description: `${name} श्रेणीका सबै समाचार, अपडेट र विशेष रिपोर्टहरू | नेपाल खबर`,
      url: `https://nepalkhabar.com/category/${category.slug}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} समाचार | नेपाल खबर`,
      description: `${name} श्रेणीका सबै समाचार, अपडेट र विशेष रिपोर्टहरू | नेपाल खबर`,
    },
  };
}

export const revalidate = 60; // ISR cache revalidation every 60s

export default async function CategoryArchivePage({ params }: CategoryPageProps) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      nameNp: true,
      slug: true,
      articles: {
        where: { status: ArticleStatus.PUBLISHED },
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          createdAt: true,
          views: true,
          isFeatured: true,
          author: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });

  if (!category) {
    notFound();
  }

  const categoryName = category.nameNp || category.name;
  const latestArticles = [...category.articles].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const popularArticles = [...category.articles].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 4);
  const featuredArticles = category.articles.filter((article) => article.isFeatured).slice(0, 3);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "गृहपृष्ठ", item: "https://nepalkhabar.com/" },
      { "@type": "ListItem", position: 2, name: categoryName, item: `https://nepalkhabar.com/category/${category.slug}` },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} समाचार`,
    description: `${categoryName} श्रेणीका सबै समाचार, अपडेट र विशेष रिपोर्टहरू | नेपाल खबर`,
    url: `https://nepalkhabar.com/category/${category.slug}`,
    isPartOf: { "@type": "WebSite", name: "नेपाल खबर", url: "https://nepalkhabar.com" },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />

      <main className="w-full bg-background pb-16">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          {/* Category Header */}
          <div className="border-b-2 border-[#027081] pb-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <nav className="flex items-center space-x-2 text-xs text-muted-foreground pb-1">
                <Link href="/" className="hover:text-[#027081]">गृह</Link>
                <ChevronRight className="h-3 w-3" />
                <span>श्रेणी</span>
              </nav>
              <h1 className="text-3xl font-extrabold text-[#027081] font-serif flex items-center gap-2">
                <FolderTree className="h-7 w-7" />
                <span>{categoryName}</span>
              </h1>
            </div>

            <span className="bg-[#027081]/10 text-[#027081] text-xs font-bold px-3 py-1.5 rounded-lg font-mono">
              {category.articles.length} समाचार
            </span>
          </div>

          {/* Phase 2: Category discovery and navigation */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <Link href="#all" className="rounded-full bg-[#027081] text-white px-3 py-1.5">सबै</Link>
              <Link href="#latest" className="rounded-full border border-border bg-background px-3 py-1.5 hover:border-[#027081]">ताजा</Link>
              <Link href="#popular" className="rounded-full border border-border bg-background px-3 py-1.5 hover:border-[#027081]">पढिएको</Link>
              <span className="text-muted-foreground px-1">•</span>
              <span className="text-muted-foreground">{categoryName} को समाचार छिटो हेर्नुहोस्</span>
            </div>
          </div>

          {featuredArticles.length > 0 && (
            <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <h2 className="text-lg font-extrabold text-foreground font-serif">मुख्य छनोट</h2>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredArticles.map((art) => (
                  <Link
                    key={art.id}
                    href={`/article/${art.slug}`}
                    className="group block rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors overflow-hidden"
                  >
                    {art.coverImage && (
                      <div className="h-40 overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#027081]">
                        Featured
                      </span>
                      <h3 className="mt-2 text-sm font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif line-clamp-2">
                        {art.titleNp || art.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div id="latest" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <h2 className="text-lg font-extrabold text-foreground font-serif">ताजा समाचार</h2>
              </div>

              <div className="mt-4 space-y-4">
                {latestArticles.slice(0, 4).map((art) => (
                  <Link
                    key={art.id}
                    href={`/article/${art.slug}`}
                    className="group flex flex-col sm:flex-row gap-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors p-3"
                  >
                    {art.coverImage && (
                      <div className="h-24 w-full sm:w-32 rounded-lg overflow-hidden bg-muted shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="min-w-0 space-y-1.5">
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        {formatTimeAgoNp(art.createdAt)}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif line-clamp-2">
                        {art.titleNp || art.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <aside id="popular" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-border/60">
                <h2 className="text-lg font-extrabold text-foreground font-serif">पढिएको</h2>
              </div>

              <div className="mt-4 space-y-3">
                {popularArticles.map((art, index) => (
                  <Link
                    key={art.id}
                    href={`/article/${art.slug}`}
                    className="group flex items-start gap-3 border-b border-border/30 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-lg font-black text-[#027081]/40 group-hover:text-[#027081] transition-colors font-mono shrink-0 w-6">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif line-clamp-2">
                        {art.titleNp || art.title}
                      </h3>
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        {art.views || 0} पटक पढिएको
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </aside>
          </div>

          {/* Category Articles Grid */}
          <div id="all">
            {category.articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.articles.map((art) => (
                  <article
                    key={art.id}
                    className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {art.coverImage && (
                      <div className="h-48 w-full overflow-hidden bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono text-muted-foreground block">
                          {formatTimeAgoNp(art.createdAt)}
                        </span>

                        <h2 className="text-base font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif">
                          <Link href={`/article/${art.slug}`}>
                            {art.titleNp || art.title}
                          </Link>
                        </h2>

                        {art.excerpt && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {art.excerpt}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-border/30 text-[11px] font-semibold text-[#027081] flex items-center gap-1">
                        <span>थप पढ्नुहोस्</span>
                        <ChevronRight className="h-3 w-3" />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground rounded-2xl border border-dashed">
                यस श्रेणीमा हाल कुनै प्रकाशित समाचार उपलब्ध छैन।
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
