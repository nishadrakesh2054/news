import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateResetToken(): string {
  return randomBytes(RESET_TOKEN_BYTES).toString("hex");
}

export async function createPasswordResetToken(userId: string): Promise<string> {
  const token = generateResetToken();
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.passwordResetToken.deleteMany({ where: { userId } });
  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return token;
}

export async function findValidResetToken(token: string) {
  const tokenHash = hashResetToken(token);
  const now = new Date();

  return prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      expiresAt: { gt: now },
    },
    include: {
      user: {
        select: { id: true, email: true, password: true },
      },
    },
  });
}

export async function consumePasswordResetToken(id: string): Promise<void> {
  await prisma.passwordResetToken.delete({ where: { id } });
}

export async function purgeExpiredResetTokens(): Promise<void> {
  await prisma.passwordResetToken.deleteMany({
    where: { expiresAt: { lte: new Date() } },
  });
}
