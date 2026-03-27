import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-page-skeleton";

export default function Loading() {
  return (
    <section className="py-20">
      <div className="wrapper">
        <DashboardPageSkeleton />
      </div>
    </section>
  );
}
