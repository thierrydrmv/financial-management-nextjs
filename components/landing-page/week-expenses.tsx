import { ArrowUpRightIcon, CalendarIcon, DollarSign } from "lucide-react";
import SectionHeader from "../common/section-header";
import { Button } from "../ui/button";
import Link from "next/link";
import ProductCard from "../products/product-card";
import { getFeaturedProducts } from "@/lib/products/product-select";
import EmptyState from "../common/empty-state";

export default async function WeekExpenses() {
  const featuredProducts = await getFeaturedProducts();

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
        {featuredProducts.length > 0 ? (
          <div className="grid-wrapper">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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
