import WeekExpenses from "@/components/landing-page/week-expenses";
import HeroSection from "@/components/landing-page/hero-section";
import TodayExpenses from "@/components/landing-page/today-expenses";
import ProductSkeleton from "@/components/products/product-skeleton";
import { Suspense } from "react";
import MonthExpenses from "@/components/landing-page/month-expenses";

export default function Home() {
  return (
    <div>
      <HeroSection />
      <Suspense fallback={<ProductSkeleton />}>
        <TodayExpenses />
      </Suspense>
      <Suspense fallback={<ProductSkeleton />}>
        <WeekExpenses />
      </Suspense>
      <Suspense fallback={<ProductSkeleton />}>
        <MonthExpenses />
      </Suspense>
    </div>
  );
}
