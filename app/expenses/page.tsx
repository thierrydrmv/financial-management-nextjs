"use cache";

import SectionHeader from "@/components/common/section-header";
import ExpenseExplorer from "@/components/expenses/expense-explorer";
import { getAllExpensesWithCategory } from "@/lib/expenses/expense-select";
import { CompassIcon } from "lucide-react";

export default async function ExplorePage() {
  const expensesWithCategory = await getAllExpensesWithCategory();

  return (
    <div className="py-20">
      <div className="wrapper">
        <div className="mb-12">
          <SectionHeader
            title="All Expenses"
            icon={CompassIcon}
            description="Browse and manage all your recorded expenses"
          />
          <ExpenseExplorer expensesWithCategory={expensesWithCategory} />
        </div>
      </div>
    </div>
  );
}
