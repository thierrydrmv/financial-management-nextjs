import SectionHeader from "../common/section-header";
import { ArrowUpRightIcon, Calendar, CalendarIcon } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import EmptyState from "../common/empty-state";
import { getLastMonthExpenses } from "@/lib/expenses/expense-select";
import { getCategoryById } from "@/lib/categories/category-select";
import ExpenseCard from "../expenses/expense-card";

export default async function MonthExpenses() {
  const monthExpenses = await getLastMonthExpenses();

  const expensesWithCategory = await Promise.all(
    monthExpenses.map(async (expense) => {
      const category = await getCategoryById(expense.categoryId);

      return {
        ...expense,
        category,
      };
    }),
  );

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
