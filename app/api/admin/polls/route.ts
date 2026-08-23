import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { Role } from "@prisma/client";

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
    const session = await getServerSession(authOptions);
    if (!session?.user || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("अनधिकृत पहुँच (Unauthorized)", 403);
    }

    const body = await req.json();
    const { questionNp, options } = body;

    if (!questionNp || !options || !Array.isArray(options) || options.length < 2) {
      return apiError("कृपया प्रश्न र कम्तीमा २ वटा विकल्पहरू दिनुहोस्", 400);
    }

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
