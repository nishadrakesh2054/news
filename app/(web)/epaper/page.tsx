import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getFormattedNepaliDate } from "@/lib/nepaliDate";
import { Newspaper, Calendar, Download, ExternalLink, ArrowLeft } from "lucide-react";
import { SITE_CONFIG } from "@/constants/site";

import { EPaper } from "@prisma/client";

/** Skip DB at build time when Neon is unreachable. */
export const dynamic = "force-dynamic";

export default async function PublicEPaperPage() {
  let epapers: EPaper[] = [];
  try {
    epapers = await prisma.ePaper.findMany({
      orderBy: { publishDate: "desc" },
      take: 20,
    });
  } catch {
    // Empty list when DB is unavailable (e.g. offline build).
  }

  const latestEPaper = epapers[0];

  return (
    <main className="w-full bg-background min-h-screen pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center text-xs font-semibold text-[#027081] hover:underline gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>गृहपृष्ठमा फर्कनुहोस्</span>
        </Link>

        {/* EPaper Header */}
        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground font-serif flex items-center gap-2.5">
              <Newspaper className="h-7 w-7 text-[#027081]" />
              <span>इ-पत्रिका छापा संस्करण (Daily EPaper Edition)</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              {SITE_CONFIG.nameNp} को दैनिक प्रकाशित छापा पत्रिकाको डिजिटल PDF संस्करण।
            </p>
          </div>

          {latestEPaper && (
            <a
              href={latestEPaper.pdfUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#027081] hover:bg-[#025a68] text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>PDF डाउनलोड गर्नुहोस्</span>
            </a>
          )}
        </div>

        {/* PDF Reader Viewer Frame */}
        {latestEPaper ? (
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-md">
              <div className="p-4 bg-[#027081] text-white flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{latestEPaper.title} — {getFormattedNepaliDate(latestEPaper.publishDate)}</span>
                </span>
                <a
                  href={latestEPaper.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline flex items-center gap-1"
                >
                  <span>पूरै स्क्रिनमा हेर्नुहोस्</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Embedded PDF Viewer Frame */}
              <iframe
                src={`${latestEPaper.pdfUrl}#toolbar=0`}
                className="w-full h-[700px] sm:h-[850px] border-none bg-slate-900"
                title={latestEPaper.title}
              />
            </div>

            {/* Past Archive List */}
            {epapers.length > 1 && (
              <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
                <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
                  अघिल्ला दिनका इ-पत्रिकाहरू (Past Archives)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {epapers.slice(1).map((ep) => (
                    <a
                      key={ep.id}
                      href={ep.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-3.5 rounded-xl border border-border/60 bg-muted/20 hover:border-[#027081] transition-colors space-y-1 block"
                    >
                      <h4 className="text-xs font-bold text-foreground leading-snug">{ep.title}</h4>
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        मिति: {new Date(ep.publishDate).toLocaleDateString()}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-16 text-center border border-dashed border-border rounded-2xl space-y-3 bg-card">
            <Newspaper className="h-12 w-12 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-foreground">कुनै इ-पत्रिका उपलब्ध छैन</h3>
            <p className="text-xs text-muted-foreground">
              हालसम्म छापा संस्करणको PDF अपलोड भएको छैन।
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
