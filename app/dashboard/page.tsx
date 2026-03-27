import FinanceDashboard from "@/components/dashboard/finance-dashboard";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { Suspense } from "react";

function parseYearMonth(
  rawYear: string | string[] | undefined,
  rawMonth: string | string[] | undefined,
) {
  const now = new Date();
  const yStr = Array.isArray(rawYear) ? rawYear[0] : rawYear;
  const mStr = Array.isArray(rawMonth) ? rawMonth[0] : rawMonth;
  const hasYear = yStr !== undefined && yStr !== "";
  const hasMonth = mStr !== undefined && mStr !== "";
  const y = hasYear ? Number.parseInt(yStr, 10) : now.getFullYear();
  const m = hasMonth
    ? Number.parseInt(mStr, 10)
    : hasYear
      ? now.getMonth() + 1
      : now.getMonth() + 1;
  return {
    year: Number.isFinite(y) ? y : now.getFullYear(),
    month: Number.isFinite(m) ? m : now.getMonth() + 1,
  };
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const { year: rawYear, month: rawMonth } = await searchParams;
  const { year, month } = parseYearMonth(rawYear, rawMonth);
  return (
    <Suspense
      key={`${year}-${month}`}
      fallback={<DashboardPageSkeleton />}
    >
      <FinanceDashboard selectedYear={year} selectedMonth={month} />
    </Suspense>
  );
}
