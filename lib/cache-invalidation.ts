import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/public-cache";

const CACHE_PROFILE = "max";

export function invalidatePublicCategories() {
  revalidateTag(CACHE_TAGS.categories, CACHE_PROFILE);
}

export function invalidatePublicTags() {
  revalidateTag(CACHE_TAGS.tags, CACHE_PROFILE);
}

export function invalidatePublicAds() {
  revalidateTag(CACHE_TAGS.ads, CACHE_PROFILE);
}
