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
  MessageSquare,
  Newspaper,
  Coins,
  Vote,
} from "lucide-react";

export function AdminSidebar({ collapsed = false }: { collapsed?: boolean }) {
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
    <aside
      className={`sticky top-12 h-[calc(100vh-3rem)] ${collapsed ? "w-16" : "w-[238px]"} overflow-hidden bg-[#0C4EA0] px-0 py-2.5 hidden md:flex flex-col justify-between text-white select-none shrink-0 border-r border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.12)] transition-all duration-200 ease-out whitespace-nowrap`}
    >
      <div className="space-y-2.5 overflow-y-auto px-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/25 hover:scrollbar-thumb-white/40">
        <div className="flex justify-end pb-1" />

        <div className="space-y-3.5">
          {menuSections.map((section, idx) => (
            <div key={idx} className="space-y-1.5">
              {!collapsed && (
                <h2 className="px-2 text-[9px] font-bold tracking-[0.18em] text-white/55 uppercase">
                  {section.title}
                </h2>
              )}

              <nav className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={`group flex min-h-8 items-center ${collapsed ? "justify-center px-2" : "gap-2.5 px-2.5"} py-1.5 text-[13px] transition-all duration-150 ${isActive
                        ? "bg-[#C3272E]/90 text-white font-bold"
                        : "text-white/80 hover:text-white hover:bg-white/10 font-medium"
                        }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-white" : "text-white/80 group-hover:text-white"
                          }`}
                      />
                      {!collapsed && <span className="truncate text-left leading-[1.2]">{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
