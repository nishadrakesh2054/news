import { Role, type PrismaClient } from "@prisma/client";

/**
 * Reuse existing staff authors. Only create a seed AUTHOR if none exist.
 */
export async function resolveAuthors(prisma: PrismaClient) {
  const staff = await prisma.user.findMany({
    where: {
      role: { in: [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.AUTHOR] },
      isActive: true,
    },
    select: { id: true, email: true, name: true, role: true },
    orderBy: { createdAt: "asc" },
  });

  if (staff.length > 0) {
    return staff;
  }

  const bcrypt = await import("bcryptjs");
  const password = await bcrypt.hash("SeedAuthor@ChangeMe1", 12);
  const created = await prisma.user.create({
    data: {
      name: "Seed Desk Reporter",
      email: "seed-author@echomanch.local",
      password,
      role: Role.AUTHOR,
      mustChangePassword: true,
    },
    select: { id: true, email: true, name: true, role: true },
  });
  console.log(`  Created fallback author ${created.email} (must change password)`);
  return [created];
}

export function pickAuthor<T extends { id: string }>(authors: T[], index: number): T {
  return authors[index % authors.length];
}
