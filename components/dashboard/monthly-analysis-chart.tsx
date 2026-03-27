"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/formatters/currency";
import {
  buildAxisTicks,
  clampNumber,
  formatAxisTick,
} from "@/lib/dashboard/chart-axis";
export type MonthlyAnalysisChartProps = {
  year: number;
  monthlyIncome: number[];
  monthlyExpense: number[];
  axisMax: number;
  monthLabels: string[];
};

export function MonthlyAnalysisChart({
  year,
  monthlyIncome,
  monthlyExpense,
  axisMax,
  monthLabels,
}: MonthlyAnalysisChartProps) {
  const axisTicks = buildAxisTicks(axisMax, 8);
  const [hoverKey, setHoverKey] = useState<string | null>(null);

  return (
    <>
      <div
        className="flex gap-2"
        role="img"
        aria-label={`Income and expenses by month for ${year}. Vertical scale from ${formatAxisTick(0)} to ${formatAxisTick(axisMax)}.`}
      >
        <div
          className="flex w-14 shrink-0 flex-col justify-between py-0.5 text-right text-[10px] leading-tight text-muted-foreground tabular-nums"
          aria-hidden
        >
          {[...axisTicks].reverse().map((tick) => (
            <span key={tick}>{formatAxisTick(tick)}</span>
          ))}
        </div>
        <div className="relative min-h-0 min-w-0 flex-1 border-l border-border pl-2">
          <div className="pointer-events-none absolute inset-0">
            {axisTicks.slice(1).map((tick) => (
              <div
                key={tick}
                className="absolute left-0 right-0 border-t border-border/40"
                style={{ bottom: `${(tick / axisMax) * 100}%` }}
              />
            ))}
          </div>
          <div className="relative flex h-56 items-end gap-1.5 sm:gap-2">
            {monthlyIncome.map((incomeValue, index) => {
              const expenseValue = monthlyExpense[index] ?? 0;
              const incomeHeight = (incomeValue / axisMax) * 100;
              const expenseHeight = (expenseValue / axisMax) * 100;
              const incomeKey = `${index}-income`;
              const expenseKey = `${index}-expense`;

              return (
                <div
                  key={index}
                  className="flex h-full min-w-0 flex-1 items-end gap-0.5 sm:gap-1"
                >
                  <div
                    className="relative flex h-full w-1/2 flex-col justify-end"
                    onMouseEnter={() => setHoverKey(incomeKey)}
                    onMouseLeave={() => setHoverKey(null)}
                  >
                    {hoverKey === incomeKey ? (
                      <div
                        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] font-medium text-popover-foreground shadow-md"
                        role="tooltip"
                      >
                        <span className="text-muted-foreground">Income: </span>
                        {formatCurrency(incomeValue)}
                      </div>
                    ) : null}
                    <div
                      className="w-full min-h-[2px] rounded-t bg-primary/90"
                      style={{
                        height: `${clampNumber(incomeHeight, 0, 100)}%`,
                      }}
                    />
                  </div>
                  <div
                    className="relative flex h-full w-1/2 flex-col justify-end"
                    onMouseEnter={() => setHoverKey(expenseKey)}
                    onMouseLeave={() => setHoverKey(null)}
                  >
                    {hoverKey === expenseKey ? (
                      <div
                        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] font-medium text-popover-foreground shadow-md"
                        role="tooltip"
                      >
                        <span className="text-muted-foreground">
                          Expenses:{" "}
                        </span>
                        {formatCurrency(expenseValue)}
                      </div>
                    ) : null}
                    <div
                      className="w-full min-h-[2px] rounded-t bg-destructive/90"
                      style={{
                        height: `${clampNumber(expenseHeight, 0, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <div className="w-14 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1 pl-2">
          <div className="grid grid-cols-12 gap-0.5 text-center text-[10px] uppercase text-muted-foreground sm:gap-0">
            {monthLabels.map((month) => (
              <span key={month} className="truncate">
                {month}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
