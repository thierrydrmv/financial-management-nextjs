import { ArrowUpRightIcon, CalendarIcon, DollarSign } from "lucide-react";
import SectionHeader from "../common/section-header";
import { Button } from "../ui/button";
import Link from "next/link";
import EmptyState from "../common/empty-state";
import { getLastWeekExpensesByUser } from "@/lib/expenses/expense-select";
import ExpenseCard from "../expenses/expense-card";
import { auth } from "@clerk/nextjs/server";

export default async function WeekExpenses() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    redirectToSignIn();
  }
  const userIdSafe = userId as string;
  const weekExpenses = await getLastWeekExpensesByUser(userIdSafe);

  return (
    <section className="py-20">
      <div className="wrapper">
        <div className="flex items-center justify-between mb-8">
          <SectionHeader
            title="Your Weekly Spending"
            icon={DollarSign}
            description="Overview of your expenses in the last 7 days"
          />
          <Button variant="outline" asChild className="hidden sm:flex">
            <Link href="/expenses">
              View All
              <ArrowUpRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
        {weekExpenses.length > 0 ? (
          <div className="grid-wrapper">
            {weekExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                category={expense.category ?? undefined}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            message="No expenses launched this week. Check back soon for new expenses."
            icon={CalendarIcon}
          />
        )}
      </div>
    </section>
  );
}
