import FinanceDashboard from "@/components/dashboard/finance-dashboard";

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
      ? 1
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
  const sp = await searchParams;
  const { year, month } = parseYearMonth(sp.year, sp.month);
  return <FinanceDashboard selectedYear={year} selectedMonth={month} />;
}
