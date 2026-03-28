import WeekExpenses from "@/components/landing-page/week-expenses";
import HeroSection from "@/components/landing-page/hero-section";
import TodayExpenses from "@/components/landing-page/today-expenses";
import ExpenseSkeleton from "@/components/expenses/expense-skeleton";
import { getLandingHeroPreviewStats } from "@/lib/demo/preview-data";
import { auth } from "@clerk/nextjs/server";
import { Suspense } from "react";
import MonthExpenses from "@/components/landing-page/month-expenses";

export default async function Home() {
  const { userId } = await auth();
  const heroPreview = !userId ? getLandingHeroPreviewStats() : null;

  return (
    <div>
      <HeroSection heroPreview={heroPreview} />
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
