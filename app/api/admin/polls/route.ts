import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { validatePollCreate } from "@/lib/validations/poll";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    if (!db?.poll) return apiSuccess([]);

    const polls = await db.poll.findMany({
      orderBy: { createdAt: "desc" },
      include: { options: true },
    });

    return apiSuccess(polls);
  } catch (error) {
    return handleServerError(error, "Failed to fetch polls");
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const body = await req.json();
    const validation = validatePollCreate(body);
    if (!validation.ok) {
      return apiError(validation.error, 400);
    }

    const { questionNp, options } = validation.data;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;

    // Set other active polls to CLOSED
    await db.poll.updateMany({
      where: { status: "ACTIVE" },
      data: { status: "CLOSED" },
    });

    const newPoll = await db.poll.create({
      data: {
        question: questionNp,
        questionNp: questionNp,
        status: "ACTIVE",
        options: {
          create: options.map((optStr: string) => ({
            option: optStr,
            optionNp: optStr,
          })),
        },
      },
      include: { options: true },
    });

    return apiSuccess(newPoll, "नयाँ पोल (जनमत) सफलतापूर्वक सिर्जना गरियो");
  } catch (error) {
    return handleServerError(error, "Failed to create poll");
  }
}
