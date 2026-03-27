import Link from "next/link";
import { Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

function dashboardHref(year: number, month: number) {
  return `/dashboard?year=${year}&month=${month}`;
}

type DashboardSidebarProps = {
  yearOptions: number[];
  selectedYear: number;
  selectedMonth: number;
  /**
   * When set, links use client navigation with scope so the dashboard can show
   * scoped loading (month vs year).
   */
  onNavigate?: (scope: "year" | "month", year: number, month: number) => void;
};

export default function DashboardSidebar({
  yearOptions,
  selectedYear,
  selectedMonth,
  onNavigate,
}: DashboardSidebarProps) {
  const safeSelectedMonth = Math.min(12, Math.max(1, selectedMonth));
  const monthEntries = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(selectedYear, i, 1);
    return {
      index1: i + 1,
      label: d.toLocaleString("en-US", { month: "long" }),
    };
  });

  return (
    <aside className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-8 flex items-center gap-3">
        <span className="rounded-full bg-primary/15 p-2 text-primary">
          <Wallet className="h-4 w-4" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">Dashboard</p>
          <h2 className="text-sm font-semibold">Personal Finance Dashboard</h2>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Year
          </p>
          <div className="space-y-1 rounded-xl border border-border bg-muted/40 p-2 text-sm">
            {yearOptions.map((y) => (
              <Link
                key={y}
                href={dashboardHref(y, safeSelectedMonth)}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate("year", y, safeSelectedMonth);
                  }
                }}
                className={cn(
                  "block w-full rounded-md px-3 py-1 text-left transition-colors",
                  y === selectedYear
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {y}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Month
          </p>
          <div className="max-h-[min(420px,55vh)] space-y-1 overflow-y-auto rounded-xl border border-border bg-muted/40 p-2 text-sm">
            {monthEntries.map(({ index1, label }) => (
              <Link
                key={index1}
                href={dashboardHref(selectedYear, index1)}
                onClick={(e) => {
                  if (onNavigate) {
                    e.preventDefault();
                    onNavigate("month", selectedYear, index1);
                  }
                }}
                className={cn(
                  "block w-full rounded-md px-3 py-1 text-left transition-colors",
                  index1 === safeSelectedMonth
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
