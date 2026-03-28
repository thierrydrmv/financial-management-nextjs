import FinanceDashboardClient from "@/components/dashboard/finance-dashboard-client";
import { PreviewModeBanner } from "@/components/demo/preview-mode-banner";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";

export default async function DashboardPage() {
  const { userId } = await auth();

  return (
    <section className="py-20">
      <div className="wrapper">
        <div className="mx-auto w-full max-w-7xl">
          {!userId ? <PreviewModeBanner className="mb-6" /> : null}
          <Suspense fallback={<DashboardPageSkeleton />}>
            <FinanceDashboardClient />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
