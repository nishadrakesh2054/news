import { prisma } from "@/lib/prisma";
import { apiSuccess, handleServerError } from "@/lib/api-response";
import { getJsonSetting } from "@/lib/settings-store";

export async function GET() {
  try {
    const totalViews = await prisma.article.aggregate({ _sum: { views: true } });
    const published = await prisma.article.count({ where: { status: "PUBLISHED" } });

    const trafficConfig = await getJsonSetting("traffic_analytics", {
      ga4Id: "",
      gtmId: "",
      fbPixelId: "",
      devices: [
        { name: "Mobile", percentage: 68 },
        { name: "Desktop", percentage: 28 },
        { name: "Tablet", percentage: 4 },
      ],
      peakHours: [
        { time: "08:00", label: "Morning", volume: "High" },
        { time: "13:00", label: "Afternoon", volume: "Medium" },
        { time: "20:00", label: "Evening", volume: "Peak" },
      ],
    });

    return apiSuccess({
      totalViews: totalViews._sum.views || 0,
      publishedArticles: published,
      ...trafficConfig,
    });
  } catch (error) {
    return handleServerError(error, "Failed to fetch traffic analytics");
  }
}
