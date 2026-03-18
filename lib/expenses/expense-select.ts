import { db } from "@/db";
import { categories, expenses } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { connection } from "next/server";

export async function getAllExpenses() {
  "use cache";
  const expensesData = await db
    .select()
    .from(expenses)
    .orderBy(desc(expenses.expenseDate));

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
      expense.expenseDate &&
      new Date(expense.expenseDate.toISOString()) >= yesterday,
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
      expense.expenseDate &&
      new Date(expense.expenseDate.toISOString()) >= oneWeekAgo,
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
      expense.expenseDate &&
      new Date(expense.expenseDate.toISOString()) >= oneMonthAgo,
  );
}

export async function getAllExpensesWithCategory() {
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
    .orderBy(desc(expenses.expenseDate));

  return result;
}
