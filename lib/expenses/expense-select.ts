import { db } from "@/db";
import { expenses } from "@/db/schema";
import { desc } from "drizzle-orm";
import { connection } from "next/server";

export async function getFeaturedexpenses() {
  "use cache";
  const expensesData = await db
    .select()
    .from(expenses)
    .orderBy(desc(expenses.createdAt));

  return expensesData;
}

export async function getAllExpenses() {
  "use cache";
  const expensesData = await db
    .select()
    .from(expenses)
    .orderBy(desc(expenses.createdAt));

  return expensesData;
}

export async function getTodayExpenses() {
  await connection(); // get data on runtime
  // Everything below will be excluded from prerendering
  const expensesData = await getAllExpenses();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return expensesData.filter(
    (expense) =>
      expense.createdAt &&
      new Date(expense.createdAt.toISOString()) >= yesterday,
  );
}

export async function getLastWeekExpenses() {
  await connection(); // get data on runtime
  // Everything below will be excluded from prerendering
  const expensesData = await getAllExpenses();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return expensesData.filter(
    (expense) =>
      expense.createdAt &&
      new Date(expense.createdAt.toISOString()) >= oneWeekAgo,
  );
}

export async function getLastMonthExpenses() {
  await connection(); // get data on runtime
  // Everything below will be excluded from prerendering
  const expensesData = await getAllExpenses();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return expensesData.filter(
    (expense) =>
      expense.createdAt &&
      new Date(expense.createdAt.toISOString()) >= oneMonthAgo,
  );
}
