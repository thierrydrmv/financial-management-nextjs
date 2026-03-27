import type { ExpenseWithCategory } from "@/types";

/** JSON-safe shape for passing expenses from server layout to client provider. */
export type SerializedExpenseWithCategory = {
  id: number;
  type: "income" | "expense";
  title: string;
  description: string | null;
  amount: string;
  categoryId: number | null;
  expenseDate: string;
  paymentMethod: string | null;
  isRecurring: boolean | null;
  createdAt: string | null;
  submittedBy: string | null;
  userId: string | null;
  organizationId: string | null;
  category?: {
    id: number;
    name: string;
    createdAt: string | null;
  } | null;
};

export function serializeExpensesForClient(
  rows: ExpenseWithCategory[],
): SerializedExpenseWithCategory[] {
  return rows.map((exp) => ({
    id: exp.id,
    type: exp.type,
    title: exp.title,
    description: exp.description,
    amount: String(exp.amount),
    categoryId: exp.categoryId,
    expenseDate:
      exp.expenseDate instanceof Date
        ? exp.expenseDate.toISOString()
        : String(exp.expenseDate),
    paymentMethod: exp.paymentMethod,
    isRecurring: exp.isRecurring,
    createdAt:
      exp.createdAt instanceof Date
        ? exp.createdAt.toISOString()
        : exp.createdAt
          ? String(exp.createdAt)
          : null,
    submittedBy: exp.submittedBy,
    userId: exp.userId,
    organizationId: exp.organizationId,
    category: exp.category
      ? {
          id: exp.category.id,
          name: exp.category.name,
          createdAt:
            exp.category.createdAt instanceof Date
              ? exp.category.createdAt.toISOString()
              : exp.category.createdAt
                ? String(exp.category.createdAt)
                : null,
        }
      : null,
  }));
}

export function deserializeExpensesClient(
  rows: SerializedExpenseWithCategory[],
): ExpenseWithCategory[] {
  return rows.map((exp) => ({
    id: exp.id,
    type: exp.type,
    title: exp.title,
    description: exp.description,
    amount: exp.amount,
    categoryId: exp.categoryId,
    expenseDate: new Date(exp.expenseDate),
    paymentMethod: exp.paymentMethod,
    isRecurring: exp.isRecurring,
    createdAt: exp.createdAt ? new Date(exp.createdAt) : null,
    submittedBy: exp.submittedBy,
    userId: exp.userId,
    organizationId: exp.organizationId,
    category: exp.category
      ? {
          id: exp.category.id,
          name: exp.category.name,
          createdAt: exp.category.createdAt
            ? new Date(exp.category.createdAt)
            : null,
        }
      : null,
  }));
}
