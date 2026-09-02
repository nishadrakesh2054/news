import { NextRequest } from "next/server";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { getSettings, setSettings } from "@/lib/settings-store";

const SITE_KEYS = [
  "site_name",
  "site_name_np",
  "site_tagline",
  "press_council_reg",
  "dept_info_reg",
  "site_logo_url",
  "contact_email",
  "contact_phone",
  "comment_mode",
  "default_author_status",
];

export async function GET() {
  try {
    const data = await getSettings(SITE_KEYS);
    return apiSuccess(data);
  } catch (error) {
    return handleServerError(error, "Failed to fetch site settings");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const body = await request.json();
    const entries: Record<string, string> = {};
    for (const key of SITE_KEYS) {
      if (body[key] !== undefined) entries[key] = String(body[key]);
    }
    await setSettings(entries);
    return apiSuccess(entries, "Site settings saved");
  } catch (error) {
    return handleServerError(error, "Failed to save site settings");
  }
}
