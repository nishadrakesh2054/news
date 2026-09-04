import { apiSuccess, apiError } from "@/lib/api-response";
import { getRashiBySlug } from "@/lib/rashifal";
import { loadRashifalList } from "@/lib/rashifal-server";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { slug } = await params;
  const list = await loadRashifalList();
  const rashi = getRashiBySlug(list, slug);

  if (!rashi) {
    return apiError("Rashi not found", 404);
  }

  return apiSuccess({
    rashi,
    siblings: list.map((r) => ({
      slug: r.slug,
      name: r.name,
      enName: r.enName,
      symbol: r.symbol,
    })),
  });
}
