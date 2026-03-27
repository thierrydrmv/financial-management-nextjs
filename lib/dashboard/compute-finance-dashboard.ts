import { categoryChartCssVarForLabel } from "@/lib/dashboard/category-palette";
import { clampNumber, niceAxisMax } from "@/lib/dashboard/chart-axis";
import type { ExpenseWithCategory } from "@/types";

type NamedTotal = { name: string; total: number };

function donutSegmentsFromTotals(
  totals: Map<string, NamedTotal>,
  maxSegments = 6,
): Array<{ name: string; amount: number; color: string }> {
  const list = Array.from(totals.values())
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);
  if (list.length === 0) return [];

  const head = list.slice(0, maxSegments - 1);
  const tail = list.slice(maxSegments - 1);
  const other = tail.reduce((s, x) => s + x.total, 0);
  const out: Array<{ name: string; amount: number; color: string }> = head.map(
    (x) => ({
      name: x.name,
      amount: x.total,
      color: categoryChartCssVarForLabel(x.name),
    }),
  );
  if (other > 0) {
    out.push({
      name: "Other",
      amount: other,
      color: "var(--chart-12)",
    });
  }
  return out;
}

export type FinanceDashboardComputed = {
  selYear: number;
  selMonth1: number;
  periodLabel: string;
  yearOptions: number[];
  monthlyIncome: number[];
  monthlyExpense: number[];
  balanceByMonth: number[];
  thisMonthBalance: number;
  thisMonthExpenseTotal: number;
  yearExpenseTotal: number;
  monthCategoryDonut: Array<{ name: string; amount: number; color: string }>;
  yearCategoryDonut: Array<{ name: string; amount: number; color: string }>;
  yearlyProgress: Array<{
    label: string;
    value: number;
    colorCssVar: string;
  }>;
  expenseBreakdown: NamedTotal[];
  breakdownMax: number;
  axisMax: number;
  monthLabels: string[];
};

export function computeFinanceDashboardData(
  expensesWithCategory: ExpenseWithCategory[],
  rawYear: number,
  rawMonth: number,
): FinanceDashboardComputed {
  const now = new Date();
  const selYear = clampNumber(Math.floor(rawYear), 1970, 2100);
  const selMonth1 = clampNumber(Math.floor(rawMonth), 1, 12);
  const selMonth0 = selMonth1 - 1;

  const monthlyIncome = Array.from({ length: 12 }, () => 0);
  const monthlyExpense = Array.from({ length: 12 }, () => 0);

  const yearCategoryTotals = new Map<string, NamedTotal>();
  const monthCategoryTotals = new Map<string, NamedTotal>();
  const titleTotals = new Map<string, NamedTotal>();

  const expenseYears = new Set<number>();
  expenseYears.add(selYear);
  expenseYears.add(now.getFullYear());

  for (const exp of expensesWithCategory) {
    const dt = exp.expenseDate ? new Date(exp.expenseDate) : null;
    if (!dt || Number.isNaN(dt.getTime())) continue;

    expenseYears.add(dt.getFullYear());

    const amount = Number(exp.amount) || 0;
    if (amount === 0) continue;

    const y = dt.getFullYear();
    const m = dt.getMonth();

    if (y !== selYear) continue;

    if (exp.type === "income") {
      monthlyIncome[m] += amount;
      continue;
    }

    monthlyExpense[m] += amount;

    const catLabel = exp.category?.name ?? "Uncategorized";
    const prevYear = yearCategoryTotals.get(catLabel) ?? {
      name: catLabel,
      total: 0,
    };
    yearCategoryTotals.set(catLabel, {
      name: catLabel,
      total: prevYear.total + amount,
    });

    if (m === selMonth0) {
      const prevM = monthCategoryTotals.get(catLabel) ?? {
        name: catLabel,
        total: 0,
      };
      monthCategoryTotals.set(catLabel, {
        name: catLabel,
        total: prevM.total + amount,
      });

      const prevT = titleTotals.get(exp.title) ?? { name: exp.title, total: 0 };
      titleTotals.set(exp.title, {
        name: exp.title,
        total: prevT.total + amount,
      });
    }
  }

  const balanceByMonth = monthlyIncome.map(
    (inc, i) => inc - monthlyExpense[i]!,
  );

  const thisMonthExpenseTotal = monthlyExpense[selMonth0] ?? 0;
  const thisMonthBalance = balanceByMonth[selMonth0] ?? 0;

  const yearExpenseTotal = monthlyExpense.reduce((a, b) => a + b, 0);

  const monthCategoryDonut = donutSegmentsFromTotals(monthCategoryTotals, 6);
  const yearCategoryDonut = donutSegmentsFromTotals(yearCategoryTotals, 8);

  const yearlyProgress = Array.from(yearCategoryTotals.values())
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)
    .map((item) => ({
      label: item.name,
      value:
        yearExpenseTotal > 0
          ? Math.round((item.total / yearExpenseTotal) * 100)
          : 0,
      colorCssVar: categoryChartCssVarForLabel(item.name),
    }));

  const expenseBreakdown = Array.from(titleTotals.values())
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  const breakdownMax = Math.max(...expenseBreakdown.map((x) => x.total), 1);

  const maxMonthlyBar = Math.max(...monthlyIncome, ...monthlyExpense, 0.0001);
  const axisMax = niceAxisMax(maxMonthlyBar);

  const yearOptions = Array.from(expenseYears).sort((a, b) => a - b);

  const monthLabels = Array.from({ length: 12 }, (_, i) =>
    new Date(selYear, i, 1)
      .toLocaleString("en-US", { month: "short" })
      .toLowerCase(),
  );

  const periodLabel = new Date(selYear, selMonth0, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  return {
    selYear,
    selMonth1,
    periodLabel,
    yearOptions,
    monthlyIncome,
    monthlyExpense,
    balanceByMonth,
    thisMonthBalance,
    thisMonthExpenseTotal,
    yearExpenseTotal,
    monthCategoryDonut,
    yearCategoryDonut,
    yearlyProgress,
    expenseBreakdown,
    breakdownMax,
    axisMax,
    monthLabels,
  };
}
