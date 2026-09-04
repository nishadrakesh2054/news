import { apiSuccess } from "@/lib/api-response";
import { Role } from "@prisma/client";

const PERMISSIONS = {
  [Role.ADMIN]: ["*"],
  [Role.EDITOR]: [
    "articles", "categories", "tags", "comments", "breaking", "live", "featured",
    "media", "galleries", "videos", "epaper", "ads", "polls", "utilities",
    "notifications", "analytics", "website.seo", "website.menus", "website.redirects",
  ],
  [Role.AUTHOR]: ["articles.own", "live", "media.own", "comments.read"],
  [Role.READER]: [],
};

export async function GET() {
  return apiSuccess({
    roles: Object.values(Role),
    permissions: PERMISSIONS,
    matrix: [
      { module: "Articles", admin: true, editor: true, author: "own", reader: false },
      { module: "Users", admin: true, editor: false, author: false, reader: false },
      { module: "Settings", admin: true, editor: true, author: false, reader: false },
      { module: "Analytics", admin: true, editor: true, author: false, reader: false },
      { module: "Ads", admin: true, editor: true, author: false, reader: false },
    ],
  });
}
