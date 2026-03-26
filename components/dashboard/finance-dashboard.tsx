import { auth } from "@clerk/nextjs/server";
import { getAllExpensesWithCategoryByUser } from "@/lib/expenses/expense-select";
import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import {
  categoryChartBgClassForLabel,
  categoryChartCssVarForLabel,
} from "@/lib/dashboard/category-palette";
import { cn } from "@/lib/utils";
import type { ExpenseWithCategory } from "@/types";
import { formatCurrency } from "@/lib/formatters/currency";

/** Dashboard-wide: recurring = green, one-time = red (theme tokens). */
const COLOR_RECURRING = "var(--primary)";
const COLOR_ONE_TIME = "var(--destructive)";
/** Deeper green for recurring-only accents (still on-brand). */
const COLOR_RECURRING_ALT = "var(--chart-6)";
const COLOR_TOTAL_A = "var(--chart-2)";
const COLOR_TOTAL_B = "var(--chart-4)";
const COLOR_SHARE_FILL = "var(--primary)";
const COLOR_SHARE_REST = "rgba(0,0,0,0)";

function MiniGradientFill({ from, to }: { from: string; to: string }) {
  return (
    <div
      className="mt-3 h-14 w-full rounded-lg opacity-85"
      style={{
        background: `linear-gradient(to right, ${from}, ${to})`,
        clipPath:
          "polygon(0 55%, 8% 47%, 16% 52%, 24% 30%, 32% 45%, 40% 33%, 48% 60%, 56% 40%, 64% 57%, 72% 38%, 80% 48%, 88% 35%, 100% 52%, 100% 100%, 0 100%)",
      }}
    />
  );
}

function DashboardPanel({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-sm",
        className,
      )}
    >
      <h3 className="mb-4 text-sm font-medium text-foreground">{title}</h3>
      {children}
    </section>
  );
}

function clampNumber(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function formatSharePercent(value: number) {
  return `${value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}

function monthKey(d: Date) {
  return d.getFullYear() * 12 + d.getMonth();
}

function buildConicGradient(percent: number, colorA: string, colorB: string) {
  const p = clampNumber(percent, 0, 100);
  return `conic-gradient(${colorA} 0 ${p}%, ${colorB} ${p}% 100%)`;
}

function buildSvgPath(values: number[]) {
  const width = 300;
  const height = 120;
  const pad = 10;
  const max = Math.max(...values, 0.0001);

  const points = values.map((v, i) => {
    const x = pad + (i * (width - pad * 2)) / Math.max(values.length - 1, 1);
    const y = height - pad - (v / max) * (height - pad * 2);
    return { x, y };
  });

  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
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
  thisMonthTotal: number;
  thisMonthRecurringTotal: number;
  monthShareOfAnnualBasePct: number;
  yearShareOfTotalBasePct: number;
  calendarRecurring: number[];
  calendarOneTime: number[];
  yearlyProgress: Array<{
    label: string;
    value: number;
    colorCssVar: string;
  }>;
  monthTop: Array<{ name: string; total: number }>;
  monthTopMax: number;
  maxBar: number;
  recurringPath: string;
  oneTimePath: string;
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

  const monthStart = new Date(selYear, selMonth0, 1);
  const monthEndExclusive = new Date(selYear, selMonth0 + 1, 1);

  const calendarYearStart = new Date(selYear, 0, 1);
  const calendarYearEndExclusive = new Date(selYear + 1, 0, 1);

  const rollingStart = new Date(selYear, selMonth0 - 11, 1);
  const rollingEndExclusive = new Date(selYear, selMonth0 + 1, 1);
  const rollingFirstKey = monthKey(rollingStart);

  const calendarRecurring = Array.from({ length: 12 }, () => 0);
  const calendarOneTime = Array.from({ length: 12 }, () => 0);

  const rollingRecurring = Array.from({ length: 12 }, () => 0);
  const rollingOneTime = Array.from({ length: 12 }, () => 0);
  const rollingMonthTotals = Array.from({ length: 12 }, () => 0);

  let thisMonthTotal = 0;
  let thisMonthRecurringTotal = 0;

  type CategoryAgg = { name: string; total: number };
  const categoryTotalsRolling = new Map<number, CategoryAgg>();
  const topCategoriesThisMonth = new Map<number, CategoryAgg>();

  let yearTotal = 0;
  let allTimeTotal = 0;

  const expenseYears = new Set<number>();
  expenseYears.add(selYear);
  expenseYears.add(now.getFullYear());

  for (const exp of expensesWithCategory) {
    const dt = exp.expenseDate ? new Date(exp.expenseDate) : null;
    if (!dt || Number.isNaN(dt.getTime())) continue;
    if (exp.type !== "expense") continue;

    expenseYears.add(dt.getFullYear());

    const amount = Number(exp.amount) || 0;
    if (amount === 0) continue;

    allTimeTotal += amount;

    const t = dt.getTime();

    if (t >= monthStart.getTime() && t < monthEndExclusive.getTime()) {
      thisMonthTotal += amount;
      if (exp.isRecurring) thisMonthRecurringTotal += amount;

      const catId = exp.category?.id;
      const catName = exp.category?.name ?? "Uncategorized";
      if (typeof catId === "number") {
        const prev = topCategoriesThisMonth.get(catId);
        topCategoriesThisMonth.set(catId, {
          name: catName,
          total: (prev?.total ?? 0) + amount,
        });
      }
    }

    if (
      t >= calendarYearStart.getTime() &&
      t < calendarYearEndExclusive.getTime()
    ) {
      const mi = dt.getMonth();
      if (exp.isRecurring) calendarRecurring[mi] += amount;
      else calendarOneTime[mi] += amount;
      yearTotal += amount;
    }

    if (t >= rollingStart.getTime() && t < rollingEndExclusive.getTime()) {
      const idx = monthKey(dt) - rollingFirstKey;
      if (idx >= 0 && idx < 12) {
        rollingMonthTotals[idx] += amount;
        if (exp.isRecurring) rollingRecurring[idx] += amount;
        else rollingOneTime[idx] += amount;

        const catId = exp.category?.id;
        const catName = exp.category?.name ?? "Uncategorized";
        if (typeof catId === "number") {
          const prev = categoryTotalsRolling.get(catId);
          categoryTotalsRolling.set(catId, {
            name: catName,
            total: (prev?.total ?? 0) + amount,
          });
        }
      }
    }
  }

  const totalRolling = rollingMonthTotals.reduce((acc, v) => acc + v, 0);

  const monthShareOfAnnualBasePct =
    yearTotal > 0 ? (thisMonthTotal / yearTotal) * 100 : 0;
  const yearShareOfTotalBasePct =
    allTimeTotal > 0 ? (yearTotal / allTimeTotal) * 100 : 0;

  const topCategoryRolling = Array.from(categoryTotalsRolling.entries())
    .map(([id, agg]) => ({ id, ...agg }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const yearlyProgress = topCategoryRolling.map((item) => {
    const share = totalRolling > 0 ? (item.total / totalRolling) * 100 : 0;
    return {
      label: item.name,
      value: Math.round(share),
      colorCssVar: categoryChartCssVarForLabel(item.name),
    };
  });

  const monthTop = Array.from(topCategoriesThisMonth.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);
  const monthTopMax = Math.max(...monthTop.map((c) => c.total), 1);

  const maxBar = Math.max(...calendarRecurring, ...calendarOneTime, 0.0001);

  const recurringPath = buildSvgPath(rollingRecurring);
  const oneTimePath = buildSvgPath(rollingOneTime);

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
    thisMonthTotal,
    thisMonthRecurringTotal,
    monthShareOfAnnualBasePct,
    yearShareOfTotalBasePct,
    calendarRecurring,
    calendarOneTime,
    yearlyProgress,
    monthTop,
    monthTopMax,
    maxBar,
    recurringPath,
    oneTimePath,
    monthLabels,
  };
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
    thisMonthTotal,
    thisMonthRecurringTotal,
    monthShareOfAnnualBasePct,
    yearShareOfTotalBasePct,
    calendarRecurring,
    calendarOneTime,
    yearlyProgress,
    monthTop,
    monthTopMax,
    maxBar,
    recurringPath,
    oneTimePath,
    monthLabels,
  } = computed;

  return (
    <div className="min-h-screen bg-background p-4 text-foreground md:p-6">
      <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[220px_1fr]">
        <DashboardSidebar
          yearOptions={yearOptions}
          selectedYear={selYear}
          selectedMonth={selMonth1}
        />

        <main className="grid gap-4">
          <div className="grid gap-4 xl:grid-cols-3">
            <DashboardPanel title={`Total expenses — ${periodLabel}`}>
              <p className="text-3xl font-bold">
                {formatCurrency(thisMonthTotal)}
              </p>
              <MiniGradientFill from={COLOR_TOTAL_A} to={COLOR_TOTAL_B} />
            </DashboardPanel>

            <DashboardPanel title={`Recurring expenses — ${periodLabel}`}>
              <p className="text-3xl font-bold">
                {formatCurrency(thisMonthRecurringTotal)}
              </p>
              <MiniGradientFill
                from={COLOR_RECURRING}
                to={COLOR_RECURRING_ALT}
              />
            </DashboardPanel>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <DashboardPanel
                title={`Monthly expenses — ${periodLabel}`}
                className="pb-6"
              >
                <div className="mx-auto h-32 w-32 rounded-full border-8 border-border p-1">
                  <div
                    className="flex h-full w-full items-center justify-center rounded-full bg-muted/50"
                    aria-hidden
                    style={{
                      background: buildConicGradient(
                        monthShareOfAnnualBasePct,
                        COLOR_SHARE_FILL,
                        COLOR_SHARE_REST,
                      ),
                    }}
                  >
                    <div className="flex h-18 w-18 flex-col items-center justify-center gap-0.5 rounded-full bg-card px-1 text-center">
                      <span className="text-base font-semibold tabular-nums leading-none text-card-foreground">
                        {formatSharePercent(monthShareOfAnnualBasePct)}
                      </span>
                      <span className="text-[10px] leading-snug text-muted-foreground">
                        Share of annual base
                      </span>
                    </div>
                  </div>
                </div>
              </DashboardPanel>

              <DashboardPanel
                title={`Annual expenses — ${selYear}`}
                className="pb-6"
              >
                <div className="mx-auto h-32 w-32 rounded-full border-8 border-border p-1">
                  <div
                    className="flex h-full w-full items-center justify-center rounded-full bg-muted/50"
                    style={{
                      background: buildConicGradient(
                        yearShareOfTotalBasePct,
                        COLOR_SHARE_FILL,
                        COLOR_SHARE_REST,
                      ),
                    }}
                  >
                    <div className="flex h-18 w-18 flex-col items-center justify-center gap-0.5 rounded-full bg-card px-1 text-center">
                      <span className="text-base font-semibold tabular-nums leading-none text-card-foreground">
                        {formatSharePercent(yearShareOfTotalBasePct)}
                      </span>
                      <span className="text-[10px] leading-snug text-muted-foreground">
                        Share of total base
                      </span>
                    </div>
                  </div>
                </div>
              </DashboardPanel>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
            <DashboardPanel
              title={`Monthly trend — ${selYear} (recurring vs one-time)`}
            >
              <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-sm bg-primary"
                    aria-hidden
                  />
                  Recurring
                </span>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-sm bg-destructive"
                    aria-hidden
                  />
                  One-time
                </span>
              </div>
              <div className="flex h-52 items-end gap-2">
                {calendarRecurring.map((recurringValue, index) => {
                  const recurringHeight = (recurringValue / maxBar) * 100;
                  const oneTimeHeight = (calendarOneTime[index] / maxBar) * 100;

                  return (
                    <div
                      key={index}
                      className="flex h-full flex-1 items-end gap-1"
                    >
                      <div
                        className="w-1/2 rounded-t bg-primary/90"
                        style={{ height: `${recurringHeight}%` }}
                      />
                      <div
                        className="w-1/2 rounded-t bg-destructive/90"
                        style={{ height: `${oneTimeHeight}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 grid grid-cols-12 text-center text-[10px] uppercase text-muted-foreground">
                {monthLabels.map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>
            </DashboardPanel>

            <DashboardPanel
              title={`Top categories — 12 mo. ending ${periodLabel}`}
            >
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
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
            <DashboardPanel title={`Top categories — ${periodLabel}`}>
              <div className="space-y-4">
                {monthTop.map((item) => {
                  const width = (item.total / monthTopMax) * 100;
                  return (
                    <div key={item.name}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-foreground">{item.name}</span>
                        <span className="text-muted-foreground">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            categoryChartBgClassForLabel(item.name),
                          )}
                          style={{ width: `${clampNumber(width, 0, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </DashboardPanel>

            <DashboardPanel
              title={`Recurring vs one-time — 12 mo. ending ${periodLabel}`}
            >
              <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full border-2 border-primary"
                    aria-hidden
                  />
                  Recurring
                </span>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-full border-2 border-destructive"
                    aria-hidden
                  />
                  One-time
                </span>
              </div>
              <div className="relative h-40 overflow-hidden rounded-xl border border-border bg-muted/40 p-3">
                <div
                  className="absolute inset-0"
                  style={{
                    background: [
                      "radial-gradient(circle at 28% 0%, color-mix(in oklab, var(--primary) 18%, transparent), transparent 52%)",
                      "radial-gradient(circle at 72% 0%, color-mix(in oklab, var(--destructive) 14%, transparent), transparent 48%)",
                    ].join(","),
                  }}
                />
                <div className="absolute left-0 top-1/2 h-0.5 w-full bg-border" />
                <div className="absolute bottom-8 left-0 h-0.5 w-full bg-border/80" />
                <svg
                  viewBox="0 0 300 120"
                  className="relative z-10 h-full w-full"
                >
                  <path
                    d={recurringPath}
                    fill="none"
                    stroke={COLOR_RECURRING}
                    strokeWidth="3"
                  />
                  <path
                    d={oneTimePath}
                    fill="none"
                    stroke={COLOR_ONE_TIME}
                    strokeWidth="3"
                  />
                </svg>
              </div>
            </DashboardPanel>
          </div>
        </main>
      </div>
    </div>
  );
}
