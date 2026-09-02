import { prisma } from "@/lib/prisma";
import { getJsonSetting, setSettings } from "@/lib/settings-store";

type BreakingExpiryMap = Record<string, string>;

const SETTING_KEY = "breaking_expiries";

export async function getBreakingExpiries(): Promise<BreakingExpiryMap> {
  return getJsonSetting<BreakingExpiryMap>(SETTING_KEY, {});
}

export async function setBreakingExpiry(articleId: string, expiresAt: Date | null) {
  const current = await getBreakingExpiries();
  if (!expiresAt) {
    delete current[articleId];
  } else {
    current[articleId] = expiresAt.toISOString();
  }
  await setSettings({ [SETTING_KEY]: JSON.stringify(current) });
}

export async function clearExpiredBreakingArticles() {
  const expiries = await getBreakingExpiries();
  const now = Date.now();
  const expiredIds = Object.entries(expiries)
    .filter(([, iso]) => new Date(iso).getTime() <= now)
    .map(([id]) => id);

  if (expiredIds.length === 0) return [];

  await prisma.article.updateMany({
    where: { id: { in: expiredIds }, isBreaking: true },
    data: { isBreaking: false },
  });

  const next = { ...expiries };
  for (const id of expiredIds) delete next[id];
  await setSettings({ [SETTING_KEY]: JSON.stringify(next) });

  return expiredIds;
}

export async function getBreakingExpiryForArticle(articleId: string): Promise<string | null> {
  const expiries = await getBreakingExpiries();
  return expiries[articleId] ?? null;
}
