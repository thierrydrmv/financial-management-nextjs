import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="py-16">
      <div className="wrapper">
        <div className="mb-8 inline-flex items-center gap-2">
          <Skeleton className="size-4" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="size-6" />
                <Skeleton className="h-9 w-64" />
              </div>
            </div>

            <div className="space-y-4">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-9/12" />
            </div>

            <div className="rounded-lg border p-6 space-y-4">
              <Skeleton className="h-7 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className="rounded-lg border p-6">
                <div className="mb-6 space-y-2 text-center">
                  <Skeleton className="mx-auto h-4 w-28" />
                  <Skeleton className="mx-auto h-8 w-40" />
                </div>
                <div className="border-t pt-6">
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
