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
    if (!db?.setting) {
      return apiSuccess({});
    }

    const settings = await db.setting.findMany({
      where: {
        key: { in: ["gold_fine", "gold_tejabi", "silver", "rashifal_json"] },
      },
    });

    const data: Record<string, string> = {};
    for (const s of settings) {
      data[s.key] = s.value;
    }

    return apiSuccess(data);
  } catch (error) {
    return handleServerError(error, "Failed to fetch utility settings");
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("अनधिकृत पहुँच (Unauthorized)", 403);
    }

    const body = await req.json();
    const { goldFine, goldTejabi, silver, rashifal } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    if (!db?.setting) {
      return apiError("Database model not initialized. Please restart dev server.", 500);
    }

    const updates = [];

    if (goldFine !== undefined) {
      updates.push(
        db.setting.upsert({
          where: { key: "gold_fine" },
          update: { value: String(goldFine) },
          create: { key: "gold_fine", value: String(goldFine) },
        })
      );
    }

    if (goldTejabi !== undefined) {
      updates.push(
        db.setting.upsert({
          where: { key: "gold_tejabi" },
          update: { value: String(goldTejabi) },
          create: { key: "gold_tejabi", value: String(goldTejabi) },
        })
      );
    }

    if (silver !== undefined) {
      updates.push(
        db.setting.upsert({
          where: { key: "silver" },
          update: { value: String(silver) },
          create: { key: "silver", value: String(silver) },
        })
      );
    }

    if (rashifal !== undefined) {
      const val = typeof rashifal === "string" ? rashifal : JSON.stringify(rashifal);
      updates.push(
        db.setting.upsert({
          where: { key: "rashifal_json" },
          update: { value: val },
          create: { key: "rashifal_json", value: val },
        })
      );
    }

    await Promise.all(updates);

    return apiSuccess(null, "बजार मूल्य तथा राशिफल सफलतापूर्वक अद्यावधिक भयो (Utilities updated successfully)");
  } catch (error) {
    return handleServerError(error, "Failed to update utility settings");
  }
}
