import { db } from "@/db";
import { categories } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function getAllCategories() {
  "use cache";
  const categoryData = await db
    .select()
    .from(categories)
    .orderBy(desc(categories.createdAt));

  return categoryData;
}

export async function getCategoryById(id: number) {
  const allCategories = await getAllCategories();
  return allCategories.filter((category) => category.id === id);
}
