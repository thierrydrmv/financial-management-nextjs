"use cache";

import SectionHeader from "@/components/common/section-header";
import ProductExplorer from "@/components/products/product-explorer";
import { getAllApprovedProducts } from "@/lib/products/product-select";
import { CompassIcon } from "lucide-react";

export default async function ExplorePage() {
  const products = await getAllApprovedProducts();

  return (
    <div className="py-20">
      <div className="wrapper">
        <div className="mb-12">
          <SectionHeader
            title="All Expenses"
            icon={CompassIcon}
            description="Browse and manage all your recorded expenses"
          />
          <ProductExplorer products={products} />
        </div>
      </div>
    </div>
  );
}
