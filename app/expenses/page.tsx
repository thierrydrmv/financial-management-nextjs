import SectionHeader from "@/components/common/section-header";
import ExpenseExplorer from "@/components/expenses/expense-explorer";
import { getAllExpensesWithCategoryByUser } from "@/lib/expenses/expense-select";
import { auth } from "@clerk/nextjs/server";
import { CompassIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ExplorePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const expensesWithCategory = await getAllExpensesWithCategoryByUser(userId);

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
