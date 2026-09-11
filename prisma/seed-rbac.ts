import { PrismaClient, Role } from "@prisma/client";
import { seedDefaultRolePermissions } from "@/lib/permissions";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding role permissions…");
  await seedDefaultRolePermissions();

  // Promote first ADMIN to SUPER_ADMIN if none exists
  const superCount = await prisma.user.count({ where: { role: Role.SUPER_ADMIN } });
  if (superCount === 0) {
    const admin = await prisma.user.findFirst({
      where: { role: Role.ADMIN },
      orderBy: { createdAt: "asc" },
    });
    if (admin) {
      await prisma.user.update({
        where: { id: admin.id },
        data: { role: Role.SUPER_ADMIN, sessionVersion: { increment: 1 } },
      });
      console.log(`Promoted ${admin.email} → SUPER_ADMIN`);
    } else {
      console.log("No ADMIN user found to promote — create one and re-run seed.");
    }
  } else {
    console.log(`SUPER_ADMIN already present (${superCount})`);
  }

  console.log("Role permissions seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
