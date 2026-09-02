import { NextRequest } from "next/server";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { getJsonSetting, setSettings } from "@/lib/settings-store";

const DEFAULT_LAYOUT = {
  showBreakingTicker: true,
  tickerSpeedSec: 5,
  showHeroFeatured: true,
  heroLayoutMode: "lead_3_grid",
  showLiveBar: true,
  sectionOrder: [] as string[],
};

export async function GET() {
  try {
    const layout = await getJsonSetting("homepage_layout", DEFAULT_LAYOUT);
    return apiSuccess(layout);
  } catch (error) {
    return handleServerError(error, "Failed to fetch homepage layout");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const body = await request.json();
    await setSettings({ homepage_layout: body });
    return apiSuccess(body, "Homepage layout saved");
  } catch (error) {
    return handleServerError(error, "Failed to save homepage layout");
  }
}
