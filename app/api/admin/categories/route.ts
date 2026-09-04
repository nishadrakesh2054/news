import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { invalidatePublicCategories } from "@/lib/cache-invalidation";
import { requireStaff, requireEditor } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireStaff();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(request.url);
    const light = searchParams.get("light") === "1";

    if (light) {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          nameNp: true,
          slug: true,
          order: true,
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      });
      return apiSuccess(categories, "Categories retrieved successfully");
    }

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        nameNp: true,
        slug: true,
        description: true,
        descriptionNp: true,
        order: true,
        createdAt: true,
        _count: {
          select: {
            articles: true,
          },
        },
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return apiSuccess(categories, "Categories retrieved successfully");
  } catch (error) {
    return handleServerError(error, "Failed to retrieve categories");
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Only Admins and Editors can create categories", 403);
    }

    const { name, nameNp, slug, description, descriptionNp, order } = await request.json();

    if (!name || !slug) {
      return apiError("Category name and slug are required", 400);
    }

    const existingSlug = await prisma.category.findUnique({
      where: { slug: slug.trim().toLowerCase() },
    });

    if (existingSlug) {
      return apiError("Category with this slug already exists", 400);
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        nameNp: nameNp ? nameNp.trim() : null,
        slug: slug.trim().toLowerCase(),
        description: description ? description.trim() : null,
        descriptionNp: descriptionNp ? descriptionNp.trim() : null,
        order: typeof order === "number" ? order : 0,
      },
    });

    invalidatePublicCategories();

    return apiSuccess(category, "Category created successfully", 201);
  } catch (error) {
    return handleServerError(error, "Failed to create category");
  }
}
