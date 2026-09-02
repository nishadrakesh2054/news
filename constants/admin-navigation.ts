import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tag,
  Image as ImageIcon,
  Images,
  Video,
  Newspaper,
  Zap,
  Radio,
  Star,
  LayoutGrid,
  Megaphone,
  MessageSquare,
  Bell,
  Vote,
  Coins,
  BarChart3,
  LineChart,
  Activity,
  Menu,
  Search,
  ArrowRightLeft,
  Settings,
  Users,
  Shield,
  ScrollText,
  Plug,
  Wrench,
  UserCircle,
} from "lucide-react";

export type AdminNavStatus = "live" | "partial" | "planned";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  status: AdminNavStatus;
  api?: string;
  description?: string;
  /** When true, only highlight on exact path match (for parent routes with children). */
  exactMatch?: boolean;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Overview",
        href: "/admin",
        icon: LayoutDashboard,
        status: "live",
        api: "/api/admin/analytics",
        description: "Newsroom metrics and editorial queue",
        exactMatch: true,
      },
    ],
  },
  {
    title: "Content",
    items: [
      {
        label: "Articles",
        href: "/admin/articles",
        icon: FileText,
        status: "live",
        api: "/api/admin/articles",
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
        status: "live",
        api: "/api/admin/categories",
      },
      {
        label: "Tags",
        href: "/admin/tags",
        icon: Tag,
        status: "live",
        api: "/api/admin/tags",
        description: "Tag model exists; admin API pending",
      },
    ],
  },
  {
    title: "Media",
    items: [
      {
        label: "Media Library",
        href: "/admin/media",
        icon: ImageIcon,
        status: "live",
        api: "/api/admin/media",
      },
      {
        label: "Galleries",
        href: "/admin/galleries",
        icon: Images,
        status: "live",
        api: "/api/admin/galleries",
      },
      {
        label: "Videos",
        href: "/admin/videos",
        icon: Video,
        status: "live",
        api: "/api/admin/videos",
      },
      {
        label: "E-Paper",
        href: "/admin/epaper",
        icon: Newspaper,
        status: "live",
        api: "/api/admin/epaper",
      },
    ],
  },
  {
    title: "Newsroom",
    items: [
      {
        label: "Breaking News",
        href: "/admin/breaking",
        icon: Zap,
        status: "live",
        api: "/api/admin/breaking",
      },
      {
        label: "Live News",
        href: "/admin/live",
        icon: Radio,
        status: "live",
        api: "/api/admin/live",
      },
      {
        label: "Featured News",
        href: "/admin/featured",
        icon: Star,
        status: "live",
        api: "/api/admin/featured",
        description: "Uses Article.isFeatured; dedicated manager pending",
      },
      {
        label: "Homepage Manager",
        href: "/admin/homepage",
        icon: LayoutGrid,
        status: "live",
        api: "/api/admin/homepage",
        description: "Layout API pending; categories load today",
      },
    ],
  },
  {
    title: "Monetization",
    items: [
      {
        label: "Advertisements",
        href: "/admin/ads",
        icon: Megaphone,
        status: "live",
        api: "/api/admin/ads",
      },
    ],
  },
  {
    title: "Engagement",
    items: [
      {
        label: "Comments",
        href: "/admin/comments",
        icon: MessageSquare,
        status: "live",
        api: "/api/admin/comments",
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
        status: "live",
        api: "/api/admin/notifications",
      },
      {
        label: "Polls (जनमत)",
        href: "/admin/polls",
        icon: Vote,
        status: "live",
        api: "/api/admin/polls",
      },
      {
        label: "Market & Horoscope",
        href: "/admin/utilities",
        icon: Coins,
        status: "live",
        api: "/api/admin/utilities",
        description: "Forex, gold rates, and daily rashifal",
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        label: "Overview",
        href: "/admin/analytics",
        icon: BarChart3,
        status: "live",
        api: "/api/admin/analytics",
        exactMatch: true,
      },
      {
        label: "Articles",
        href: "/admin/analytics/articles",
        icon: FileText,
        status: "live",
        api: "/api/admin/analytics/articles",
      },
      {
        label: "Traffic",
        href: "/admin/analytics/traffic",
        icon: LineChart,
        status: "live",
        api: "/api/admin/analytics/traffic",
      },
    ],
  },
  {
    title: "Website",
    items: [
      {
        label: "Menus",
        href: "/admin/website/menus",
        icon: Menu,
        status: "live",
        api: "/api/admin/website/menus",
      },
      {
        label: "SEO",
        href: "/admin/website/seo",
        icon: Search,
        status: "live",
        api: "/api/admin/website/seo",
      },
      {
        label: "Redirects",
        href: "/admin/website/redirects",
        icon: ArrowRightLeft,
        status: "live",
        api: "/api/admin/website/redirects",
      },
      {
        label: "Site Settings",
        href: "/admin/settings",
        icon: Settings,
        status: "live",
        api: "/api/admin/settings",
        description: "UI built; persistence API pending",
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
        status: "live",
        api: "/api/admin/users",
      },
      {
        label: "Roles & Permissions",
        href: "/admin/system/roles",
        icon: Shield,
        status: "live",
        api: "/api/admin/system/roles",
        description: "Role changes live on users page; matrix UI pending",
      },
      {
        label: "Audit Logs",
        href: "/admin/system/audit-logs",
        icon: ScrollText,
        status: "live",
        api: "/api/admin/system/audit-logs",
      },
      {
        label: "API Management",
        href: "/admin/system/api",
        icon: Plug,
        status: "live",
        api: "/api/admin/system/api-keys",
      },
      {
        label: "System / Maintenance",
        href: "/admin/system/maintenance",
        icon: Wrench,
        status: "live",
        api: "/api/admin/system/maintenance",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "My Profile",
        href: "/admin/account/profile",
        icon: UserCircle,
        status: "live",
        api: "/api/admin/account/profile",
      },
    ],
  },
];

export function isAdminNavItemActive(pathname: string, href: string, exactMatch = false): boolean {
  if (exactMatch || href === "/admin") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
