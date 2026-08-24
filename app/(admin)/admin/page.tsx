import Link from "next/link";
import {
  FileText,
  Pencil,
  Clock,
  Radio,
  Plus,
  Zap,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const publishedArticles = [
    {
      title: "प्रधानमन्त्रीद्वारा संसदमा विश्वासको मत लिने तयारी",
      author: "Anita Karki",
      section: "राजनीति",
      time: "10:42 AM",
    },
    {
      title: "आज देशभर सामान्य बदली, पहाडी भू-भागमा वर्षा हुने",
      author: "Ramesh Poudel",
      section: "समाचार",
      time: "09:15 AM",
    },
    {
      title: "नेपाली महिला टोली सेमिफाइनलमा प्रवेश",
      author: "Sujan Rai",
      section: "खेलकुद",
      time: "08:05 AM",
    },
    {
      title: "बजेट कार्यान्वयन दर ६१ प्रतिशत पुगेको महालेखा परीक्षकको प्रतिवेदन",
      author: "Mina Thapa",
      section: "अर्थतन्त्र",
      time: "07:30 AM",
    },
    {
      title: "काठमाडौँमा प्रदूषणको स्तर उच्च, स्वास्थ्यमा असर",
      author: "Laxman Bhandari",
      section: "समाचार",
      time: "06:45 AM",
    },
  ];

  const queueArticles = [
    {
      title: "सरकारद्वारा पेट्रोलियम पदार्थको मूल्य घटाइयो",
      type: "Breaking",
      typeColor: "text-rose-600 bg-rose-50 border-rose-200",
      dotColor: "bg-rose-500",
      author: "Mina Thapa",
      time: "11:02 AM",
    },
    {
      title: "शिक्षा विधेयक-समितिको प्रतिवेदन आज पेश हुँदै",
      type: "News",
      typeColor: "text-amber-600 bg-amber-50 border-amber-200",
      dotColor: "bg-amber-500",
      author: "Ramesh Poudel",
      time: "10:18 AM",
    },
    {
      title: "नेपाल-भारत सीमा विवादबारे छलफल जारी",
      type: "News",
      typeColor: "text-amber-600 bg-amber-50 border-amber-200",
      dotColor: "bg-amber-500",
      author: "Anita Karki",
      time: "09:47 AM",
    },
    {
      title: "मनसुनको प्रभाव: तराईका जिल्लामा सतर्कता",
      type: "Live",
      typeColor: "text-emerald-600 bg-emerald-50 border-emerald-200",
      dotColor: "bg-emerald-500",
      author: "Sujan Rai",
      time: "09:10 AM",
    },
    {
      title: "प्रि-म्याच प्रेस कन्फरेन्स: नेपाल बनाम बङ्गलादेश",
      type: "News",
      typeColor: "text-amber-600 bg-amber-50 border-amber-200",
      dotColor: "bg-amber-500",
      author: "Laxman Bhandari",
      time: "08:45 AM",
    },
  ];

  const contentDistribution = [
    { label: "News", count: 42, color: "bg-blue-600" },
    { label: "Breaking News", count: 9, color: "bg-rose-500" },
    { label: "Live Coverage", count: 6, color: "bg-emerald-500" },
    { label: "Opinion", count: 11, color: "bg-purple-600" },
    { label: "Features", count: 5, color: "bg-amber-500" },
  ];

  const activities = [
    {
      initials: "AK",
      bg: "bg-blue-600",
      name: "Anita Karki",
      action: 'published "प्रधानमन्त्रीद्वारा संसदमा विश्वासको मत लिने तयारी"',
      time: "10:42 AM",
    },
    {
      initials: "RP",
      bg: "bg-emerald-600",
      name: "Ramesh Poudel",
      action: 'updated "शिक्षा विधेयक-समितिको प्रतिवेदन आज पेश हुँदै"',
      time: "10:18 AM",
    },
    {
      initials: "MT",
      bg: "bg-amber-600",
      name: "Mina Thapa",
      action: 'moved "सरकारद्वारा पेट्रोलियम पदार्थको मूल्य घटाइयो" to review',
      time: "10:05 AM",
    },
    {
      initials: "SR",
      bg: "bg-purple-600",
      name: "Sujan Rai",
      action: 'started live coverage "बाढी प्रभावित क्षेत्रको स्थलगत रिपोर्ट"',
      time: "09:32 AM",
    },
  ];

  return (
    <div className="space-y-3 w-full px-6 py-2 pb-6">
      {/* Top Header Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-foreground font-serif">
            Newsroom Dashboard
          </h1>
        </div>
        <Link href="/admin/articles/new">
          <Button className="h-8 rounded-lg bg-brand hover:bg-[#0B3F8A] text-white shadow-xs text-[11px] font-bold px-3 py-1 flex items-center gap-1.5 transition-all duration-200">
            <Plus className="h-3.5 w-3.5" />
            <span>Create News</span>
          </Button>
        </Link>
      </div>

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Published Today */}
        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              18
            </div>
            <div className="text-xs font-medium text-muted-foreground">Published Today</div>
            <div className="text-[11px] font-semibold text-emerald-600 mt-0.5 flex items-center">
              <span>↑ 12 vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Drafts */}
        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-500/10 text-slate-600 border border-slate-500/20 shrink-0">
            <Pencil className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              7
            </div>
            <div className="text-xs font-medium text-muted-foreground">Drafts</div>
            <div className="text-[11px] font-medium text-muted-foreground mt-0.5">
              <span>— 0 vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Needs Review */}
        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              12
            </div>
            <div className="text-xs font-medium text-muted-foreground">Needs Review</div>
            <div className="text-[11px] font-semibold text-amber-600 mt-0.5">
              <span>↑ 3 vs yesterday</span>
            </div>
          </div>
        </div>

        {/* Active Breaking/Live */}
        <div className="rounded-xl border bg-card p-5 shadow-sm flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20 shrink-0">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <div className="text-2xl font-black tracking-tight text-foreground">
              3
            </div>
            <div className="text-xs font-medium text-muted-foreground">Active Breaking/Live</div>
            <div className="text-[11px] font-semibold text-rose-600 mt-0.5">
              <span>2 Breaking • 1 Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="space-y-2">
        <h2 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link href="/admin/articles/new">
            <button className="w-full flex items-center justify-center space-x-2 rounded-xl border border-brand/20 bg-card py-2.5 px-4 text-xs font-semibold text-brand hover:bg-brand/10 transition-colors shadow-sm">
              <FileText className="h-4 w-4" />
              <span>New Article</span>
            </button>
          </Link>
          <Link href="/admin/articles?filter=breaking">
            <button className="w-full flex items-center justify-center space-x-2 rounded-xl border border-rose-500/20 bg-card py-2.5 px-4 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 transition-colors shadow-sm">
              <Zap className="h-4 w-4" />
              <span>Breaking News</span>
            </button>
          </Link>
          <Link href="/admin/articles?filter=live">
            <button className="w-full flex items-center justify-center space-x-2 rounded-xl border border-emerald-500/20 bg-card py-2.5 px-4 text-xs font-semibold text-emerald-600 hover:bg-emerald-500/10 transition-colors shadow-sm">
              <Radio className="h-4 w-4" />
              <span>Live Coverage</span>
            </button>
          </Link>
          <Link href="/admin/homepage">
            <button className="w-full flex items-center justify-center space-x-2 rounded-xl border bg-card py-2.5 px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors shadow-sm">
              <Home className="h-4 w-4" />
              <span>Homepage Manager</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Middle Section: Recently Published & Editorial Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Published */}
        <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Recently Published
              </h3>
              <Link href="/admin/articles" className="text-xs font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b">
                  <tr>
                    <th className="py-2.5 pr-2">Title</th>
                    <th className="py-2.5 px-2">Author</th>
                    <th className="py-2.5 px-2">Section</th>
                    <th className="py-2.5 pl-2 text-right">Published At</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-foreground">
                  {publishedArticles.map((art, i) => (
                    <tr key={i} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-2 flex items-start space-x-2 max-w-60">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                        <span className="truncate">{art.title}</span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">{art.author}</td>
                      <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">{art.section}</td>
                      <td className="py-3 pl-2 text-right text-muted-foreground whitespace-nowrap">{art.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t pt-3">
            <span>Showing 1–5 of 18</span>
            <Link href="/admin/articles" className="text-blue-600 font-medium hover:underline">
              View all
            </Link>
          </div>
        </div>

        {/* Editorial Queue */}
        <div className="rounded-xl border bg-card shadow-sm p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Editorial Queue
              </h3>
              <Link href="/admin/articles?tab=queue" className="text-xs font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b">
                  <tr>
                    <th className="py-2.5 pr-2">Title</th>
                    <th className="py-2.5 px-2">Type</th>
                    <th className="py-2.5 px-2">Added By</th>
                    <th className="py-2.5 pl-2 text-right">Added At</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-foreground">
                  {queueArticles.map((art, i) => (
                    <tr key={i} className="hover:bg-muted/40 transition-colors">
                      <td className="py-3 pr-2 flex items-start space-x-2 max-w-60">
                        <span className={`h-2 w-2 rounded-full ${art.dotColor} shrink-0 mt-1.5`} />
                        <span className="truncate">{art.title}</span>
                      </td>
                      <td className="py-3 px-2 whitespace-nowrap">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {art.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground whitespace-nowrap">{art.author}</td>
                      <td className="py-3 pl-2 text-right text-muted-foreground whitespace-nowrap">{art.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t pt-3">
            <span>Showing 1–5 of 12</span>
            <Link href="/admin/articles?tab=queue" className="text-blue-600 font-medium hover:underline">
              View all
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid Section: 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content This Week */}
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-foreground border-b pb-3">
            Content This Week
          </h3>
          <div className="space-y-3 pt-1">
            {contentDistribution.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-bold text-foreground">{item.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${(item.count / 42) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsroom Activity */}
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-foreground">
                Newsroom Activity
              </h3>
              <Link href="/admin/activity" className="text-xs font-medium text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-3 pt-3">
              {activities.map((act, i) => (
                <div key={i} className="flex items-start space-x-3 text-xs">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-full ${act.bg} font-semibold text-white text-[10px] shrink-0`}>
                    {act.initials}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-muted-foreground leading-snug">
                      <span className="font-semibold text-foreground">{act.name}</span>{" "}
                      {act.action}
                    </p>
                    <span className="text-[10px] text-muted-foreground">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Breaking & Live Status Monitors */}
        <div className="rounded-xl border bg-card p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Breaking News Status Box */}
            <div className="space-y-2 border-b pb-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">
                  Breaking News Status
                </h4>
                <Link href="/admin/articles?filter=breaking" className="text-xs font-medium text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-rose-600">2</span>
                  <span className="text-xs font-semibold text-foreground">
                    Active Breaking
                  </span>
                </div>
                <Link href="/admin/articles?filter=breaking">
                  <span className="rounded-md border border-rose-500/20 text-rose-600 bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold hover:bg-rose-500/20 transition-colors">
                    View all
                  </span>
                </Link>
              </div>
              <p className="text-[11px] text-muted-foreground truncate pt-1">
                Latest: <span className="text-foreground">सरकारद्वारा पेट्रोलियम पदार्थको मूल्य घटाइयो</span> • <span>11:02 AM</span>
              </p>
            </div>

            {/* Live Coverage Status Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-foreground">
                  Live Coverage Status
                </h4>
                <Link href="/admin/articles?filter=live" className="text-xs font-medium text-blue-600 hover:underline">
                  View all
                </Link>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-emerald-600">1</span>
                  <span className="text-xs font-semibold text-foreground">
                    Live Now
                  </span>
                </div>
                <Link href="/admin/articles?filter=live">
                  <span className="rounded-md border border-emerald-500/20 text-emerald-600 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold hover:bg-emerald-500/20 transition-colors">
                    View all
                  </span>
                </Link>
              </div>
              <p className="text-[11px] text-muted-foreground truncate pt-1">
                Latest: <span className="text-foreground">बाढी प्रभावित क्षेत्रको स्थलगत रिपोर्ट</span> • <span>09:32 AM</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
