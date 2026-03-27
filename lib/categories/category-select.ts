import { db } from "@/db";
import { categories, expenses } from "@/db/schema";
import { count, desc, eq } from "drizzle-orm";

export type CategoryWithExpenseCount = Awaited<
  ReturnType<typeof getAllCategoriesWithExpenseCount>
>[number];

/**
 * Lists categories for the current scope.
 * When `organizationId` is set (user is in an org), returns all categories for that organization.
 * Otherwise returns categories owned by `userId` (personal / legacy rows).
 */
export async function getAllCategories(
  userId: string,
  organizationId: string | null,
) {
  const categoryData = await db
    .select()
    .from(categories)
    .where(
      organizationId
        ? eq(categories.organizationId, organizationId)
        : eq(categories.userId, userId),
    )
    .orderBy(desc(categories.createdAt));

  return categoryData;
}

export async function getAllCategoriesWithExpenseCount(
  userId: string,
  organizationId: string | null,
) {
  const result = await db
    .select({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
      expenseCount: count(expenses.id),
    })
    .from(categories)
    .leftJoin(expenses, eq(expenses.categoryId, categories.id))
    .where(
      organizationId
        ? eq(categories.organizationId, organizationId)
        : eq(categories.userId, userId),
    )
    .groupBy(categories.id)
    .orderBy(desc(categories.createdAt));
  return result;
}
