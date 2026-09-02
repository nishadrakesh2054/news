import { apiSuccess, handleServerError } from "@/lib/api-response";
import { getCachedTags } from "@/lib/public-cache";

export async function GET() {
  try {
    const data = await getCachedTags();

    const res = apiSuccess(data, "Tags retrieved successfully");
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to retrieve tags");
  }
}
