import { db } from "@/db";
import { categories, expenses } from "@/db/schema";
import { desc, eq, and, gte, SQL } from "drizzle-orm";
import { connection } from "next/server";

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
  organizationId: expenses.organizationId,
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
