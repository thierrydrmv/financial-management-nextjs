import SectionHeader from "../common/section-header";
import { ArrowUpRightIcon, Calendar, CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import EmptyState from "../common/empty-state";
import { getLastMonthExpensesByUser } from "@/lib/expenses/expense-select";
import ExpenseCard from "../expenses/expense-card";
import { auth } from "@clerk/nextjs/server";

export default async function MonthExpenses() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    redirectToSignIn();
  }
  const userIdSafe = userId as string;
  const monthExpenses = await getLastMonthExpensesByUser(userIdSafe);

  return (
    <section className="py-20 bg-muted/20">
      <div className="wrapper">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader
            title="Your Month Spending"
            icon={Calendar}
            description="Overview of your expenses in the last month"
          />
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="/expenses">
              View All
              <ArrowUpRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
        {monthExpenses.length > 0 ? (
          <div className="grid-wrapper">
            {monthExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                category={expense.category ?? undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            message="No expenses launched this month. Check back soon for new expenses."
            icon={CalendarIcon}
          />
        )}
      </div>
    </section>
  );
}
