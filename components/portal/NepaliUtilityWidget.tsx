"use client";

import Link from "next/link";
import {
  Sparkles,
  Type,
  Coins,
  DollarSign,
  ChevronRight,
} from "lucide-react";

export function NepaliUtilityWidget() {
  const directoryItems = [
    {
      title: "युनिकोडमा टाइप गर्नुहोस्",
      desc: "रोमन अक्षरबाट नेपाली युनिकोडमा सहजै रूपान्तरण गर्नुहोस्",
      href: "/unicode",
      icon: Type,
      color: "bg-sky-500 text-white",
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    },
    {
      title: "विदेशी विनिमय दर",
      desc: "नेपाल राष्ट्र बैंकको आधिकारिक विनिमय दरहरू",
      href: "/forex",
      icon: DollarSign,
      color: "bg-emerald-500 text-white",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: "सुन चाँदीको भाउ",
      desc: "आजको छापावाल, तेजाबी सुन तथा चाँदीको दररेट",
      href: "/gold-rate",
      icon: Coins,
      color: "bg-slate-700 text-white",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      title: "आजको राशिफल",
      desc: "१२ राशिको दैनिक, साप्ताहिक र वार्षिक भाग्यफल",
      href: "/rashifal",
      icon: Sparkles,
      color: "bg-amber-500 text-white",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  ];

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-2xs select-none">
      {/* Widget Title Matching Nepali News Standard (सूचनापाटी) */}
      <div className="flex items-center justify-between border-b-2 border-[#027081] pb-2.5">
        <h3 className="text-lg font-extrabold text-foreground font-serif tracking-tight flex items-center gap-2">
          <span className="h-4 w-1.5 rounded-full bg-[#027081]" />
          <span>सूचनापाटी</span>
        </h3>
      </div>

      {/* Item List matching screenshot style */}
      <div className="space-y-2.5">
        {directoryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.title}
              href={item.href}
              className="group flex items-center justify-between p-3 rounded-xl border border-border/50 bg-background hover:bg-muted/50 hover:border-[#027081]/50 transition-all shadow-2xs"
            >
              <div className="flex items-center space-x-3.5 min-w-0">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 border ${item.iconBg} group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground group-hover:text-[#027081] transition-colors leading-tight font-serif truncate">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground truncate pt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#027081] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
