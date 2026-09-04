import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { robotsSitemapList } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/api/", "/login", "/register", "/newsletter/unsubscribe"],
    },
    sitemap: robotsSitemapList(),
    host: getSiteUrl(),
  };
}
