import { prisma } from "@/lib/prisma";

export async function getSettings(keys: string[]) {
  const settings = await prisma.setting.findMany({
    where: { key: { in: keys } },
  });
  const data: Record<string, string> = {};
  for (const s of settings) {
    data[s.key] = s.value;
  }
  return data;
}

export async function getSetting(key: string, fallback = "") {
  const setting = await prisma.setting.findUnique({ where: { key } });
  return setting?.value ?? fallback;
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
