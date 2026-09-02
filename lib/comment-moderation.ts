export function looksLikeSpam(content: string): boolean {
  const trimmed = content.trim();
  if (trimmed.length < 2) return true;

  const linkCount = (trimmed.match(/https?:\/\//gi) ?? []).length;
  if (linkCount >= 3) return true;

  const repeatedChar = /(.)\1{8,}/.test(trimmed);
  if (repeatedChar) return true;

  const spamPhrases = ["casino", "viagra", "crypto giveaway", "click here now"];
  const lower = trimmed.toLowerCase();
  if (spamPhrases.some((phrase) => lower.includes(phrase))) return true;

  return false;
}
