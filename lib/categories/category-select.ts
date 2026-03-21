import { db } from "@/db";
import { categories } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function getAllCategories() {
  const categoryData = await db
    .select()
    .from(categories)
    .orderBy(desc(categories.createdAt));

  return categoryData;
}
