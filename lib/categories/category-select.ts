import { db } from "@/db";
import { categories, expenses } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";

export type CategoryWithExpenseCount = Awaited<
  ReturnType<typeof getAllCategoriesWithExpenseCount>
>[number];

export async function getAllCategories() {
  const categoryData = await db
    .select()
    .from(categories)
    .orderBy(desc(categories.createdAt));

  return categoryData;
}

export async function getAllCategoriesWithExpenseCount() {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
      expenseCount: count(expenses.id),
    })
    .from(categories)
    .leftJoin(expenses, eq(expenses.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(desc(categories.createdAt));
  return result;
}
