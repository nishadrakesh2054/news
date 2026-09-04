import { prisma } from "@/lib/prisma";

/** Bump so existing JWTs fail the sessionVersion check and must re-login. */
export async function bumpUserSessionVersion(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  });
}
