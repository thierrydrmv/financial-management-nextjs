import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <section className="py-20">
      <div className="wrapper flex flex-col items-center">
        <div className="w-full max-w-2xl">
          <div className="mb-8 space-y-3">
            <div className="flex w-fit items-center gap-2">
              <Skeleton className="size-6" />
              <Skeleton className="h-9 w-56" />
            </div>
            <Skeleton className="h-6 w-96 max-w-full" />
          </div>
        </div>

        <div className="w-full max-w-2xl space-y-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
            <Skeleton className="h-11 w-full" />
          </div>

          <div className="border-t pt-10 space-y-4">
            <Skeleton className="h-7 w-36" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <li key={index}>
                  <div className="rounded-xl border bg-card px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="size-4 rounded-full" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
