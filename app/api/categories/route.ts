import { NextRequest } from "next/server";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { getCachedCategories } from "@/lib/public-cache";
import { resolveCategoryName, resolveLanguageFromRequest } from "@/lib/language";

export async function GET(request: NextRequest) {
  try {
    const lang = resolveLanguageFromRequest(request);
    const categories = await getCachedCategories();

    const res = apiSuccess(
      categories.map((category) => ({
        ...category,
        lang,
        displayName: resolveCategoryName(category, lang),
      })),
      "Categories retrieved successfully"
    );
    res.headers.set("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
    res.headers.set("Content-Language", lang === "en" ? "en" : "ne");
    return res;
  } catch (error) {
    return handleServerError(error, "Failed to retrieve categories");
  }
}
