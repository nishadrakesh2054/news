import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArticleStatus } from "@prisma/client";
import { ArrowLeft, Mail, Newspaper, UserRound } from "lucide-react";

interface AuthorProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: AuthorProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const author = await prisma.user.findUnique({
    where: { id },
    select: { name: true, image: true },
  });

  if (!author) {
    return { title: "लेखक भेटिएन | नेपाल खबर" };
  }

  const name = author.name || "लेखक";
  return {
    title: `${name} | लेखक प्रोफाइल`,
    description: `${name} द्वारा लेखिएका समाचार, रिपोर्ट, विश्लेषण र विशेष सामग्री | नेपाल खबर`,
    alternates: {
      canonical: `/author/${id}`,
    },
    openGraph: {
      title: `${name} | लेखक प्रोफाइल`,
      description: `${name} द्वारा लेखिएका समाचार, रिपोर्ट, विश्लेषण र विशेष सामग्री | नेपाल खबर`,
      url: `https://nepalkhabar.com/author/${id}`,
      type: "profile",
      images: author.image ? [{ url: author.image, width: 640, height: 640, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | लेखक प्रोफाइल`,
      description: `${name} द्वारा लेखिएका समाचार, रिपोर्ट, विश्लेषण र विशेष सामग्री | नेपाल खबर`,
      images: author.image ? [author.image] : undefined,
    },
  };
}

export const revalidate = 60;

export default async function AuthorProfilePage({ params }: AuthorProfilePageProps) {
  const { id } = await params;

  const author = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      articles: {
        where: { status: ArticleStatus.PUBLISHED },
        select: {
          id: true,
          title: true,
          titleNp: true,
          slug: true,
          coverImage: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      },
    },
  });

  if (!author) {
    notFound();
  }

  const authorJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: author.name,
    image: author.image || undefined,
    sameAs: author.email ? `mailto:${author.email}` : undefined,
    url: `https://nepalkhabar.com/author/${author.id}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd) }}
      />

      <main className="w-full bg-background pb-16">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#027081] hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            गृहपृष्ठमा फर्कनुहोस्
          </Link>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#027081]/10 text-[#027081] text-2xl font-extrabold ring-4 ring-[#027081]/10">
                {author.image ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={author.image} alt={author.name} className="h-full w-full object-cover" />
                ) : (
                  author.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#027081]">
                  <UserRound className="h-5 w-5" />
                  <span className="text-xs font-bold uppercase tracking-[0.12em]">लेखक प्रोफाइल</span>
                </div>
                <h1 className="text-3xl font-extrabold text-foreground font-serif">{author.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    {author.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Newspaper className="h-3.5 w-3.5" />
                    {author.articles.length} प्रकाशित लेख
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <h2 className="text-xl font-extrabold text-foreground font-serif">लेखकका समाचार</h2>
            </div>

            {author.articles.length > 0 ? (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                {author.articles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="group flex gap-3 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors p-3"
                  >
                    {article.coverImage && (
                      <div className="h-20 w-20 overflow-hidden rounded-lg bg-muted shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={article.coverImage}
                          alt={article.titleNp || article.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="min-w-0 space-y-1">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-[#027081] transition-colors leading-snug font-serif line-clamp-2">
                        {article.titleNp || article.title}
                      </h3>
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        {new Date(article.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
                यो लेखकद्वारा हाल प्रकाशित कुनै समाचार छैन।
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
