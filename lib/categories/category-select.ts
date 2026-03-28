import { db } from "@/db";
import { categories, expenses } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";

export type CategoryWithExpenseCount = Awaited<
  ReturnType<typeof getAllCategoriesWithExpenseCount>
>[number];

/** Lists categories owned by `userId`. */
export async function getAllCategories(userId: string) {
  const categoryData = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, userId))
    .orderBy(desc(categories.createdAt));

  return categoryData;
}

export async function getAllCategoriesWithExpenseCount(userId: string) {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
      expenseCount: count(expenses.id),
    })
    .from(categories)
    .leftJoin(expenses, eq(expenses.categoryId, categories.id))
    .where(eq(categories.userId, userId))
    .groupBy(categories.id)
    .orderBy(desc(categories.createdAt));
  return result;
}
