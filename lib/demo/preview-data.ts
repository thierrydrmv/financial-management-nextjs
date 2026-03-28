import type { CategoryWithExpenseCount } from "@/lib/categories/category-select";
import type { SerializedExpenseWithCategory } from "@/lib/dashboard/serialize-expenses";
import { serializeExpensesForClient } from "@/lib/dashboard/serialize-expenses";
import { EXPENSE_LIST_PAGE_SIZE } from "@/lib/expenses/expense-list-constants";
import type { ExpenseListFilters } from "@/lib/expenses/expense-select";
import type { ExpenseWithCategory } from "@/types";

/**
 * Deterministic demo dataset for signed-out preview (dashboard, expenses list, categories).
 * Invariants checked against dashboard math (current calendar year `y`):
 * - March: income $450 (Freelance) − expenses $32.10 (Pharmacy) ⇒ monthly balance $417.90.
 * - Category counts match `buildMockExpenses()` (Food 4, Transport 3, Housing 5, Entertainment 4, Health 2).
 * - Housing is spread across the year (rent, utilities, supplies, internet, insurance); March has no housing row so the March balance invariant stays true.
 * - `getLandingHeroPreviewStats()` matches the same dataset for the signed-out home hero.
 * - `getLandingPreview*Expenses()` remap demo rows onto rolling dates for the signed-out home sections.
 */
const demoYear = () => new Date().getFullYear();

function cat(
  id: number,
  name: string,
  year: number,
): NonNullable<ExpenseWithCategory["category"]> {
  return { id, name, createdAt: new Date(year, 0, 1) };
}

function mockExpense(
  p: Pick<
    ExpenseWithCategory,
    "id" | "type" | "title" | "amount" | "expenseDate"
  > &
    Partial<
      Omit<
        ExpenseWithCategory,
        "id" | "type" | "title" | "amount" | "expenseDate"
      >
    >,
): ExpenseWithCategory {
  return {
    description: p.description ?? null,
    paymentMethod: p.paymentMethod ?? "credit-card",
    isRecurring: p.isRecurring ?? false,
    createdAt: p.createdAt ?? new Date(demoYear(), 0, 1),
    submittedBy: p.submittedBy ?? "demo@preview.local",
    userId: p.userId ?? null,
    categoryId: p.categoryId ?? null,
    category: p.category ?? undefined,
    id: p.id,
    type: p.type,
    title: p.title,
    amount: p.amount,
    expenseDate: p.expenseDate,
  };
}

/** Sample rows for dashboard charts and list preview (not persisted). */
export function buildMockExpenses(): ExpenseWithCategory[] {
  const y = demoYear();
  const c = {
    food: cat(1, "Food", y),
    transport: cat(2, "Transport", y),
    housing: cat(3, "Housing", y),
    fun: cat(4, "Entertainment", y),
    health: cat(5, "Health", y),
  };

  return [
    mockExpense({
      id: 9001,
      type: "income",
      title: "Salary",
      amount: "5200.00",
      categoryId: null,
      category: null,
      expenseDate: new Date(y, 0, 1),
      description: "Demo income",
      isRecurring: true,
    }),
    mockExpense({
      id: 9002,
      type: "expense",
      title: "Rent",
      amount: "1650.00",
      categoryId: 3,
      category: c.housing,
      expenseDate: new Date(y, 0, 3),
      isRecurring: true,
    }),
    mockExpense({
      id: 9003,
      type: "expense",
      title: "Groceries",
      amount: "142.35",
      categoryId: 1,
      category: c.food,
      expenseDate: new Date(y, 0, 8),
    }),
    mockExpense({
      id: 9004,
      type: "expense",
      title: "Transit pass",
      amount: "89.00",
      categoryId: 2,
      category: c.transport,
      expenseDate: new Date(y, 0, 10),
    }),
    mockExpense({
      id: 9009,
      type: "expense",
      title: "Utilities",
      amount: "120.00",
      categoryId: 3,
      category: c.housing,
      expenseDate: new Date(y, 1, 5),
      isRecurring: true,
    }),
    mockExpense({
      id: 9005,
      type: "expense",
      title: "Dinner out",
      amount: "68.40",
      categoryId: 1,
      category: c.food,
      expenseDate: new Date(y, 1, 14),
    }),
    mockExpense({
      id: 9006,
      type: "expense",
      title: "Streaming",
      amount: "15.99",
      categoryId: 4,
      category: c.fun,
      expenseDate: new Date(y, 1, 20),
      isRecurring: true,
    }),
    mockExpense({
      id: 9007,
      type: "income",
      title: "Freelance",
      amount: "450.00",
      categoryId: null,
      category: null,
      expenseDate: new Date(y, 2, 5),
    }),
    mockExpense({
      id: 9008,
      type: "expense",
      title: "Pharmacy",
      amount: "32.10",
      categoryId: 5,
      category: c.health,
      expenseDate: new Date(y, 2, 12),
    }),
    mockExpense({
      id: 9014,
      type: "expense",
      title: "Home supplies",
      amount: "78.20",
      categoryId: 3,
      category: c.housing,
      expenseDate: new Date(y, 4, 14),
    }),
    mockExpense({
      id: 9010,
      type: "expense",
      title: "Weekend trip",
      amount: "310.00",
      categoryId: 4,
      category: c.fun,
      expenseDate: new Date(y, 4, 18),
    }),
    mockExpense({
      id: 9011,
      type: "expense",
      title: "Fuel",
      amount: "55.00",
      categoryId: 2,
      category: c.transport,
      expenseDate: new Date(y, 5, 7),
    }),
    mockExpense({
      id: 9012,
      type: "expense",
      title: "Coffee & lunch",
      amount: "24.50",
      categoryId: 1,
      category: c.food,
      expenseDate: new Date(y, 6, 1),
    }),
    mockExpense({
      id: 9013,
      type: "expense",
      title: "Gym",
      amount: "49.99",
      categoryId: 5,
      category: c.health,
      expenseDate: new Date(y, 6, 1),
      isRecurring: true,
    }),
    mockExpense({
      id: 9020,
      type: "expense",
      title: "Internet",
      amount: "59.99",
      categoryId: 3,
      category: c.housing,
      expenseDate: new Date(y, 7, 12),
      isRecurring: true,
    }),
    mockExpense({
      id: 9015,
      type: "expense",
      title: "Books",
      amount: "42.00",
      categoryId: 4,
      category: c.fun,
      expenseDate: new Date(y, 8, 3),
    }),
    mockExpense({
      id: 9021,
      type: "expense",
      title: "Renters insurance",
      amount: "95.00",
      categoryId: 3,
      category: c.housing,
      expenseDate: new Date(y, 9, 3),
    }),
    mockExpense({
      id: 9016,
      type: "expense",
      title: "Train tickets",
      amount: "36.00",
      categoryId: 2,
      category: c.transport,
      expenseDate: new Date(y, 9, 11),
    }),
    mockExpense({
      id: 9017,
      type: "expense",
      title: "Holiday gifts",
      amount: "210.00",
      categoryId: 4,
      category: c.fun,
      expenseDate: new Date(y, 10, 25),
    }),
    mockExpense({
      id: 9018,
      type: "expense",
      title: "Market haul",
      amount: "95.00",
      categoryId: 1,
      category: c.food,
      expenseDate: new Date(y, 11, 5),
    }),
    mockExpense({
      id: 9019,
      type: "income",
      title: "Year-end bonus",
      amount: "800.00",
      categoryId: null,
      category: null,
      expenseDate: new Date(y, 11, 15),
    }),
  ];
}

export function getPreviewSerializedExpenses(): SerializedExpenseWithCategory[] {
  return serializeExpensesForClient(buildMockExpenses());
}

export const PREVIEW_EXPENSE_FILTERS: ExpenseListFilters = {
  type: "all",
  search: "",
  categoryName: null,
};

const previewCategoryCreatedAt = new Date(demoYear(), 0, 1);

export const PREVIEW_FILTER_CATEGORIES: {
  id: number;
  name: string;
  createdAt: Date | null;
}[] = [
  { id: 1, name: "Food", createdAt: previewCategoryCreatedAt },
  { id: 2, name: "Transport", createdAt: previewCategoryCreatedAt },
  { id: 3, name: "Housing", createdAt: previewCategoryCreatedAt },
  { id: 4, name: "Entertainment", createdAt: previewCategoryCreatedAt },
  { id: 5, name: "Health", createdAt: previewCategoryCreatedAt },
];

export function getPreviewExpensesPageSlice(): {
  expenses: ExpenseWithCategory[];
  totalCount: number;
} {
  const all = buildMockExpenses();
  const totalCount = all.length;
  const expenses = all.slice(0, EXPENSE_LIST_PAGE_SIZE);
  return { expenses, totalCount };
}

export const PREVIEW_CATEGORIES_WITH_COUNT: CategoryWithExpenseCount[] = [
  { id: 1, name: "Food", createdAt: previewCategoryCreatedAt, expenseCount: 4 },
  {
    id: 2,
    name: "Transport",
    createdAt: previewCategoryCreatedAt,
    expenseCount: 3,
  },
  {
    id: 3,
    name: "Housing",
    createdAt: previewCategoryCreatedAt,
    expenseCount: 5,
  },
  {
    id: 4,
    name: "Entertainment",
    createdAt: previewCategoryCreatedAt,
    expenseCount: 4,
  },
  {
    id: 5,
    name: "Health",
    createdAt: previewCategoryCreatedAt,
    expenseCount: 2,
  },
];

/** Formatted counts for the signed-out landing hero (aligned with `buildMockExpenses()`). */
export type LandingHeroPreviewStats = {
  transactions: string;
  categories: string;
  expensesLogged: string;
};

export function getLandingHeroPreviewStats(): LandingHeroPreviewStats {
  const all = buildMockExpenses();
  const expenseRows = all.filter((e) => e.type === "expense");
  return {
    transactions: all.length.toLocaleString("en-US"),
    categories: PREVIEW_FILTER_CATEGORIES.length.toLocaleString("en-US"),
    expensesLogged: expenseRows.length.toLocaleString("en-US"),
  };
}

function expenseOnlyMock(): ExpenseWithCategory[] {
  return buildMockExpenses().filter((e) => e.type === "expense");
}

function addDays(base: Date, deltaDays: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + deltaDays);
  return d;
}

function withExpenseDate(
  e: ExpenseWithCategory,
  expenseDate: Date,
): ExpenseWithCategory {
  return { ...e, expenseDate };
}

/**
 * Signed-out home: demo cards for “recent” spending. Dates are anchored to **today**
 * so the list is never empty (static mock years alone would miss rolling windows).
 */
export function getLandingPreviewTodayExpenses(): ExpenseWithCategory[] {
  const pool = expenseOnlyMock();
  const picks = [pool[1], pool[2], pool[4]]; // Groceries, Transit pass, Streaming
  const base = new Date();
  return picks.map((e, i) => withExpenseDate(e, addDays(base, -i)));
}

/** Last 7 days — 5 sample rows. */
export function getLandingPreviewWeekExpenses(): ExpenseWithCategory[] {
  const pool = expenseOnlyMock();
  const daysAgo = [0, 1, 2, 3, 5];
  const pickIdx = [1, 2, 3, 4, 6];
  const base = new Date();
  return pickIdx.map((idx, i) =>
    withExpenseDate(pool[idx], addDays(base, -daysAgo[i])),
  );
}

/** Last ~30 days — 8 sample rows. */
export function getLandingPreviewMonthExpenses(): ExpenseWithCategory[] {
  const pool = expenseOnlyMock();
  const daysAgo = [0, 3, 6, 9, 12, 16, 22, 28];
  const pickIdx = [0, 1, 2, 3, 4, 5, 6, 7];
  const base = new Date();
  return pickIdx.map((idx, i) =>
    withExpenseDate(pool[idx], addDays(base, -daysAgo[i])),
  );
}

/** Signed-out expense detail/edit: resolve a row from `buildMockExpenses()` by id. */
export function getPreviewExpenseById(id: number): ExpenseWithCategory | null {
  return buildMockExpenses().find((e) => e.id === id) ?? null;
}
