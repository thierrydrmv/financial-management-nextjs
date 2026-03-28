import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";

export default function Loading() {
  return (
    <section className="py-20">
      <div className="wrapper">
        <div className="mx-auto w-full max-w-7xl">
          <DashboardPageSkeleton />
        </div>
      </div>
    </section>
  );
}
