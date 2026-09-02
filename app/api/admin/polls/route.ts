import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { PollStatus } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";
import { validatePollCreate } from "@/lib/validations/poll";

export async function GET() {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const polls = await prisma.poll.findMany({
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

    const { questionNp, options, expiresAt } = validation.data;

    await prisma.poll.updateMany({
      where: { status: PollStatus.ACTIVE },
      data: { status: PollStatus.CLOSED },
    });

    const newPoll = await prisma.poll.create({
      data: {
        question: questionNp,
        questionNp,
        status: PollStatus.ACTIVE,
        expiresAt: expiresAt ?? null,
        options: {
          create: options.map((optStr) => ({
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
