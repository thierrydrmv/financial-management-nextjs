import type { CategoryWithExpenseCount } from "@/lib/categories/category-select";
import type { SerializedExpenseWithCategory } from "@/lib/dashboard/serialize-expenses";
import { serializeExpensesForClient } from "@/lib/dashboard/serialize-expenses";
import { EXPENSE_LIST_PAGE_SIZE } from "@/lib/expenses/expense-list-constants";
import type { ExpenseListFilters } from "@/lib/expenses/expense-select";
import type { ExpenseWithCategory } from "@/types";

/**
 * Demo dataset: **EU middle-class household (two partners)**, amounts in **EUR** (see `formatCurrency` default).
 * Timeline: **monthly from Jan 2025 → current month** (calendar days; rows on or after “tomorrow” are omitted).
 * Category counts come from `getPreviewCategoriesWithCount()`.
 */
const PREVIEW_CATEGORY_ANCHOR_YEAR = 2025;

function lastDayOfMonth(year: number, monthIndex0: number): number {
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

/** Calendar day in month, clamped to month length (e.g. Feb 28/29). */
function dateAtNoon(year: number, monthIndex0: number, day: number): Date {
  const d = Math.min(day, lastDayOfMonth(year, monthIndex0));
  return new Date(year, monthIndex0, d, 12, 0, 0, 0);
}

/** Skip dates strictly after “now” (demo never shows future days). */
function onOrBeforeToday(d: Date, cutoff: Date): boolean {
  return d.getTime() <= cutoff.getTime();
}

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
    createdAt: p.createdAt ?? new Date(PREVIEW_CATEGORY_ANCHOR_YEAR, 0, 1),
    submittedBy: p.submittedBy ?? "couple.preview@demo.eu",
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

type CatKey = 1 | 2 | 3 | 4 | 5;

/** Deterministic small variance (±€spread) from year-month seed for believable amounts. */
function euroJitter(
  year: number,
  monthIndex0: number,
  salt: number,
  baseCents: number,
  spreadCents: number,
): string {
  const seed = (year * 12 + monthIndex0 + salt) * 1103515245;
  const j = (seed >>> 0) % (spreadCents * 2 + 1);
  const cents = Math.max(0, baseCents + j - spreadCents);
  return (cents / 100).toFixed(2);
}

function buildMonthlyMockExpenses(
  catById: Record<CatKey, NonNullable<ExpenseWithCategory["category"]>>,
): ExpenseWithCategory[] {
  const cutoff = new Date();
  cutoff.setHours(23, 59, 59, 999);

  const startYear = PREVIEW_CATEGORY_ANCHOR_YEAR;
  const startMonth = 0;
  const endY = cutoff.getFullYear();
  const endM = cutoff.getMonth();

  let nextId = 9001;
  const out: ExpenseWithCategory[] = [];

  const push = (
    p: Pick<
      ExpenseWithCategory,
      "type" | "title" | "amount" | "expenseDate"
    > & {
      categoryId: number | null;
      category?: ExpenseWithCategory["category"];
      isRecurring?: boolean;
      description?: string | null;
    },
  ) => {
    out.push(
      mockExpense({
        id: nextId++,
        type: p.type,
        title: p.title,
        amount: p.amount,
        expenseDate: p.expenseDate,
        categoryId: p.categoryId,
        category: p.category ?? undefined,
        isRecurring: p.isRecurring,
        description: p.description ?? null,
      }),
    );
  };

  for (let y = startYear; y <= endY; y++) {
    const m0 = y === startYear ? startMonth : 0;
    const m1 = y === endY ? endM : 11;
    for (let m = m0; m <= m1; m++) {
      const monthSeed = y * 12 + m;

      const pushDay = (
        day: number,
        args: Omit<Parameters<typeof push>[0], "expenseDate"> & {
          expenseDate?: never;
        },
      ) => {
        const expenseDate = dateAtNoon(y, m, day);
        if (!onOrBeforeToday(expenseDate, cutoff)) return;
        push({ ...args, expenseDate });
      };

      // Recurring monthly: salaries (typical paydays)
      pushDay(25, {
        type: "income",
        title: "Salary — Partner A (engineering)",
        amount: "3180.00",
        categoryId: null,
        category: null,
        description: "Net — household primary earner",
      });
      pushDay(26, {
        type: "income",
        title: "Salary — Partner B (public sector)",
        amount: "2840.00",
        categoryId: null,
        category: null,
        description: "Net — stable schedule",
      });

      pushDay(1, {
        type: "expense",
        title: "Rent — two-bedroom flat",
        amount: "1180.00",
        categoryId: 3,
        category: catById[3],
        isRecurring: true,
        description: "City centre — couple household",
      });
      pushDay(2, {
        type: "expense",
        title: "Monthly public transport pass",
        amount: "49.00",
        categoryId: 2,
        category: catById[2],
        isRecurring: true,
      });
      pushDay(4, {
        type: "expense",
        title: "Electricity & heating",
        amount: euroJitter(y, m, 1, 16800, 1800),
        categoryId: 3,
        category: catById[3],
        isRecurring: true,
      });
      pushDay(5, {
        type: "expense",
        title: "Fibre internet",
        amount: "39.90",
        categoryId: 3,
        category: catById[3],
        isRecurring: true,
      });
      pushDay(8, {
        type: "expense",
        title: "Streaming subscriptions",
        amount: "14.99",
        categoryId: 4,
        category: catById[4],
        isRecurring: true,
      });
      pushDay(9, {
        type: "expense",
        title: "Gym — couple plan",
        amount: "52.00",
        categoryId: 5,
        category: catById[5],
        isRecurring: true,
      });
      pushDay(11, {
        type: "expense",
        title: "Water & waste",
        amount: "38.00",
        categoryId: 3,
        category: catById[3],
        isRecurring: true,
      });
      pushDay(12, {
        type: "expense",
        title: "Music subscription",
        amount: "10.99",
        categoryId: 4,
        category: catById[4],
        isRecurring: true,
      });

      // Weekly-ish groceries (four passes; days avoid other fixed items e.g. day 20)
      const gBase = [9840, 9120, 10150, 8890];
      const gDays = [5, 12, 19, 26];
      for (let w = 0; w < 4; w++) {
        pushDay(gDays[w]!, {
          type: "expense",
          title: `Groceries — week ${w + 1}`,
          amount: euroJitter(y, m, 10 + w, gBase[w]!, 900),
          categoryId: 1,
          category: catById[1],
        });
      }

      pushDay(16, {
        type: "expense",
        title: "Fuel — car",
        amount: euroJitter(y, m, 20, 7150, 1200),
        categoryId: 2,
        category: catById[2],
      });
      pushDay(18, {
        type: "expense",
        title: "Bistro — dinner out",
        amount: euroJitter(y, m, 21, 6200, 1500),
        categoryId: 1,
        category: catById[1],
      });
      pushDay(20, {
        type: "expense",
        title: "Pharmacy — essentials",
        amount: euroJitter(y, m, 22, 2460, 800),
        categoryId: 5,
        category: catById[5],
      });
      pushDay(22, {
        type: "expense",
        title: "Bakery & coffee",
        amount: euroJitter(y, m, 23, 1780, 500),
        categoryId: 1,
        category: catById[1],
      });

      // Quarterly: building fee + contents (same calendar quarter)
      if (m % 3 === 0) {
        pushDay(14, {
          type: "expense",
          title: "Building maintenance fee",
          amount: "55.00",
          categoryId: 3,
          category: catById[3],
        });
        pushDay(17, {
          type: "expense",
          title: "Contents insurance",
          amount: "42.00",
          categoryId: 3,
          category: catById[3],
          isRecurring: true,
        });
      }

      // Rotating extras (one per month, cycle through titles)
      const extras: {
        title: string;
        amount: string;
        cat: CatKey;
        day: number;
      }[] = [
        { title: "Cinema — two tickets", amount: "28.00", cat: 4, day: 19 },
        {
          title: "Regional train — day trip",
          amount: "118.00",
          cat: 2,
          day: 23,
        },
        { title: "Bookshop", amount: "36.00", cat: 4, day: 24 },
        { title: "Farmers’ market", amount: "41.20", cat: 1, day: 21 },
        { title: "Parking — city day", amount: "12.00", cat: 2, day: 27 },
        { title: "Concert tickets", amount: "96.00", cat: 4, day: 28 },
      ];
      const ex = extras[monthSeed % extras.length]!;
      pushDay(ex.day, {
        type: "expense",
        title: ex.title,
        amount: ex.amount,
        categoryId: ex.cat,
        category: catById[ex.cat],
      });

      // Annual: tax refund (April), year-end bonus (December)
      if (m === 3) {
        pushDay(10, {
          type: "income",
          title: "Tax refund — joint declaration",
          amount: "640.00",
          categoryId: null,
          category: null,
          description: "Annual adjustment",
        });
      }
      if (m === 11) {
        pushDay(15, {
          type: "income",
          title: "Year-end bonus — Partner A",
          amount: "1800.00",
          categoryId: null,
          category: null,
          description: "Employer discretionary",
        });
      }

      // Bi-annual health / fun (deterministic by month)
      if (monthSeed % 6 === 2) {
        pushDay(29, {
          type: "expense",
          title: "Dental check-up",
          amount: "88.00",
          categoryId: 5,
          category: catById[5],
        });
      }
      if (monthSeed % 8 === 5) {
        pushDay(30, {
          type: "expense",
          title: "Mini-break — hotel",
          amount: "215.00",
          categoryId: 4,
          category: catById[4],
        });
      }
    }
  }

  out.sort(
    (a, b) =>
      new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime(),
  );
  return out;
}

export function buildMockExpenses(): ExpenseWithCategory[] {
  const y = PREVIEW_CATEGORY_ANCHOR_YEAR;
  const c = {
    food: cat(1, "Food", y),
    transport: cat(2, "Transport", y),
    housing: cat(3, "Housing", y),
    fun: cat(4, "Entertainment", y),
    health: cat(5, "Health", y),
  };

  const catById = {
    1: c.food,
    2: c.transport,
    3: c.housing,
    4: c.fun,
    5: c.health,
  } as const;

  return buildMonthlyMockExpenses(catById);
}

export function getPreviewSerializedExpenses(): SerializedExpenseWithCategory[] {
  return serializeExpensesForClient(buildMockExpenses());
}

const previewCategoryCreatedAt = new Date(PREVIEW_CATEGORY_ANCHOR_YEAR, 0, 1);

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

/**
 * Applies the same rules as `buildExpenseListWhere` + `desc(expenseDate)` on mock rows.
 */
export function filterMockExpensesList(
  filters: ExpenseListFilters,
): ExpenseWithCategory[] {
  let rows = buildMockExpenses();

  if (filters.type !== "all") {
    rows = rows.filter((e) => e.type === filters.type);
  }
  if (filters.categoryName) {
    rows = rows.filter((e) => e.category?.name === filters.categoryName);
  }
  const q = filters.search.trim();
  if (q.length > 0) {
    const ql = q.toLowerCase();
    rows = rows.filter((e) => e.title.toLowerCase().includes(ql));
  }

  rows.sort((a, b) => {
    const ta = new Date(a.expenseDate).getTime();
    const tb = new Date(b.expenseDate).getTime();
    return tb - ta;
  });

  return rows;
}

/** Paginated demo list for signed-out `/expenses` (URL filters + `page` match the signed-in path). */
export function getPreviewExpensesPaginated(
  filters: ExpenseListFilters,
  pageFromUrl: number,
  pageSize: number = EXPENSE_LIST_PAGE_SIZE,
): {
  expenses: ExpenseWithCategory[];
  totalCount: number;
  page: number;
} {
  const filtered = filterMockExpensesList(filters);
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(Math.max(1, pageFromUrl), totalPages);
  const offset = (page - 1) * pageSize;
  const expenses = filtered.slice(offset, offset + pageSize);
  return { expenses, totalCount, page };
}

/** Category expense counts derived from `buildMockExpenses()` (stays in sync when rows change). */
export function getPreviewCategoriesWithCount(): CategoryWithExpenseCount[] {
  const byId = new Map<number, number>();
  for (const row of buildMockExpenses()) {
    if (row.type !== "expense" || row.categoryId == null) continue;
    byId.set(row.categoryId, (byId.get(row.categoryId) ?? 0) + 1);
  }
  return PREVIEW_FILTER_CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    createdAt: previewCategoryCreatedAt,
    expenseCount: byId.get(c.id) ?? 0,
  }));
}

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
    transactions: all.length.toLocaleString("de-DE"),
    categories: PREVIEW_FILTER_CATEGORIES.length.toLocaleString("de-DE"),
    expensesLogged: expenseRows.length.toLocaleString("de-DE"),
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

function expensePoolSortedByDateDesc(): ExpenseWithCategory[] {
  return expenseOnlyMock().sort(
    (a, b) =>
      new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime(),
  );
}

/**
 * Signed-out home: demo cards for “recent” spending. Dates are anchored to **today**
 * so the list is never empty (static mock years alone would miss rolling windows).
 */
export function getLandingPreviewTodayExpenses(): ExpenseWithCategory[] {
  const pool = expensePoolSortedByDateDesc();
  const picks = [pool[0], pool[1], pool[2]].filter(Boolean);
  const base = new Date();
  return picks.map((e, i) => withExpenseDate(e, addDays(base, -i)));
}

/** Last 7 days — 5 sample rows. */
export function getLandingPreviewWeekExpenses(): ExpenseWithCategory[] {
  const pool = expensePoolSortedByDateDesc();
  const daysAgo = [0, 1, 2, 3, 5];
  const picks = [pool[0], pool[1], pool[2], pool[3], pool[4]].filter(Boolean);
  const base = new Date();
  return picks.map((e, i) => withExpenseDate(e, addDays(base, -daysAgo[i]!)));
}

/** Last ~30 days — 8 sample rows. */
export function getLandingPreviewMonthExpenses(): ExpenseWithCategory[] {
  const pool = expensePoolSortedByDateDesc();
  const daysAgo = [0, 3, 6, 9, 12, 16, 22, 28];
  const picks = pool.slice(0, 8);
  const base = new Date();
  return picks.map((e, i) => withExpenseDate(e, addDays(base, -daysAgo[i]!)));
}

/** Signed-out expense detail/edit: resolve a row from `buildMockExpenses()` by id. */
export function getPreviewExpenseById(id: number): ExpenseWithCategory | null {
  return buildMockExpenses().find((e) => e.id === id) ?? null;
}
