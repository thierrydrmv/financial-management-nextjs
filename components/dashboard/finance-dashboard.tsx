import { auth } from "@clerk/nextjs/server";
import { getAllExpensesWithCategoryByUser } from "@/lib/expenses/expense-select";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { MonthlyAnalysisChart } from "@/components/dashboard/monthly-analysis-chart";
import {
  categoryChartBgClassForLabel,
  categoryChartCssVarForLabel,
} from "@/lib/dashboard/category-palette";
import { clampNumber, niceAxisMax } from "@/lib/dashboard/chart-axis";
import { cn } from "@/lib/utils";
import type { ExpenseWithCategory } from "@/types";
import { formatCurrency } from "@/lib/formatters/currency";

/** Expenses / sparkline accents (balance uses chart tokens). */
const COLOR_EXPENSE = "var(--destructive)";
const COLOR_EXPENSE_ALT = "var(--chart-5)";
const COLOR_BALANCE_A = "var(--chart-2)";
const COLOR_BALANCE_B = "var(--chart-4)";

function DashboardPanel({
  title,
  children,
  className = "",
  compact = false,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  /** Tighter padding and heading — use with summary sparkline cards. */
  compact?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm",
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <h3
        className={cn(
          "text-sm font-medium text-foreground",
          compact ? "mb-2" : "mb-4",
        )}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

/** Line + closed area path for sparkline-style charts (values ≥ 0). */
function buildAreaPaths(values: number[]) {
  if (values.length === 0) {
    return { line: "", area: "" };
  }
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 0.0001);
  const range = max - min || 1;
  const width = 300;
  const height = 120;
  const pad = 10;
  const bottom = height - pad;
  const yAt = (v: number) =>
    height - pad - ((v - min) / range) * (height - pad * 2);

  const points = values.map((v, i) => {
    const x = pad + (i * (width - pad * 2)) / Math.max(values.length - 1, 1);
    return { x, y: yAt(v) };
  });

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  const last = points[points.length - 1]!;
  const first = points[0]!;
  const area = `${line} L ${last.x.toFixed(2)} ${bottom} L ${first.x.toFixed(2)} ${bottom} Z`;
  return { line, area };
}

function buildCategoryDonutGradient(
  segments: Array<{ amount: number; color: string }>,
): string {
  const total = segments.reduce((s, x) => s + x.amount, 0);
  if (total <= 0) {
    return "conic-gradient(var(--muted) 0% 100%)";
  }
  let acc = 0;
  const stops: string[] = [];
  for (const seg of segments) {
    const p = (seg.amount / total) * 100;
    const start = acc;
    acc += p;
    stops.push(`${seg.color} ${start}% ${acc}%`);
  }
  if (acc < 99.99) {
    stops.push(
      `color-mix(in oklab, var(--muted) 45%, transparent) ${acc}% 100%`,
    );
  }
  return `conic-gradient(${stops.join(", ")})`;
}

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

function SparklineCard({
  values,
  stroke,
  fill,
  gradientId,
  compact = false,
}: {
  values: number[];
  stroke: string;
  fill: string;
  gradientId: string;
  compact?: boolean;
}) {
  const { line, area } = buildAreaPaths(values.length ? values : [0]);
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-lg border border-border/60 bg-muted/30",
        compact ? "mt-3 h-12" : "mt-3 h-14",
      )}
    >
      <svg
        viewBox="0 0 300 120"
        className="h-full w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity="0.35" />
            <stop offset="100%" stopColor={fill} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export type FinanceDashboardProps = {
  selectedYear: number;
  /** 1–12 */
  selectedMonth: number;
};

type FinanceDashboardComputed = {
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

function computeFinanceDashboardData(
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

function CategoryDonut({
  title,
  segments,
  total,
}: {
  title: string;
  total: number;
  segments: Array<{ name: string; amount: number; color: string }>;
}) {
  const gradient = buildCategoryDonutGradient(segments);
  const hasData = total > 0 && segments.length > 0;

  return (
    <DashboardPanel title={title} className="pb-6">
      <div className="mx-auto h-32 w-32 rounded-full border-8 border-border p-1">
        <div
          className="flex h-full w-full items-center justify-center rounded-full bg-muted/50"
          style={{
            background: hasData
              ? gradient
              : "conic-gradient(var(--muted) 0% 100%)",
          }}
        >
          <div className="flex h-18 w-18 flex-col items-center justify-center gap-0.5 rounded-full bg-card px-1 text-center">
            <span className="text-base font-semibold tabular-nums leading-none text-card-foreground">
              {hasData ? formatCurrency(total) : "—"}
            </span>
            <span className="text-[10px] leading-snug text-muted-foreground">
              {hasData ? "Total" : "No data"}
            </span>
          </div>
        </div>
      </div>
      {hasData && segments.length > 0 ? (
        <ul className="mt-3 space-y-1.5 text-[10px] text-muted-foreground">
          {segments.slice(0, 5).map((s) => (
            <li
              key={s.name}
              className="flex items-center justify-between gap-2"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  className="size-2 shrink-0 rounded-sm"
                  style={{ backgroundColor: s.color }}
                  aria-hidden
                />
                <span className="truncate">{s.name}</span>
              </span>
              <span className="shrink-0 tabular-nums text-foreground">
                {formatCurrency(s.amount)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </DashboardPanel>
  );
}

export default async function FinanceDashboard({
  selectedYear: rawYear,
  selectedMonth: rawMonth,
}: FinanceDashboardProps) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) redirectToSignIn();
  const userIdSafe = userId as string;

  const expensesWithCategory =
    await getAllExpensesWithCategoryByUser(userIdSafe);

  const computed = computeFinanceDashboardData(
    expensesWithCategory,
    rawYear,
    rawMonth,
  );

  const {
    selYear,
    selMonth1,
    periodLabel,
    yearOptions,
    monthlyIncome,
    monthlyExpense,
    balanceByMonth,
    thisMonthBalance,
    thisMonthExpenseTotal,
    monthCategoryDonut,
    yearCategoryDonut,
    yearlyProgress,
    expenseBreakdown,
    breakdownMax,
    axisMax,
    monthLabels,
    yearExpenseTotal,
  } = computed;

  return (
    <div className="min-h-screen bg-background p-4 text-foreground md:p-6">
      <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[220px_1fr]">
        <DashboardSidebar
          yearOptions={yearOptions}
          selectedYear={selYear}
          selectedMonth={selMonth1}
        />

        <main className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <DashboardPanel compact title={`Monthly balance — ${periodLabel}`}>
              <p
                className={cn(
                  "text-3xl font-bold tabular-nums leading-tight",
                  thisMonthBalance >= 0 ? "text-primary" : "text-destructive",
                )}
              >
                {formatCurrency(thisMonthBalance)}
              </p>
              <SparklineCard
                compact
                values={balanceByMonth}
                stroke={COLOR_BALANCE_A}
                fill={COLOR_BALANCE_B}
                gradientId="dash-spark-balance"
              />
            </DashboardPanel>

            <DashboardPanel compact title={`Monthly expenses — ${periodLabel}`}>
              <p className="text-3xl font-bold leading-tight text-destructive tabular-nums">
                {formatCurrency(thisMonthExpenseTotal)}
              </p>
              <SparklineCard
                compact
                values={monthlyExpense}
                stroke={COLOR_EXPENSE}
                fill={COLOR_EXPENSE_ALT}
                gradientId="dash-spark-expense"
              />
            </DashboardPanel>
          </div>

          <DashboardPanel title={`Monthly analysis — ${selYear}`}>
            <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-sm bg-primary"
                  aria-hidden
                />
                Income
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-sm bg-destructive"
                  aria-hidden
                />
                Expenses
              </span>
            </div>
            <MonthlyAnalysisChart
              year={selYear}
              monthlyIncome={monthlyIncome}
              monthlyExpense={monthlyExpense}
              axisMax={axisMax}
              monthLabels={monthLabels}
            />
          </DashboardPanel>

          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            <CategoryDonut
              title={`Expenses this month — ${periodLabel}`}
              segments={monthCategoryDonut}
              total={thisMonthExpenseTotal}
            />

            <CategoryDonut
              title={`Yearly expenses — ${selYear}`}
              segments={yearCategoryDonut}
              total={yearExpenseTotal}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:items-start">
            <DashboardPanel title={`Annual share — ${selYear}`}>
              <div className="grid grid-cols-3 gap-4">
                {yearlyProgress.map((item) => (
                  <div key={item.label} className="text-center">
                    <div className="mx-auto mb-2 h-16 w-16 rounded-full border-4 border-border p-1">
                      <div className="relative h-full w-full rounded-full bg-muted/50">
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `conic-gradient(${item.colorCssVar} 0 ${clampNumber(
                              item.value,
                              0,
                              100,
                            )}%, rgba(0,0,0,0) ${clampNumber(
                              item.value,
                              0,
                              100,
                            )}% 100%)`,
                          }}
                        />
                        <div className="absolute inset-2 rounded-full bg-card" />
                      </div>
                    </div>
                    <p className="text-xs font-semibold">{item.value}%</p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </DashboardPanel>

            <DashboardPanel title={`Expense breakdown — ${periodLabel}`}>
              <div className="space-y-4">
                {expenseBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No expense line items this month.
                  </p>
                ) : (
                  expenseBreakdown.map((item) => {
                    const width = (item.total / breakdownMax) * 100;
                    return (
                      <div key={item.name}>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span className="truncate text-foreground">
                            {item.name}
                          </span>
                          <span className="shrink-0 text-muted-foreground tabular-nums">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              categoryChartBgClassForLabel(item.name),
                            )}
                            style={{
                              width: `${clampNumber(width, 0, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </DashboardPanel>
          </div>
        </main>
      </div>
    </div>
  );
}
