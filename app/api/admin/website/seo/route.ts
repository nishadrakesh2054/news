import { NextRequest } from "next/server";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requirePermission } from "@/lib/admin-auth";
import { getSettings, setSettings } from "@/lib/settings-store";
import { robotsSitemapList } from "@/lib/seo";
import { SITE_CONFIG } from "@/constants/site";

/** Writable site SEO settings (bilingual). */
const SEO_KEYS = [
  "seo_default_title_ne",
  "seo_default_title_en",
  "seo_default_description_ne",
  "seo_default_description_en",
  "seo_keywords_ne",
  "seo_keywords_en",
  "seo_og_image",
  "seo_og_image_en",
  "seo_robots",
  "seo_twitter_handle",
] as const;

const LEGACY_KEYS = ["seo_default_title", "seo_default_description", "seo_og_image"] as const;

export async function GET() {
  try {
    const auth = await requirePermission("seo.read");
    if (auth.error) return auth.error;

    const data = await getSettings([...SEO_KEYS, ...LEGACY_KEYS]);

    // Migrate legacy single fields into bilingual slots when new ones are empty
    if (!data.seo_default_title_en && data.seo_default_title) {
      data.seo_default_title_en = data.seo_default_title;
    }
    if (!data.seo_default_title_ne && data.seo_default_title) {
      data.seo_default_title_ne = data.seo_default_title;
    }
    if (!data.seo_default_description_en && data.seo_default_description) {
      data.seo_default_description_en = data.seo_default_description;
    }
    if (!data.seo_default_description_ne && data.seo_default_description) {
      data.seo_default_description_ne = data.seo_default_description;
    }

    return apiSuccess({
      ...Object.fromEntries(SEO_KEYS.map((k) => [k, data[k] ?? ""])),
      info: {
        nepaliSiteUrl: SITE_CONFIG.url,
        englishSiteUrl: SITE_CONFIG.englishUrl,
        sitemaps: robotsSitemapList(),
        robotsPath: "/robots.txt",
        note: "Canonical URLs and hreflang are automatic per edition. Article SEO is set on each article.",
      },
    });
  } catch (error) {
    return handleServerError(error, "Failed to fetch SEO settings");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requirePermission("seo.update");
    if (auth.error) return auth.error;

    const body = await request.json();
    const entries: Record<string, string> = {};
    for (const key of SEO_KEYS) {
      if (body[key] !== undefined) entries[key] = String(body[key]);
    }
    await setSettings(entries);
    return apiSuccess(entries, "SEO settings saved");
  } catch (error) {
    return handleServerError(error, "Failed to save SEO settings");
  }
}
