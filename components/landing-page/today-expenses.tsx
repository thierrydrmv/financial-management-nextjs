import { LandingAuthPromo } from "@/components/landing-page/landing-auth-promo";
import { CalendarIcon, Clock } from "lucide-react";
import SectionHeader from "../common/section-header";
import EmptyState from "../common/empty-state";
import ExpenseCard from "../expenses/expense-card";
import { getTodayExpensesByUser } from "@/lib/expenses/expense-select";
import { auth } from "@clerk/nextjs/server";

export default async function TodayExpenses() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <section className="py-20 bg-muted/20">
        <div className="wrapper">
          <LandingAuthPromo
            headline="Know what you spend today—before the day ends"
            subheadline="Wealth Track helps you capture income and expenses as they happen, so you always see the full picture of your daily money flow."
          />
        </div>
      </section>
    );
  }
  const userIdSafe = userId as string;
  const todayExpenses = await getTodayExpensesByUser(userIdSafe);

  return (
    <section className="py-20 bg-muted/20">
      <div className="wrapper space-y-12">
        <SectionHeader
          title="Your Daily Spending"
          icon={Clock}
          description="Overview of your expenses in the last 24 hours"
        />
        {todayExpenses.length > 0 ? (
          <div className="grid-wrapper">
            {todayExpenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                category={expense.category ?? undefined}
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
