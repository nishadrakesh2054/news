import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { PollStatus } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id } = await params;
    const { status, expiresAt } = await request.json();

    const existing = await prisma.poll.findUnique({ where: { id } });
    if (!existing) {
      return apiError("Poll not found", 404);
    }

    if (status === PollStatus.ACTIVE) {
      await prisma.poll.updateMany({
        where: { status: PollStatus.ACTIVE, id: { not: id } },
        data: { status: PollStatus.CLOSED },
      });
    }

    const poll = await prisma.poll.update({
      where: { id },
      data: {
        ...(status && Object.values(PollStatus).includes(status)
          ? { status: status as PollStatus }
          : {}),
        ...(expiresAt !== undefined
          ? { expiresAt: expiresAt ? new Date(expiresAt) : null }
          : {}),
      },
      include: { options: true },
    });

    return apiSuccess(poll, "Poll updated");
  } catch (error) {
    return handleServerError(error, "Failed to update poll");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { id } = await params;

    await prisma.poll.delete({ where: { id } });

    return apiSuccess(null, "Poll deleted");
  } catch (error) {
    return handleServerError(error, "Failed to delete poll");
  }
}
