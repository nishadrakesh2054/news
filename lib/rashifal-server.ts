import { unstable_cache } from "next/cache";
import { getSetting } from "@/lib/settings-store";
import {
  DEFAULT_DETAILED_RASHIFAL,
  normalizeRashifalList,
  type DetailedRashi,
} from "@/lib/rashifal";

async function loadRashifalListUncached(): Promise<DetailedRashi[]> {
  try {
    const raw = await getSetting("rashifal_json");
    if (!raw) {
      return DEFAULT_DETAILED_RASHIFAL.map((r) => structuredClone(r));
    }
    try {
      return normalizeRashifalList(JSON.parse(raw));
    } catch {
      return DEFAULT_DETAILED_RASHIFAL.map((r) => structuredClone(r));
    }
  } catch {
    return DEFAULT_DETAILED_RASHIFAL.map((r) => structuredClone(r));
  }
}

/** Load and normalize rashifal from Setting.rashifal_json (server-only, cached). */
export async function loadRashifalList(): Promise<DetailedRashi[]> {
  // Tags mirror CACHE_TAGS.settings / home without importing public-cache (cycle risk).
  return unstable_cache(
    () => loadRashifalListUncached(),
    ["public-rashifal-list-v1"],
    { revalidate: 300, tags: ["settings", "home"] }
  )();
}
