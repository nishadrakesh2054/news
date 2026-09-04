/**
 * Seed demo opinion poll for homepage widget
 * Run: npx tsx prisma/seed-polls.ts
 */
import { PrismaClient, PollStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding opinion poll…");

  await prisma.poll.updateMany({
    where: { status: PollStatus.ACTIVE },
    data: { status: PollStatus.CLOSED },
  });

  const questionNp = "के सरकारको पछिल्लो आर्थिक नीतिले युवा उद्यमीलाई प्रोत्साहन गर्छ?";
  const question = "Does the government's latest economic policy encourage young entrepreneurs?";

  const existing = await prisma.poll.findFirst({
    where: { questionNp },
    include: { options: true },
  });

  if (existing) {
    await prisma.poll.update({
      where: { id: existing.id },
      data: { status: PollStatus.ACTIVE, question, questionNp },
    });
    console.log(`↻ Reactivated existing poll: ${questionNp}`);
  } else {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.poll.create({
      data: {
        question,
        questionNp,
        status: PollStatus.ACTIVE,
        expiresAt,
        options: {
          create: [
            { option: "Yes", optionNp: "गर्छ", votes: 42 },
            { option: "No", optionNp: "गर्दैन", votes: 28 },
            { option: "Can't say", optionNp: "भन्न सकिन्न", votes: 15 },
            { option: "Need more time", optionNp: "समय चाहिन्छ", votes: 9 },
          ],
        },
      },
    });
    console.log(`✅ Created poll: ${questionNp}`);
  }

  const active = await prisma.poll.count({ where: { status: PollStatus.ACTIVE } });
  console.log(`🎉 Poll seed done — active=${active}`);
}

main()
  .catch((e) => {
    console.error("❌ Poll seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
