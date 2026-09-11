import { Role } from "@prisma/client";

/** Stable permission keys used by APIs, nav, and the tick matrix. */
export const PERMISSION_CATALOG = [
  // Articles
  "articles.create",
  "articles.read",
  "articles.update",
  "articles.delete",
  "articles.publish",
  // Users
  "users.read",
  "users.update",
  "users.delete",
  // Categories
  "categories.create",
  "categories.read",
  "categories.update",
  "categories.delete",
  // Tags
  "tags.create",
  "tags.read",
  "tags.update",
  "tags.delete",
  // Media
  "media.create",
  "media.read",
  "media.update",
  "media.delete",
  // Galleries
  "galleries.create",
  "galleries.read",
  "galleries.update",
  "galleries.delete",
  // Videos
  "videos.create",
  "videos.read",
  "videos.update",
  "videos.delete",
  // E-paper
  "epaper.create",
  "epaper.read",
  "epaper.update",
  "epaper.delete",
  // Newsroom
  "breaking.create",
  "breaking.read",
  "breaking.update",
  "breaking.delete",
  "live.create",
  "live.read",
  "live.update",
  "live.delete",
  "featured.create",
  "featured.read",
  "featured.update",
  "featured.delete",
  // Monetization
  "ads.create",
  "ads.read",
  "ads.update",
  "ads.delete",
  // Engagement
  "comments.read",
  "comments.moderate",
  "notifications.create",
  "notifications.read",
  "notifications.update",
  "notifications.delete",
  "newsletter.read",
  "newsletter.update",
  "polls.create",
  "polls.read",
  "polls.update",
  "polls.delete",
  "utilities.read",
  "utilities.update",
  // Analytics / website
  "analytics.read",
  "seo.read",
  "seo.update",
  "redirects.create",
  "redirects.read",
  "redirects.update",
  "redirects.delete",
  "settings.read",
  "settings.update",
  // System
  "roles.manage",
  "audit.read",
  "api_keys.manage",
  "maintenance.manage",
] as const;

export type PermissionKey = (typeof PERMISSION_CATALOG)[number];

export type PermissionAction = "create" | "read" | "update" | "delete" | "publish" | "moderate" | "manage";

export type PermissionModule = {
  id: string;
  label: string;
  actions: { key: PermissionKey; label: string }[];
};

/** UI matrix modules (rows) and CRUD-style columns. */
export const PERMISSION_MODULES: PermissionModule[] = [
  {
    id: "articles",
    label: "Articles",
    actions: [
      { key: "articles.create", label: "Create" },
      { key: "articles.read", label: "Read" },
      { key: "articles.update", label: "Update" },
      { key: "articles.delete", label: "Delete" },
      { key: "articles.publish", label: "Publish" },
    ],
  },
  {
    id: "users",
    label: "Users",
    actions: [
      { key: "users.read", label: "Read" },
      { key: "users.update", label: "Update" },
      { key: "users.delete", label: "Delete" },
    ],
  },
  {
    id: "categories",
    label: "Categories",
    actions: [
      { key: "categories.create", label: "Create" },
      { key: "categories.read", label: "Read" },
      { key: "categories.update", label: "Update" },
      { key: "categories.delete", label: "Delete" },
    ],
  },
  {
    id: "tags",
    label: "Tags",
    actions: [
      { key: "tags.create", label: "Create" },
      { key: "tags.read", label: "Read" },
      { key: "tags.update", label: "Update" },
      { key: "tags.delete", label: "Delete" },
    ],
  },
  {
    id: "media",
    label: "Media",
    actions: [
      { key: "media.create", label: "Create" },
      { key: "media.read", label: "Read" },
      { key: "media.update", label: "Update" },
      { key: "media.delete", label: "Delete" },
    ],
  },
  {
    id: "galleries",
    label: "Galleries",
    actions: [
      { key: "galleries.create", label: "Create" },
      { key: "galleries.read", label: "Read" },
      { key: "galleries.update", label: "Update" },
      { key: "galleries.delete", label: "Delete" },
    ],
  },
  {
    id: "videos",
    label: "Videos",
    actions: [
      { key: "videos.create", label: "Create" },
      { key: "videos.read", label: "Read" },
      { key: "videos.update", label: "Update" },
      { key: "videos.delete", label: "Delete" },
    ],
  },
  {
    id: "epaper",
    label: "E-Paper",
    actions: [
      { key: "epaper.create", label: "Create" },
      { key: "epaper.read", label: "Read" },
      { key: "epaper.update", label: "Update" },
      { key: "epaper.delete", label: "Delete" },
    ],
  },
  {
    id: "breaking",
    label: "Breaking",
    actions: [
      { key: "breaking.create", label: "Create" },
      { key: "breaking.read", label: "Read" },
      { key: "breaking.update", label: "Update" },
      { key: "breaking.delete", label: "Delete" },
    ],
  },
  {
    id: "live",
    label: "Live",
    actions: [
      { key: "live.create", label: "Create" },
      { key: "live.read", label: "Read" },
      { key: "live.update", label: "Update" },
      { key: "live.delete", label: "Delete" },
    ],
  },
  {
    id: "featured",
    label: "Featured",
    actions: [
      { key: "featured.create", label: "Create" },
      { key: "featured.read", label: "Read" },
      { key: "featured.update", label: "Update" },
      { key: "featured.delete", label: "Delete" },
    ],
  },
  {
    id: "ads",
    label: "Ads",
    actions: [
      { key: "ads.create", label: "Create" },
      { key: "ads.read", label: "Read" },
      { key: "ads.update", label: "Update" },
      { key: "ads.delete", label: "Delete" },
    ],
  },
  {
    id: "comments",
    label: "Comments",
    actions: [
      { key: "comments.read", label: "Read" },
      { key: "comments.moderate", label: "Moderate" },
    ],
  },
  {
    id: "notifications",
    label: "Notifications",
    actions: [
      { key: "notifications.create", label: "Create" },
      { key: "notifications.read", label: "Read" },
      { key: "notifications.update", label: "Update" },
      { key: "notifications.delete", label: "Delete" },
    ],
  },
  {
    id: "newsletter",
    label: "Newsletter",
    actions: [
      { key: "newsletter.read", label: "Read" },
      { key: "newsletter.update", label: "Update" },
    ],
  },
  {
    id: "polls",
    label: "Polls",
    actions: [
      { key: "polls.create", label: "Create" },
      { key: "polls.read", label: "Read" },
      { key: "polls.update", label: "Update" },
      { key: "polls.delete", label: "Delete" },
    ],
  },
  {
    id: "utilities",
    label: "Utilities",
    actions: [
      { key: "utilities.read", label: "Read" },
      { key: "utilities.update", label: "Update" },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    actions: [{ key: "analytics.read", label: "Read" }],
  },
  {
    id: "seo",
    label: "SEO",
    actions: [
      { key: "seo.read", label: "Read" },
      { key: "seo.update", label: "Update" },
    ],
  },
  {
    id: "redirects",
    label: "Redirects",
    actions: [
      { key: "redirects.create", label: "Create" },
      { key: "redirects.read", label: "Read" },
      { key: "redirects.update", label: "Update" },
      { key: "redirects.delete", label: "Delete" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    actions: [
      { key: "settings.read", label: "Read" },
      { key: "settings.update", label: "Update" },
    ],
  },
  {
    id: "system",
    label: "System",
    actions: [
      { key: "roles.manage", label: "Roles" },
      { key: "audit.read", label: "Audit" },
      { key: "api_keys.manage", label: "API keys" },
      { key: "maintenance.manage", label: "Maintenance" },
    ],
  },
];

const ALL = [...PERMISSION_CATALOG];

/** Seed defaults for assignable roles (SUPER_ADMIN is always full in code). */
export const DEFAULT_ROLE_PERMISSIONS: Record<
  Exclude<Role, "SUPER_ADMIN" | "READER">,
  PermissionKey[]
> = {
  [Role.ADMIN]: ALL.filter((p) => p !== "roles.manage"),
  [Role.EDITOR]: [
    "articles.create",
    "articles.read",
    "articles.update",
    "articles.delete",
    "articles.publish",
    "categories.create",
    "categories.read",
    "categories.update",
    "tags.create",
    "tags.read",
    "tags.update",
    "tags.delete",
    "media.create",
    "media.read",
    "media.update",
    "media.delete",
    "galleries.create",
    "galleries.read",
    "galleries.update",
    "galleries.delete",
    "videos.create",
    "videos.read",
    "videos.update",
    "videos.delete",
    "epaper.create",
    "epaper.read",
    "epaper.update",
    "epaper.delete",
    "breaking.create",
    "breaking.read",
    "breaking.update",
    "breaking.delete",
    "live.create",
    "live.read",
    "live.update",
    "live.delete",
    "featured.create",
    "featured.read",
    "featured.update",
    "featured.delete",
    "ads.read",
    "comments.read",
    "comments.moderate",
    "notifications.create",
    "notifications.read",
    "notifications.update",
    "notifications.delete",
    "newsletter.read",
    "newsletter.update",
    "polls.create",
    "polls.read",
    "polls.update",
    "polls.delete",
    "utilities.read",
    "utilities.update",
    "analytics.read",
    "seo.read",
    "seo.update",
    "redirects.create",
    "redirects.read",
    "redirects.update",
    "redirects.delete",
    "settings.read",
  ],
  [Role.AUTHOR]: [
    "articles.create",
    "articles.read",
    "articles.update",
    "media.create",
    "media.read",
    "media.update",
    "live.read",
    "live.update",
    "comments.read",
  ],
};

export const STAFF_ROLES: Role[] = [
  Role.SUPER_ADMIN,
  Role.ADMIN,
  Role.EDITOR,
  Role.AUTHOR,
];

export const ASSIGNABLE_ROLES: Role[] = [Role.ADMIN, Role.EDITOR, Role.AUTHOR, Role.READER];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  EDITOR: "Editor",
  AUTHOR: "Author",
  READER: "Reader",
};

export function isPermissionKey(value: string): value is PermissionKey {
  return (PERMISSION_CATALOG as readonly string[]).includes(value);
}

export function perm(module: string, action: string): string {
  return `${module}.${action}`;
}
