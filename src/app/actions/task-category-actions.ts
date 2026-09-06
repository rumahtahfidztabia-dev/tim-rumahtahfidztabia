"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOpsTaskCategories() {
  try {
    const categories = await prisma.opsTaskCategory.findMany({
      orderBy: { createdAt: "asc" },
    });
    return categories;
  } catch (error) {
    console.error("Failed to fetch task categories:", error);
    return [];
  }
}

export async function createOpsTaskCategory(data: { name: string; color?: string }) {
  try {
    const category = await prisma.opsTaskCategory.create({
      data: {
        name: data.name,
        color: data.color,
      },
    });
    revalidatePath("/(ops)/tasks");
    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateOpsTaskCategory(
  id: string,
  data: { name: string; color?: string }
) {
  try {
    const category = await prisma.opsTaskCategory.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
      },
    });
    revalidatePath("/(ops)/tasks");
    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteOpsTaskCategory(id: string) {
  try {
    // Optionally check if it's used
    const count = await prisma.task.count({
      where: { opsTaskCategoryId: id },
    });
    if (count > 0) {
      return { success: false, error: "Kategori ini masih digunakan oleh task." };
    }

    await prisma.opsTaskCategory.delete({
      where: { id },
    });
    revalidatePath("/(ops)/tasks");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
