import { apiSuccess } from "@/lib/api-response";
import { loadRashifalList } from "@/lib/rashifal-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const list = await loadRashifalList();
  return apiSuccess({
    rashifal: list,
    periods: ["today", "weekly", "monthly", "yearly"],
  });
}
