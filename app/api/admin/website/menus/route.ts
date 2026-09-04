import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { requireEditor } from "@/lib/admin-auth";

export async function GET() {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const menus = await prisma.menu.findMany({
      include: {
        items: {
          where: { parentId: null },
          orderBy: { order: "asc" },
          include: { children: { orderBy: { order: "asc" } } },
        },
      },
      orderBy: { name: "asc" },
    });
    return apiSuccess(menus);
  } catch (error) {
    return handleServerError(error, "Failed to fetch menus");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireEditor();
    if (auth.error) return auth.error;

    const { name, label, items = [] } = await request.json();
    if (!name || !label) return apiError("Menu name and label are required");

    const menu = await prisma.menu.create({
      data: {
        name: name.trim().toLowerCase(),
        label: label.trim(),
        items: {
          create: items.map((item: { label: string; labelNp?: string; url: string; order?: number }, i: number) => ({
            label: item.label,
            labelNp: item.labelNp || null,
            url: item.url,
            order: item.order ?? i,
          })),
        },
      },
      include: { items: true },
    });

    return apiSuccess(menu, "Menu created", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create menu");
  }
}
