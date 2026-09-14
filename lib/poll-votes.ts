import { prisma } from "@/lib/prisma";
import { createHash } from "node:crypto";

export async function hasPollVote(pollId: string, voterKey: string): Promise<boolean> {
  const row = await prisma.pollVote.findUnique({
    where: { pollId_voterKey: { pollId, voterKey } },
    select: { id: true },
  });
  return Boolean(row);
}

/** Record vote key; returns false if already voted (unique constraint). */
export async function recordPollVote(pollId: string, voterKey: string): Promise<boolean> {
  try {
    await prisma.pollVote.create({
      data: { pollId, voterKey },
    });
    return true;
  } catch {
    return false;
  }
}

export function buildPollVoterKey(ip: string, userId?: string | null): string {
  if (userId) return `user:${userId}`;
  // Hash IP so raw addresses are not stored in the vote table.
  const hash = createHash("sha256").update(`poll-ip:${ip}`).digest("hex").slice(0, 32);
  return `ip:${hash}`;
}
