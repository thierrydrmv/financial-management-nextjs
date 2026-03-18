import WeekExpenses from "@/components/landing-page/week-expenses";
import HeroSection from "@/components/landing-page/hero-section";
import TodayExpenses from "@/components/landing-page/today-expenses";
import ExpenseSkeleton from "@/components/expenses/expense-skeleton";
import { Suspense } from "react";
import MonthExpenses from "@/components/landing-page/month-expenses";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <Suspense fallback={<ExpenseSkeleton />}>
        <TodayExpenses />
      </Suspense>
      <Suspense fallback={<ExpenseSkeleton />}>
        <WeekExpenses />
      </Suspense>
      <Suspense fallback={<ExpenseSkeleton />}>
        <MonthExpenses />
      </Suspense>
    </div>
  );
}
