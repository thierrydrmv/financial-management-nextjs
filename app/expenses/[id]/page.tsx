import SectionHeader from "@/components/common/section-header";
import { PreviewModeBanner } from "@/components/demo/preview-mode-banner";
import { ExpenseDeleteForm } from "@/components/expenses/expense-delete-form";
import { ExpenseDetailPreviewActions } from "@/components/expenses/expense-detail-preview-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPreviewExpenseById } from "@/lib/demo/preview-data";
import { getExpenseByIdAndUser } from "@/lib/expenses/expense-select";
import { formatCurrency } from "@/lib/formatters/currency";
import { auth } from "@clerk/nextjs/server";
import {
  ArrowLeftIcon,
  CalendarIcon,
  PencilIcon,
  ReceiptIcon,
  TagIcon,
  WalletIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function Expense({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id || Number.isNaN(Number(id))) {
    notFound();
  }

  const numId = Number(id);
  const { userId } = await auth();

  const expense = !userId
    ? getPreviewExpenseById(numId)
    : await getExpenseByIdAndUser(numId, userId as string);

  if (!userId && !expense) {
    redirect("/");
  }
  if ((userId && !expense) || !expense) {
    notFound();
  }

  const isPreview = !userId;

  const {
    title,
    type,
    description,
    amount,
    paymentMethod,
    expenseDate,
    category,
  } = expense;

  return (
    <div className="py-16">
      <div className="wrapper">
        <Link
          href="/expenses"
          className="mb-8 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Expenses
        </Link>

        {isPreview ? (
          <div className="mb-10 max-w-3xl">
            <PreviewModeBanner className="mb-0" />
          </div>
        ) : null}

        <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="flex items-start gap-6">
              <div className="min-w-0 flex-1">
                <SectionHeader
                  title={title}
                  icon={ReceiptIcon}
                  description={""}
                />
              </div>
            </div>

            <div className="prose prose-neutral max-w-none dark:prose-invert">
              <h2 className="mb-4 text-xl font-semibold">Description</h2>
              <p className="leading-relaxed text-muted-foreground">
                {description ?? "This page shows the details of this expense."}
              </p>
            </div>

            <div className="rounded-lg border bg-primary/10 p-6">
              <h2 className="mb-4 text-lg font-semibold">Expense Details</h2>

              <div className="space-y-3">
                {[
                  {
                    label: "Date:",
                    value: expenseDate
                      ? new Date(expenseDate).toLocaleDateString()
                      : "Not informed",
                    icon: CalendarIcon,
                  },
                  {
                    label: "Category:",
                    value:
                      type === "income"
                        ? "N/A for income"
                        : (category?.name ?? "Not informed"),
                    icon: TagIcon,
                  },
                  {
                    label: "Type:",
                    value: type === "income" ? "Income" : "Expense",
                    icon: ReceiptIcon,
                  },
                  {
                    label: "Amount:",
                    value: formatCurrency(Number(amount)),
                    icon: WalletIcon,
                  },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-lg border bg-background p-6">
                <div className="mb-6 text-center">
                  <p className="mb-2 text-sm text-muted-foreground">
                    Expense summary
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(Number(amount))}
                  </p>
                </div>

                {paymentMethod && (
                  <div className="border-t pt-6">
                    <Badge
                      className="w-full justify-center py-2"
                      variant="secondary"
                    >
                      {paymentMethod}
                    </Badge>
                  </div>
                )}
              </div>
              {isPreview ? (
                <ExpenseDetailPreviewActions id={id} />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full cursor-pointer hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400"
                  >
                    <Link href={`/expenses/${id}/edit`}>
                      <PencilIcon className="mr-2 size-4" />
                      Edit
                    </Link>
                  </Button>
                  <ExpenseDeleteForm id={id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
