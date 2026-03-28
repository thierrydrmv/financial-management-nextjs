"use client";

import DashboardSidebar from "@/components/dashboard/dashboard-sidebar";
import { DashboardMainFullSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { MonthlyAnalysisChart } from "@/components/dashboard/monthly-analysis-chart";
import { useDashboardExpenses } from "@/components/dashboard/dashboard-expenses-provider";
import { computeFinanceDashboardData } from "@/lib/dashboard/compute-finance-dashboard";
import { parseYearMonth } from "@/lib/dashboard/dashboard-search-params";
import { categoryChartBgClassForLabel } from "@/lib/dashboard/category-palette";
import { clampNumber } from "@/lib/dashboard/chart-axis";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters/currency";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

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

export default function FinanceDashboardClient() {
  const expenses = useDashboardExpenses();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingNav, setPendingNav] = useState<{
    scope: "year" | "month";
    seq: number;
  } | null>(null);

  const rawYear = searchParams.get("year") ?? undefined;
  const rawMonth = searchParams.get("month") ?? undefined;
  const { year, month } = parseYearMonth(rawYear, rawMonth);

  const computed = useMemo(
    () => computeFinanceDashboardData(expenses, year, month),
    [expenses, year, month],
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

  /** While not pending, ignore stale scope from the last navigation. */
  const activeScope = isPending && pendingNav ? pendingNav.scope : null;
  const showMonthSkeleton = activeScope === "month";
  const showYearSkeleton = activeScope === "year";

  const navigate = (scope: "year" | "month", y: number, m: number) => {
    setPendingNav((p) => ({
      scope,
      seq: (p?.seq ?? 0) + 1,
    }));
    startTransition(() => {
      router.push(`/dashboard?year=${y}&month=${m}`, { scroll: false });
    });
  };

  return (
    <div className="w-full text-foreground">
      <div className="grid w-full gap-4 lg:grid-cols-[220px_1fr]">
        <DashboardSidebar
          yearOptions={yearOptions}
          selectedYear={selYear}
          selectedMonth={selMonth1}
          onNavigate={navigate}
          className={cn(
            "motion-safe:transition-opacity motion-safe:duration-200",
            isPending && "opacity-95",
          )}
        />

        <main
          className={cn(
            "flex flex-col gap-6 motion-safe:transition-[opacity,filter] motion-safe:duration-200 motion-safe:ease-out",
            isPending && "opacity-90",
          )}
        >
          {showYearSkeleton ? (
            <DashboardMainFullSkeleton />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
                {showMonthSkeleton ? (
                  <>
                    <Skeleton className="h-36 rounded-2xl motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200" />
                    <Skeleton className="h-36 rounded-2xl motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200" />
                  </>
                ) : (
                  <>
                    <DashboardPanel
                      compact
                      title={`Monthly balance — ${periodLabel}`}
                    >
                      <p
                        className={cn(
                          "text-3xl font-bold tabular-nums leading-tight",
                          thisMonthBalance >= 0
                            ? "text-primary"
                            : "text-destructive",
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

                    <DashboardPanel
                      compact
                      title={`Monthly expenses — ${periodLabel}`}
                    >
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
                  </>
                )}
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
                {showMonthSkeleton ? (
                  <Skeleton className="h-64 rounded-2xl motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200" />
                ) : (
                  <CategoryDonut
                    title={`Expenses this month — ${periodLabel}`}
                    segments={monthCategoryDonut}
                    total={thisMonthExpenseTotal}
                  />
                )}

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

                {showMonthSkeleton ? (
                  <Skeleton className="min-h-64 rounded-2xl motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200" />
                ) : (
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
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
