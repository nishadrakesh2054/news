import { unstable_cache, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { CACHE_TAGS } from "@/lib/public-cache";

function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

async function fetchSettings(keys: string[]) {
  const settings = await prisma.setting.findMany({
    where: { key: { in: keys } },
  });
  const data: Record<string, string> = {};
  for (const s of settings) {
    data[s.key] = s.value;
  }
  return data;
}

export async function getSettings(keys: string[]) {
  if (isBuildPhase()) return {};
  try {
    const sortedKeys = [...keys].sort();
    return await unstable_cache(
      () => fetchSettings(sortedKeys),
      [`settings-${sortedKeys.join(",")}`],
      { revalidate: 120, tags: [CACHE_TAGS.settings] }
    )();
  } catch {
    return {};
  }
}

export async function getSetting(key: string, fallback = "") {
  if (isBuildPhase()) return fallback;
  try {
    const cached = await unstable_cache(
      async () => {
        const setting = await prisma.setting.findUnique({ where: { key } });
        return setting?.value ?? null;
      },
      [`setting-${key}`],
      { revalidate: 120, tags: [CACHE_TAGS.settings] }
    )();
    return cached ?? fallback;
  } catch {
    return fallback;
  }
}

export async function setSettings(entries: Record<string, string | object>) {
  const updates = Object.entries(entries).map(([key, value]) => {
    const val = typeof value === "string" ? value : JSON.stringify(value);
    return prisma.setting.upsert({
      where: { key },
      update: { value: val },
      create: { key, value: val },
    });
  });
  await Promise.all(updates);
  try {
    revalidateTag(CACHE_TAGS.settings, "max");
  } catch {
    /* ignore outside request context */
  }
}

export async function getJsonSetting<T>(key: string, fallback: T): Promise<T> {
  const raw = await getSetting(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function invalidateSettingsCache() {
  try {
    revalidateTag(CACHE_TAGS.settings, "max");
  } catch {
    /* ignore */
  }
}
