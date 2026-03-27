import FinanceDashboardClient from "@/components/dashboard/finance-dashboard-client";
import { Suspense } from "react";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton />}>
      <FinanceDashboardClient />
    </Suspense>
  );
}
