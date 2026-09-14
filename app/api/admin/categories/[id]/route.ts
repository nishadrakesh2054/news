import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, handleServerError } from "@/lib/api-response";
import { invalidatePublicCategories } from "@/lib/cache-invalidation";
import { requirePermission } from "@/lib/admin-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("categories.update");
    if (auth.error) return auth.error;

    const { id } = await params;
    const { name, nameNp, slug, description, descriptionNp, order, isActive } = await request.json();

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
        ...(descriptionNp !== undefined && {
          descriptionNp: descriptionNp ? descriptionNp.trim() : null,
        }),
        ...(typeof order === "number" && { order }),
        ...(typeof isActive === "boolean" && { isActive }),
      },
    });

    invalidatePublicCategories();

    return apiSuccess(updatedCategory, "Category updated successfully");
  } catch (error) {
    return handleServerError(error, "Failed to update category");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requirePermission("categories.delete");
    if (auth.error) return auth.error;

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
