import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";

interface RawPollOption {
  id: string;
  option?: string;
  optionNp?: string;
  votes: number;
}

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    if (!db?.poll) {
      return apiSuccess(null);
    }

    const activePoll = await db.poll.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: {
        options: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!activePoll) {
      return apiSuccess(null);
    }

    const totalVotes = activePoll.options.reduce((acc: number, opt: RawPollOption) => acc + opt.votes, 0);

    const optionsWithPercent = activePoll.options.map((opt: RawPollOption) => ({
      id: opt.id,
      option: opt.option,
      optionNp: opt.optionNp,
      votes: opt.votes,
      percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
    }));

    return apiSuccess({
      id: activePoll.id,
      question: activePoll.question,
      questionNp: activePoll.questionNp,
      totalVotes,
      options: optionsWithPercent,
    });
  } catch (error) {
    return handleServerError(error, "Failed to fetch poll");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { optionId } = body;

    if (!optionId) {
      return apiError("Option ID is required", 400);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    const option = await db.pollOption.update({
      where: { id: optionId },
      data: { votes: { increment: 1 } },
      include: { poll: { include: { options: true } } },
    });

    const totalVotes = option.poll.options.reduce((acc: number, opt: RawPollOption) => acc + opt.votes, 0);
    const optionsWithPercent = option.poll.options.map((opt: RawPollOption) => ({
      id: opt.id,
      option: opt.option,
      optionNp: opt.optionNp,
      votes: opt.votes,
      percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
    }));

    return apiSuccess({
      id: option.poll.id,
      question: option.poll.question,
      questionNp: option.poll.questionNp,
      totalVotes,
      options: optionsWithPercent,
    }, "तपाईंको मत सफलतापूर्वक दर्ता भयो। धन्यवाद!");
  } catch (error) {
    return handleServerError(error, "Failed to submit vote");
  }
}
