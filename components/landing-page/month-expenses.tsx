import { getFeaturedProducts } from "@/lib/products/product-select";
import SectionHeader from "../common/section-header";
import { ArrowUpRightIcon, Calendar, CalendarIcon } from "lucide-react";
import ProductCard from "../products/product-card";
import { Button } from "../ui/button";
import Link from "next/link";
import EmptyState from "../common/empty-state";

export default async function MonthExpenses() {
  const featuredProducts = await getFeaturedProducts();

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
