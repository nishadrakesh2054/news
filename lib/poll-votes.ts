import { getJsonSetting, setSettings } from "@/lib/settings-store";

type PollVoteMap = Record<string, string[]>;

const SETTING_KEY = "poll_voter_keys";

export async function hasPollVote(pollId: string, voterKey: string): Promise<boolean> {
  const map = await getJsonSetting<PollVoteMap>(SETTING_KEY, {});
  return (map[pollId] ?? []).includes(voterKey);
}

export async function recordPollVote(pollId: string, voterKey: string) {
  const map = await getJsonSetting<PollVoteMap>(SETTING_KEY, {});
  const existing = map[pollId] ?? [];
  if (existing.includes(voterKey)) return;
  map[pollId] = [...existing, voterKey];
  await setSettings({ [SETTING_KEY]: JSON.stringify(map) });
}

export function buildPollVoterKey(ip: string, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  return `ip:${ip}`;
}
