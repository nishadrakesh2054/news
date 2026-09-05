import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { formatTimeAgo } from "@/lib/nepaliDate";
import { MapPin, ChevronRight } from "lucide-react";
import { PROVINCES } from "@/components/portal/ProvinceNewsWidget";
import { resolveLanguageEdition } from "@/lib/language";
import { editionAlternates, pageTitle, requestHost } from "@/lib/seo";

interface ProvincePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: ProvincePageProps): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const provinceObj = PROVINCES.find((p) => p.slug === slug);
  const name = !provinceObj
    ? slug
    : lang === "en"
      ? provinceObj.nameEn
      : provinceObj.name;
  const title = lang === "en" ? `${name} news` : `${name} समाचार`;
  return {
    title: pageTitle(title, lang),
    description:
      lang === "en"
        ? `Latest news from ${name}.`
        : `${name} बाट ताजा समाचार।`,
    alternates: editionAlternates(`/province/${slug}`, lang),
  };
}

export default async function ProvinceArchivePage({ params, searchParams }: ProvincePageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const headerList = await headers();
  const lang = resolveLanguageEdition(sp.lang, requestHost(headerList));
  const isEnglish = lang === "en";

  const provinceObj = PROVINCES.find((p) => p.slug === slug);
  if (!provinceObj) {
    return notFound();
  }

  const articles = await prisma.article.findMany({
    where: {
      status: ArticleStatus.PUBLISHED,
      province: provinceObj.id,
    },
    select: {
      id: true,
      title: true,
      titleNp: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      district: true,
      createdAt: true,
      category: { select: { name: true, nameNp: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const provinceName = isEnglish ? provinceObj.nameEn : provinceObj.name;

  return (
    <main className="w-full bg-background pb-16 pt-6">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Province Header */}
        <div className="border-b-2 border-[#027081] pb-4 flex items-center justify-between">
          <div className="space-y-1">
            <nav className="flex items-center space-x-2 text-xs text-muted-foreground pb-1">
              <Link href={isEnglish ? "/?lang=en" : "/"} className="hover:text-[#027081]">
                {isEnglish ? "Home" : "गृह"}
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span>{isEnglish ? "Province news" : "प्रदेश समाचार"}</span>
            </nav>
            <h1 className="text-3xl font-extrabold text-[#027081] font-serif flex items-center gap-2">
              <MapPin className="h-7 w-7" />
              <span>
                {isEnglish ? `${provinceName} news` : `${provinceName}का समाचार`}
              </span>
            </h1>
          </div>

          <span className="bg-[#027081]/10 text-[#027081] text-xs font-bold px-3 py-1.5 rounded-lg font-mono">
            {articles.length} {isEnglish ? "stories" : "समाचार"}
          </span>
        </div>

        {/* Province Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((art) => (
              <article
                key={art.id}
                className="group rounded-2xl border border-border/50 bg-card overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
              >
                {art.coverImage && (
                  <div className="h-48 w-full overflow-hidden bg-muted relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={art.coverImage}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {art.district && (
                      <span className="absolute top-3 left-3 bg-[#027081] text-white text-[10px] font-bold px-2.5 py-0.5 rounded">
                        {art.district}
                      </span>
                    )}
                  </div>
                )}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-muted-foreground block">
                      {formatTimeAgo(art.createdAt, lang)}
                    </span>

                    <h2 className="text-base font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif">
                      <Link href={`/article/${art.slug}${isEnglish ? "?lang=en" : ""}`}>
                        {isEnglish ? art.title || art.titleNp : art.titleNp || art.title}
                      </Link>
                    </h2>

                    {art.excerpt && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {art.excerpt}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-border/30 text-[11px] font-semibold text-[#027081] flex items-center gap-1">
                    <span>{isEnglish ? "Read more" : "थप पढ्नुहोस्"}</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground rounded-2xl border border-dashed">
            {isEnglish
              ? `No stories from ${provinceName} yet.`
              : `${provinceName}मा हाल कुनै विशेष समाचार प्रकाशित भएको छैन।`}
          </div>
        )}
      </div>
    </main>
  );
}
