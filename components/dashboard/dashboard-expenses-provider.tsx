"use client";

import {
  deserializeExpensesClient,
  type SerializedExpenseWithCategory,
} from "@/lib/dashboard/serialize-expenses";
import type { ExpenseWithCategory } from "@/types";
import { createContext, useContext, useMemo, type ReactNode } from "react";

const DashboardExpensesContext = createContext<ExpenseWithCategory[] | null>(
  null,
);

export function DashboardExpensesProvider({
  initialSerialized,
  children,
}: {
  initialSerialized: SerializedExpenseWithCategory[];
  children: ReactNode;
}) {
  const expenses = useMemo(
    () => deserializeExpensesClient(initialSerialized),
    [initialSerialized],
  );

  return (
    <DashboardExpensesContext.Provider value={expenses}>
      {children}
    </DashboardExpensesContext.Provider>
  );
}

export function useDashboardExpenses(): ExpenseWithCategory[] {
  const ctx = useContext(DashboardExpensesContext);
  if (!ctx) {
    throw new Error("useDashboardExpenses must be used within DashboardLayout");
  }
  return ctx;
}
