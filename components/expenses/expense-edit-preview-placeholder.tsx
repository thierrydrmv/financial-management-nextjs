import { formatCurrency } from "@/lib/formatters/currency";
import type { ExpenseWithCategory } from "@/types";
import { LockIcon } from "lucide-react";

function formatPaymentLabel(method: string | null | undefined) {
  if (!method) return "—";
  return method
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Read-only shell for `/expenses/[id]/edit` when signed out (matches demo row). */
export function ExpenseEditPreviewPlaceholder({
  expense,
}: {
  expense: ExpenseWithCategory;
}) {
  const dateLine = expense.expenseDate
    ? new Date(expense.expenseDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  return (
    <div className="rounded-xl border border-dashed border-muted-foreground/35 bg-muted/20 p-6">
      <div className="mb-6 flex items-start gap-2 text-sm text-muted-foreground">
        <LockIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <p>
          <span className="font-medium text-foreground">Sign in</span> to edit
          and save changes. Values below are read-only demo data.
        </p>
      </div>
      <dl className="grid gap-4 text-sm">
        <div className="grid gap-1">
          <dt className="font-medium text-muted-foreground">Type</dt>
          <dd className="text-foreground capitalize">{expense.type}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="font-medium text-muted-foreground">Title</dt>
          <dd className="text-foreground">{expense.title}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="font-medium text-muted-foreground">Amount</dt>
          <dd className="font-semibold tabular-nums text-foreground">
            {formatCurrency(Number(expense.amount))}
          </dd>
        </div>
        {expense.type === "expense" ? (
          <div className="grid gap-1">
            <dt className="font-medium text-muted-foreground">Category</dt>
            <dd className="text-foreground">
              {expense.category?.name ?? "—"}
            </dd>
          </div>
        ) : null}
        <div className="grid gap-1">
          <dt className="font-medium text-muted-foreground">Date</dt>
          <dd className="text-foreground">{dateLine}</dd>
        </div>
        <div className="grid gap-1">
          <dt className="font-medium text-muted-foreground">Payment method</dt>
          <dd className="text-foreground">
            {formatPaymentLabel(expense.paymentMethod)}
          </dd>
        </div>
        <div className="grid gap-1">
          <dt className="font-medium text-muted-foreground">Recurring</dt>
          <dd className="text-foreground">
            {expense.isRecurring ? "Yes" : "No"}
          </dd>
        </div>
        <div className="grid gap-1">
          <dt className="font-medium text-muted-foreground">Description</dt>
          <dd className="text-foreground">
            {expense.description?.trim() || "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
