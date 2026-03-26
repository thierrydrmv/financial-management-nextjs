import SectionHeader from "@/components/common/section-header";
import { ExpenseDeleteForm } from "@/components/expenses/expense-delete-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { notFound } from "next/navigation";

export default async function Expense({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) redirectToSignIn();
  const { id } = await params;

  if (!id || Number.isNaN(Number(id))) {
    notFound();
  }

  const userIdSafe = userId as string;
  const expense = await getExpenseByIdAndUser(Number(id), userIdSafe);

  if (!expense) notFound();

  const { title, description, amount, paymentMethod, expenseDate, category } =
    expense;

  return (
    <div className="py-16">
      <div className="wrapper">
        <Link
          href="/expenses"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Back to Expenses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-start gap-6">
              <div className="flex-1 min-w-0">
                <SectionHeader
                  title={title}
                  icon={ReceiptIcon}
                  description={""}
                />
              </div>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed">
                {description ?? "This page shows the details of this expense."}
              </p>
            </div>

            <div className="border rounded-lg p-6 bg-primary/10">
              <h2 className="text-lg font-semibold mb-4">Expense Details</h2>

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
                    value: category?.name ?? "Not informed",
                    icon: TagIcon,
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
              <div className="border rounded-lg p-6 bg-background">
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">
                    Expense summary
                  </p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(Number(amount))}
                  </p>
                </div>

                {paymentMethod && (
                  <div className="pt-6 border-t">
                    <Badge
                      className="w-full justify-center py-2"
                      variant="secondary"
                    >
                      {paymentMethod}
                    </Badge>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  asChild
                  variant="outline"
                  className="w-full cursor-pointer hover:border-blue-500 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400"
                >
                  <Link href={`/expenses/${id}/edit`}>
                    <PencilIcon className="size-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <ExpenseDeleteForm id={id} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
