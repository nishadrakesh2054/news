import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { invalidatePublicCategories } from "@/lib/cache-invalidation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !([Role.ADMIN, Role.EDITOR] as Role[]).includes(session.user.role)) {
      return apiError("Unauthorized: Only Admins and Editors can update categories", 403);
    }

    const { id } = await params;
    const { name, nameNp, slug, description, order } = await request.json();

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return apiError("Category not found", 404);
    }

    if (slug && slug !== existingCategory.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug: slug.trim().toLowerCase() },
      });
      if (slugConflict) {
        return apiError("Another category already uses this slug", 400);
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(nameNp !== undefined && { nameNp: nameNp ? nameNp.trim() : null }),
        ...(slug && { slug: slug.trim().toLowerCase() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(typeof order === "number" && { order }),
      },
    });

    invalidatePublicCategories();

    return apiSuccess(updatedCategory, "Category updated successfully");
  } catch (error) {
    return handleServerError(error, "Failed to update category");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== Role.ADMIN) {
      return apiError("Unauthorized: Only Admins can delete categories", 403);
    }

    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });

    if (!category) {
      return apiError("Category not found", 404);
    }

    if (category._count.articles > 0) {
      return apiError(
        `Cannot delete category with ${category._count.articles} associated articles. Move or delete articles first.`,
        400
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    invalidatePublicCategories();

    return apiSuccess(null, "Category deleted successfully");
  } catch (error) {
    return handleServerError(error, "Failed to delete category");
  }
}
