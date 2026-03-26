import SectionHeader from "@/components/common/section-header";
import ExpenseExplorer from "@/components/expenses/expense-explorer";
import { getAllExpensesWithCategoryByUser } from "@/lib/expenses/expense-select";
import { auth } from "@clerk/nextjs/server";
import { CompassIcon } from "lucide-react";

export default async function ExplorePage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    redirectToSignIn();
  }
  const userIdSafe = userId as string;
  const expensesWithCategory =
    await getAllExpensesWithCategoryByUser(userIdSafe);

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
