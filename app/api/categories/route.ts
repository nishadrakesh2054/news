import { apiSuccess, handleServerError } from "@/lib/api-response";
import { getCachedCategories } from "@/lib/public-cache";

export async function GET() {
  try {
    const categories = await getCachedCategories();

    const res = apiSuccess(categories, "Categories retrieved successfully");
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to retrieve categories");
  }
}
