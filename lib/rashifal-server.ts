import { prisma } from "@/lib/prisma";
import {
  DEFAULT_DETAILED_RASHIFAL,
  normalizeRashifalList,
  type DetailedRashi,
} from "@/lib/rashifal";

/** Load and normalize rashifal from Setting.rashifal_json (server-only). */
export async function loadRashifalList(): Promise<DetailedRashi[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = prisma as any;
    if (!db?.setting) {
      return DEFAULT_DETAILED_RASHIFAL.map((r) => structuredClone(r));
    }

    const row = await db.setting.findUnique({
      where: { key: "rashifal_json" },
    });

    if (!row?.value) {
      return DEFAULT_DETAILED_RASHIFAL.map((r) => structuredClone(r));
    }

    try {
      return normalizeRashifalList(JSON.parse(row.value));
    } catch {
      return DEFAULT_DETAILED_RASHIFAL.map((r) => structuredClone(r));
    }
  } catch {
    return DEFAULT_DETAILED_RASHIFAL.map((r) => structuredClone(r));
  }
}
