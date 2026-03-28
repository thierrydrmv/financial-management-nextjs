import { cn } from "@/lib/utils";
import { EyeIcon, LockIcon } from "lucide-react";

type Props = {
  /** Default bottom margin for standalone use; use `mb-0` when nested in a layout strip. */
  className?: string;
};

/** Callout so signed-out visitors know they’re seeing demo data, not their account. */
export function PreviewModeBanner({ className }: Props) {
  return (
    <div
      className={cn(
        "mb-8 w-full rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3.5 text-amber-950 sm:px-5 sm:py-4 dark:border-amber-400/35 dark:bg-amber-500/15 dark:text-amber-50",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 dark:bg-amber-400/20">
          <EyeIcon
            className="size-5 text-amber-800 dark:text-amber-100"
            aria-hidden
          />
        </div>
        <div className="min-w-0 flex-1 basis-[min(100%,28rem)]">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <LockIcon className="size-3.5 shrink-0 opacity-80" aria-hidden />
            <span>Demo preview — you are not signed in</span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-amber-950/85 dark:text-amber-50/85">
            This screen shows sample data so you can explore the product.{" "}
            <span className="font-medium">
              Nothing here is saved and it is not your account.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
