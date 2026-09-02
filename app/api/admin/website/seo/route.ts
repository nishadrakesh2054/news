import { NextRequest } from "next/server";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { getSettings, setSettings } from "@/lib/settings-store";

const SEO_KEYS = [
  "seo_default_title",
  "seo_default_description",
  "seo_canonical_url",
  "seo_og_image",
  "seo_robots",
  "seo_twitter_handle",
];

export async function GET() {
  try {
    const data = await getSettings(SEO_KEYS);
    return apiSuccess(data);
  } catch (error) {
    return handleServerError(error, "Failed to fetch SEO settings");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
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
