import { Skeleton } from "@/components/ui/skeleton";

/** Full main column while the selected year is changing (sidebar stays visible). */
export function DashboardMainFullSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-hidden>
      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </div>

      <Skeleton className="min-h-[280px] rounded-2xl" />

      <div className="grid gap-4 md:grid-cols-2 md:items-start">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:items-start">
        <Skeleton className="min-h-64 rounded-2xl" />
        <Skeleton className="min-h-64 rounded-2xl" />
      </div>
    </div>
  );
}

/** Matches `FinanceDashboard` layout for initial load and year transitions. */
export function DashboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-background p-4 text-foreground md:p-6">
      <div className="mx-auto grid w-full max-w-7xl gap-4 lg:grid-cols-[220px_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="mb-8 flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-56 w-full rounded-xl" />
            </div>
          </div>
        </aside>

        <main className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
            <Skeleton className="h-36 rounded-2xl" />
            <Skeleton className="h-36 rounded-2xl" />
          </div>

          <Skeleton className="min-h-[280px] rounded-2xl" />

          <div className="grid gap-4 md:grid-cols-2 md:items-start">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.15fr_1fr] lg:items-start">
            <Skeleton className="min-h-64 rounded-2xl" />
            <Skeleton className="min-h-64 rounded-2xl" />
          </div>
        </main>
      </div>
    </div>
  );
}
