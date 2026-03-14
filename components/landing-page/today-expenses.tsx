import { CalendarIcon, Clock } from "lucide-react";
import SectionHeader from "../common/section-header";
import ProductCard from "../products/product-card";
import EmptyState from "../common/empty-state";
import { getTodayProducts } from "@/lib/products/product-select";

export default async function TodayExpenses() {
  const recentlyLaunchedProducts = await getTodayProducts();

  return (
    <section className="py-20 bg-muted/20">
      <div className="wrapper space-y-12">
        <SectionHeader
          title="Your Daily Spending"
          icon={Clock}
          description="Overview of your expenses in the last 24 hours"
        />
        {recentlyLaunchedProducts.length > 0 ? (
          <div className="grid-wrapper">
            {recentlyLaunchedProducts.map((product) => (
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
