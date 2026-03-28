import { db } from "@/db";
import { categories, expenses } from "@/db/schema";
import { desc, eq, and, gte, SQL, ilike, count } from "drizzle-orm";
import { connection } from "next/server";
import type { ExpenseWithCategory } from "@/types";
import { EXPENSE_LIST_PAGE_SIZE } from "@/lib/expenses/expense-list-constants";

const expenseWithCategorySelect = {
  id: expenses.id,
  type: expenses.type,
  title: expenses.title,
  description: expenses.description,
  amount: expenses.amount,
  categoryId: expenses.categoryId,
  expenseDate: expenses.expenseDate,
  paymentMethod: expenses.paymentMethod,
  isRecurring: expenses.isRecurring,
  createdAt: expenses.createdAt,
  submittedBy: expenses.submittedBy,
  userId: expenses.userId,
  category: {
    id: categories.id,
    name: categories.name,
    createdAt: categories.createdAt,
  },
} as const;

function expensesWithCategoryQuery(whereClause: SQL) {
  return db
    .select(expenseWithCategorySelect)
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(whereClause);
}

export type ExpenseListFilters = {
  type: "all" | "expense" | "income";
  categoryName: string | null;
  search: string;
};

function buildExpenseListWhere(userId: string, filters: ExpenseListFilters): SQL {
  const parts: SQL[] = [eq(expenses.userId, userId)];

  if (filters.type !== "all") {
    parts.push(eq(expenses.type, filters.type));
  }
  if (filters.categoryName) {
    parts.push(eq(categories.name, filters.categoryName));
  }
  const q = filters.search.trim();
  if (q.length > 0) {
    parts.push(ilike(expenses.title, `%${q}%`));
  }

  return and(...parts) as SQL;
}

/** Distinct categories that appear on the user’s expenses (for filter chips). */
export async function getCategoriesForUserExpenseFilters(userId: string) {
  await connection();

  return await db
    .selectDistinct({
      id: categories.id,
      name: categories.name,
      createdAt: categories.createdAt,
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .where(eq(expenses.userId, userId))
    .orderBy(desc(categories.createdAt));
}

export async function countExpensesWithCategoryForUser(
  userId: string,
  filters: ExpenseListFilters,
): Promise<number> {
  await connection();
  const whereClause = buildExpenseListWhere(userId, filters);

  const [row] = await db
    .select({ count: count(expenses.id) })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(whereClause);

  return Number(row?.count ?? 0);
}

export async function getExpensesWithCategoryByUserPaginated(
  userId: string,
  filters: ExpenseListFilters,
  page: number,
  pageSize: number = EXPENSE_LIST_PAGE_SIZE,
): Promise<ExpenseWithCategory[]> {
  await connection();
  const whereClause = buildExpenseListWhere(userId, filters);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * pageSize;

  return (await expensesWithCategoryQuery(whereClause)
    .orderBy(desc(expenses.expenseDate))
    .limit(pageSize)
    .offset(offset)) as ExpenseWithCategory[];
}

export async function getAllExpensesByUser(userId: string) {
  await connection();

  return await db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.expenseDate));
}

export async function getTodayExpensesByUser(userId: string) {
  await connection(); // get data on runtime
  // Everything below will be excluded from prerendering
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return await expensesWithCategoryQuery(
    and(
      eq(expenses.userId, userId),
      gte(expenses.expenseDate, yesterday),
    ) as SQL,
  ).orderBy(desc(expenses.expenseDate));
}

export async function getLastWeekExpensesByUser(userId: string) {
  await connection(); // get data on runtime
  // Everything below will be excluded from prerendering
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return await expensesWithCategoryQuery(
    and(
      eq(expenses.userId, userId),
      gte(expenses.expenseDate, oneWeekAgo),
    ) as SQL,
  ).orderBy(desc(expenses.expenseDate));
}

export async function getLastMonthExpensesByUser(userId: string) {
  await connection(); // get data on runtime
  // Everything below will be excluded from prerendering
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return await expensesWithCategoryQuery(
    and(
      eq(expenses.userId, userId),
      gte(expenses.expenseDate, oneMonthAgo),
    ) as SQL,
  ).orderBy(desc(expenses.expenseDate));
}

export async function getAllExpensesWithCategoryByUser(userId: string) {
  await connection();

  return await expensesWithCategoryQuery(eq(expenses.userId, userId)).orderBy(
    desc(expenses.expenseDate),
  );
}

export async function getExpenseByIdAndUser(id: number, userId: string) {
  await connection();
  const result = await expensesWithCategoryQuery(
    and(eq(expenses.id, id), eq(expenses.userId, userId)) as SQL,
  );
  return result[0] ?? null;
}
