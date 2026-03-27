import FinanceDashboardClient from "@/components/dashboard/finance-dashboard-client";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <section className="py-20">
      <div className="wrapper">
        <Suspense fallback={<DashboardPageSkeleton />}>
          <FinanceDashboardClient />
        </Suspense>
      </div>
    </section>
  );
}
