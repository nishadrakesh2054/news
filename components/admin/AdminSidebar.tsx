"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Zap,
  Radio,
  FolderTree,
  Image as ImageIcon,
  LayoutGrid,
  Megaphone,
  Users,
  BarChart3,
  Settings,
  ExternalLink,
  MessageSquare,
  Newspaper,
  Coins,
  Vote,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();

  const menuSections = [
    {
      title: "CONTENT",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Articles", href: "/admin/articles", icon: FileText },
        { label: "Comments", href: "/admin/comments", icon: MessageSquare },
        { label: "Breaking News", href: "/admin/breaking", icon: Zap },
        { label: "Live Coverage", href: "/admin/live", icon: Radio },
        { label: "Categories", href: "/admin/categories", icon: FolderTree },
      ],
    },
    {
      title: "PUBLISHING & MEDIA",
      items: [
        { label: "Media Library", href: "/admin/media", icon: ImageIcon },
        { label: "EPaper Publisher", href: "/admin/epaper", icon: Newspaper },
        { label: "Market & Horoscope", href: "/admin/utilities", icon: Coins },
        { label: "Public Polls (जनमत)", href: "/admin/polls", icon: Vote },
        { label: "Homepage Layout", href: "/admin/homepage", icon: LayoutGrid },
        { label: "Advertisements", href: "/admin/ads", icon: Megaphone },
      ],
    },
    {
      title: "ADMINISTRATION",
      items: [
        { label: "Users & Roles", href: "/admin/users", icon: Users },
        { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 bg-[#027081] px-0 py-6 hidden md:flex flex-col justify-between text-white select-none shrink-0">
      <div className="space-y-6 overflow-y-auto">
        {/* Navigation Section */}
        <div className="space-y-5">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              <h2 className="px-5 text-[11px] font-bold tracking-widest text-white/50 uppercase">
                {section.title}
              </h2>
              <nav className="flex flex-col space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`group flex items-center space-x-3 py-2.5 px-5 text-sm transition-all duration-150 ${
                        isActive
                          ? "bg-white/25 text-white font-bold border-l-4 border-white"
                          : "text-white/80 hover:text-white hover:bg-white/10 font-medium"
                      }`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 transition-colors ${
                          isActive ? "text-white" : "text-white/80 group-hover:text-white"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pt-4 border-t border-white/20">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-lg border border-white/30 bg-white/10 px-3.5 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all group"
        >
          <span>View Public Site</span>
          <ExternalLink className="h-3.5 w-3.5 text-white/80 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </aside>
  );
}
