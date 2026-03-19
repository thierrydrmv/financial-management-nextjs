import { ArrowUpRightIcon, CalendarIcon, DollarSign } from "lucide-react";
import SectionHeader from "../common/section-header";
import { Button } from "../ui/button";
import Link from "next/link";
import EmptyState from "../common/empty-state";
import { getLastWeekExpensesByUser } from "@/lib/expenses/expense-select";
import { getCategoryById } from "@/lib/categories/category-select";
import ExpenseCard from "../expenses/expense-card";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function WeekExpenses() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const weekExpenses = await getLastWeekExpensesByUser(userId);

  const expensesWithCategory = await Promise.all(
    weekExpenses.map(async (expense) => {
      const category = await getCategoryById(expense.categoryId);

      return {
        ...expense,
        category,
      };
    }),
  );

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
        {expensesWithCategory.length > 0 ? (
          <div className="grid-wrapper">
            {expensesWithCategory.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                category={expense.category[0]}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            message="No expenses launched today. Check back soon for new expenses."
            icon={CalendarIcon}
          />
        )}
      </div>
    </section>
  );
}
