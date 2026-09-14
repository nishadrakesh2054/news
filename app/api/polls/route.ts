import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { PollStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { buildPollVoterKey, hasPollVote, recordPollVote } from "@/lib/poll-votes";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getCachedActivePoll } from "@/lib/public-cache";

export async function GET() {
  try {
    const cached = await getCachedActivePoll();

    if (!cached) {
      return NextResponse.json(
        { success: true, data: null },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        }
      );
    }

    if (cached.expired) {
      await prisma.poll.update({
        where: { id: cached.id },
        data: { status: PollStatus.CLOSED },
      });
      return NextResponse.json(
        { success: true, data: null },
        {
          headers: {
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
          },
        }
      );
    }

    const { expired, ...poll } = cached;
    void expired;
    return NextResponse.json(
      { success: true, data: poll },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
        },
      }
    );
  } catch (error) {
    return handleServerError(error, "Failed to fetch poll");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { optionId } = body;

    if (!optionId) {
      return apiError("Option ID is required", 400);
    }

    const ip = getClientIp(req);
    const rate = checkRateLimit(`poll:${ip}`, 10, 60 * 60 * 1000);
    if (!rate.allowed) {
      return apiError("धेरै मत प्रयास। पछि प्रयास गर्नुहोस्।", 429);
    }

    const option = await prisma.pollOption.findUnique({
      where: { id: optionId },
      include: { poll: { include: { options: true } } },
    });

    if (!option || option.poll.status !== PollStatus.ACTIVE) {
      return apiError("यो पोल अहिले सक्रिय छैन", 400);
    }

    if (option.poll.expiresAt && option.poll.expiresAt.getTime() <= Date.now()) {
      await prisma.poll.update({
        where: { id: option.poll.id },
        data: { status: PollStatus.CLOSED },
      });
      return apiError("यो पोल समाप्त भएको छ", 400);
    }

    const voterKey = buildPollVoterKey(ip, session?.user?.id);
    if (await hasPollVote(option.poll.id, voterKey)) {
      return apiError("तपाईंले यो पोलमा पहिले नै मत दिनुभएको छ", 400);
    }

    await recordPollVote(option.poll.id, voterKey);

    const updatedOption = await prisma.pollOption.update({
      where: { id: optionId },
      data: { votes: { increment: 1 } },
      include: { poll: { include: { options: true } } },
    });

    const totalVotes = updatedOption.poll.options.reduce((acc, opt) => acc + opt.votes, 0);
    const optionsWithPercent = updatedOption.poll.options.map((opt) => ({
      id: opt.id,
      option: opt.option,
      optionNp: opt.optionNp,
      votes: opt.votes,
      percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
    }));

    return apiSuccess(
      {
        id: updatedOption.poll.id,
        question: updatedOption.poll.question,
        questionNp: updatedOption.poll.questionNp,
        totalVotes,
        options: optionsWithPercent,
      },
      "तपाईंको मत सफलतापूर्वक दर्ता भयो। धन्यवाद!"
    );
  } catch (error) {
    return handleServerError(error, "Failed to submit vote");
  }
}
