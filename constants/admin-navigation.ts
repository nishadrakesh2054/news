import type { LucideIcon } from "lucide-react";
import { Role } from "@prisma/client";
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  FolderTree,
  Tag,
  Image as ImageIcon,
  Images,
  Video,
  Newspaper,
  Zap,
  Radio,
  Star,
  Megaphone,
  MessageSquare,
  Bell,
  Mail,
  Vote,
  Coins,
  BarChart3,
  LineChart,
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
  /** Restrict visibility to these staff roles. Omit for all staff. SUPER_ADMIN always sees all. */
  roles?: Role[];
  /** Permission key required to see this item (preferred over roles). */
  permission?: string;
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
        permission: "articles.read",
      },
      {
        label: "Review Queue",
        href: "/admin/articles/review",
        icon: ClipboardCheck,
        status: "live",
        api: "/api/admin/articles/review",
        description: "Approve pending articles before publication",
        roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
        permission: "articles.publish",
      },
      {
        label: "Categories",
        href: "/admin/categories",
        icon: FolderTree,
        status: "live",
        api: "/api/admin/categories",
        permission: "categories.read",
      },
      {
        label: "Tags",
        href: "/admin/tags",
        icon: Tag,
        status: "live",
        api: "/api/admin/tags",
        description: "Tag model exists; admin API pending",
        permission: "tags.read",
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
        permission: "media.read",
      },
      {
        label: "Galleries",
        href: "/admin/galleries",
        icon: Images,
        status: "live",
        api: "/api/admin/galleries",
        permission: "galleries.read",
      },
      {
        label: "Videos",
        href: "/admin/videos",
        icon: Video,
        status: "live",
        api: "/api/admin/videos",
        permission: "videos.read",
      },
      {
        label: "E-Paper",
        href: "/admin/epaper",
        icon: Newspaper,
        status: "live",
        api: "/api/admin/epaper",
        permission: "epaper.read",
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
        permission: "breaking.read",
      },
      {
        label: "Live News",
        href: "/admin/live",
        icon: Radio,
        status: "live",
        api: "/api/admin/live",
        permission: "live.read",
      },
      {
        label: "Featured News",
        href: "/admin/featured",
        icon: Star,
        status: "live",
        api: "/api/admin/featured",
        description: "Uses Article.isFeatured; dedicated manager pending",
        permission: "featured.read",
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
        roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
        permission: "ads.read",
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
        permission: "comments.read",
      },
      {
        label: "Notifications",
        href: "/admin/notifications",
        icon: Bell,
        status: "live",
        api: "/api/admin/notifications",
        permission: "notifications.read",
      },
      {
        label: "Newsletter & Push",
        href: "/admin/newsletter",
        icon: Mail,
        status: "live",
        api: "/api/admin/newsletter/subscribers",
        roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
        permission: "newsletter.read",
      },
      {
        label: "Polls (जनमत)",
        href: "/admin/polls",
        icon: Vote,
        status: "live",
        api: "/api/admin/polls",
        permission: "polls.read",
      },
      {
        label: "Market & Horoscope",
        href: "/admin/utilities",
        icon: Coins,
        status: "live",
        api: "/api/admin/utilities",
        description: "Forex, gold rates, and daily rashifal",
        permission: "utilities.read",
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
        permission: "analytics.read",
      },
      {
        label: "Articles",
        href: "/admin/analytics/articles",
        icon: FileText,
        status: "live",
        api: "/api/admin/analytics/articles",
        permission: "analytics.read",
      },
      {
        label: "Traffic",
        href: "/admin/analytics/traffic",
        icon: LineChart,
        status: "live",
        api: "/api/admin/analytics/traffic",
        permission: "analytics.read",
      },
    ],
  },
  {
    title: "Website",
    items: [
      {
        label: "SEO",
        href: "/admin/website/seo",
        icon: Search,
        status: "live",
        api: "/api/admin/website/seo",
        roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
        permission: "seo.read",
      },
      {
        label: "Redirects",
        href: "/admin/website/redirects",
        icon: ArrowRightLeft,
        status: "live",
        api: "/api/admin/website/redirects",
        roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
        permission: "redirects.read",
      },
      {
        label: "Site Settings",
        href: "/admin/settings",
        icon: Settings,
        status: "live",
        api: "/api/admin/settings",
        description: "Site identity, contact, and comment defaults",
        roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR],
        permission: "settings.read",
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
        roles: [Role.SUPER_ADMIN, Role.ADMIN],
        permission: "users.read",
      },
      {
        label: "Roles & Permissions",
        href: "/admin/system/roles",
        icon: Shield,
        status: "live",
        api: "/api/admin/system/roles",
        description: "Tick CRUD access per role (Super Admin)",
        roles: [Role.SUPER_ADMIN],
        permission: "roles.manage",
      },
      {
        label: "Audit Logs",
        href: "/admin/system/audit-logs",
        icon: ScrollText,
        status: "live",
        api: "/api/admin/system/audit-logs",
        roles: [Role.SUPER_ADMIN, Role.ADMIN],
        permission: "audit.read",
      },
      {
        label: "API Management",
        href: "/admin/system/api",
        icon: Plug,
        status: "live",
        api: "/api/admin/system/api-keys",
        roles: [Role.SUPER_ADMIN, Role.ADMIN],
        permission: "api_keys.manage",
      },
      {
        label: "System / Maintenance",
        href: "/admin/system/maintenance",
        icon: Wrench,
        status: "live",
        api: "/api/admin/system/maintenance",
        roles: [Role.SUPER_ADMIN, Role.ADMIN],
        permission: "maintenance.manage",
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

export function isAdminNavItemActive(
  pathname: string,
  href: string,
  exactMatch = false,
  allHrefs: string[] = []
): boolean {
  if (exactMatch || href === "/admin") {
    return pathname === href;
  }

  if (pathname === href) {
    return true;
  }

  if (!pathname.startsWith(`${href}/`)) {
    return false;
  }

  const hasMoreSpecificNavMatch = allHrefs.some(
    (other) =>
      other !== href &&
      other.startsWith(`${href}/`) &&
      (pathname === other || pathname.startsWith(`${other}/`))
  );

  return !hasMoreSpecificNavMatch;
}

export function filterNavSectionsForRole(
  sections: AdminNavSection[],
  role: Role | undefined,
  permissions?: string[] | Set<string>
): AdminNavSection[] {
  if (!role) return [];
  if (role === Role.SUPER_ADMIN) return sections;

  const permSet =
    permissions instanceof Set
      ? permissions
      : permissions
        ? new Set(permissions)
        : null;

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.permission && permSet) {
          return permSet.has(item.permission);
        }
        if (item.permission && !permSet) {
          // Fall back to roles until permissions load
          return !item.roles || item.roles.includes(role);
        }
        return !item.roles || item.roles.includes(role);
      }),
    }))
    .filter((section) => section.items.length > 0);
}
