import { apiSuccess, handleServerError } from "@/lib/api-response";
import { getCachedActiveAds } from "@/lib/public-cache";

export async function GET() {
  try {
    const ads = await getCachedActiveAds();

    const res = apiSuccess(ads, "Ads retrieved successfully");
    res.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=300");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to retrieve ads");
  }
}
