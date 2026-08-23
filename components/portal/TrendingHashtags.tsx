"use client";

import Link from "next/link";
import { Hash, TrendingUp } from "lucide-react";

const DEFAULT_HASHTAGS = [
  { name: "#प्रतिनिधिसभा", slug: "pratinidhisabha" },
  { name: "#बजेट२०८२", slug: "budget-2082" },
  { name: "#टी२०_विश्वकप", slug: "t20-worldcup" },
  { name: "#मनसुन_अपडेट", slug: "monsoon-update" },
  { name: "#शेयर_बजार", slug: "share-bazar" },
  { name: "#पर्यटन", slug: "tourism" },
  { name: "#स्थानीय_विकास", slug: "local-development" },
];

export function TrendingHashtags() {
  return (
    <div className="w-full bg-card border-y border-border py-2.5 px-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center space-x-3 overflow-x-auto scrollbar-none text-xs">
        <div className="flex items-center space-x-1.5 font-extrabold text-[#027081] shrink-0 bg-[#027081]/10 px-2.5 py-1 rounded-md">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>ट्रेन्डिङ विषय:</span>
        </div>

        <div className="flex items-center space-x-2 whitespace-nowrap">
          {DEFAULT_HASHTAGS.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="inline-flex items-center space-x-1 px-3 py-1 rounded-full border border-border/60 bg-background text-foreground hover:bg-[#027081] hover:text-white font-semibold transition-colors shadow-2xs"
            >
              <Hash className="h-3 w-3 text-[#027081] group-hover:text-white" />
              <span>{tag.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
