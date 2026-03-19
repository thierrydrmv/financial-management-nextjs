import { db } from "@/db";
import { categories, expenses } from "@/db/schema";
import { desc, eq, and, gte } from "drizzle-orm";
import { connection } from "next/server";

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

  return await db
    .select()
    .from(expenses)
    .where(
      and(eq(expenses.userId, userId), gte(expenses.expenseDate, yesterday)),
    )
    .orderBy(desc(expenses.expenseDate));
}

export async function getLastWeekExpensesByUser(userId: string) {
  await connection(); // get data on runtime
  // Everything below will be excluded from prerendering
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return await db
    .select()
    .from(expenses)
    .where(
      and(eq(expenses.userId, userId), gte(expenses.expenseDate, oneWeekAgo)),
    )
    .orderBy(desc(expenses.expenseDate));
}

export async function getLastMonthExpensesByUser(userId: string) {
  await connection(); // get data on runtime
  // Everything below will be excluded from prerendering
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return await db
    .select()
    .from(expenses)
    .where(
      and(eq(expenses.userId, userId), gte(expenses.expenseDate, oneMonthAgo)),
    )
    .orderBy(desc(expenses.expenseDate));
}

export async function getAllExpensesWithCategoryByUser(userId: string) {
  await connection();

  const result = await db
    .select({
      // campos de expense
      id: expenses.id,
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

      // categoria como objeto
      category: {
        id: categories.id,
        name: categories.name,
        createdAt: categories.createdAt,
      },
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.expenseDate));

  return result;
}

export async function getExpenseByIdAndUser(id: number, userId: string) {
  await connection();
  const result = await db
    .select({
      // campos de expense
      id: expenses.id,
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
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  return result[0] ?? null;
}
