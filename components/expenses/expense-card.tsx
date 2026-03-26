import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { CalendarIcon, StarIcon } from "lucide-react";
import { ExpenseCategorySummary, ExpenseType } from "@/types";
import { formatCurrency } from "@/lib/formatters/currency";
function formatPaymentLabel(method: string | null | undefined) {
  if (!method) return null;
  return method
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
export default function ExpenseCard({
  expense,
  category,
}: {
  expense: ExpenseType;
  category?: ExpenseCategorySummary | null;
}) {
  const formattedAmount = formatCurrency(Number(expense.amount));
  const dateLine = expense.expenseDate
    ? new Date(expense.expenseDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;
  const paymentLabel = formatPaymentLabel(expense.paymentMethod);
  const isIncome = expense.type === "income";
  return (
    <Link href={`/expenses/${expense.id}`}>
      <Card className="group card-hover hover:bg-primary-foreground/10 border-solid border-gray-400 min-h-50">
        <CardHeader className="flex-1 space-y-0 pb-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {expense.title}
                </CardTitle>
                {expense.isRecurring && (
                  <Badge className="gap-1 bg-primary text-primary-foreground shrink-0">
                    <StarIcon className="size-3 fill-current" />
                    Recurring
                  </Badge>
                )}
              </div>
              {dateLine && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarIcon className="size-3.5 shrink-0" aria-hidden />
                  <span>{dateLine}</span>
                </p>
              )}
              {expense.description ? (
                <CardDescription className="line-clamp-2">
                  {expense.description}
                </CardDescription>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-xs font-medium text-muted-foreground">
                Amount
              </p>
              <p
                className={`text-lg font-semibold tabular-nums ${
                  isIncome ? "text-primary" : "text-destructive"
                }`}
              >
                {formattedAmount}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardFooter className="flex flex-row flex-wrap items-center justify-between gap-2 border-t pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isIncome ? "default" : "secondary"}>
              {isIncome ? "Income" : "Expense"}
            </Badge>
            <Badge variant="secondary">{category?.name ?? "Uncategorized"}</Badge>
          </div>
          {paymentLabel ? (
            <Badge variant="outline" className="font-normal">
              {paymentLabel}
            </Badge>
          ) : null}
        </CardFooter>
      </Card>
    </Link>
  );
}
