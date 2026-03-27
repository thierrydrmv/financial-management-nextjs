import { Skeleton } from "../ui/skeleton";

/** Placeholder cards while list data is loading (filters / pagination). */
export default function ExpenseExplorerCardsSkeleton({
  count,
}: {
  count: number;
}) {
  return (
    <div className="grid-wrapper" aria-busy="true" aria-label="Loading expenses">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border rounded-lg p-6 min-h-50 border-solid border-gray-400"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-6 w-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
