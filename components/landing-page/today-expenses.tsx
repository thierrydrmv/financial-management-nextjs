import { CalendarIcon, Clock } from "lucide-react";
import SectionHeader from "../common/section-header";
import EmptyState from "../common/empty-state";
import ExpenseCard from "../expenses/expense-card";
import { getTodayExpenses } from "@/lib/expenses/expense-select";
import { getCategoryById } from "@/lib/categories/category-select";

export default async function TodayExpenses() {
  const todayExpenses = await getTodayExpenses();

  const expensesWithCategory = await Promise.all(
    todayExpenses.map(async (expense) => {
      const category = await getCategoryById(expense.categoryId);

      return {
        ...expense,
        category,
      };
    }),
  );

  return (
    <section className="py-20 bg-muted/20">
      <div className="wrapper space-y-12">
        <SectionHeader
          title="Your Daily Spending"
          icon={Clock}
          description="Overview of your expenses in the last 24 hours"
        />
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
