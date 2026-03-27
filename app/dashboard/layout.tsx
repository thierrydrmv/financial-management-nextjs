import { DashboardExpensesProvider } from "@/components/dashboard/dashboard-expenses-provider";
import { getAllExpensesWithCategoryByUser } from "@/lib/expenses/expense-select";
import { serializeExpensesForClient } from "@/lib/dashboard/serialize-expenses";
import { auth } from "@clerk/nextjs/server";
import type { ReactNode } from "react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) redirectToSignIn();
  const userIdSafe = userId as string;

  const expenses = await getAllExpensesWithCategoryByUser(userIdSafe);
  const initialSerialized = serializeExpensesForClient(expenses);

  return (
    <DashboardExpensesProvider initialSerialized={initialSerialized}>
      {children}
    </DashboardExpensesProvider>
  );
}
