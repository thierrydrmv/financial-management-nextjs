import SectionHeader from "@/components/common/section-header";
import ExpenseSubmitForm from "@/components/expenses/expense-submit-form";
import { getAllCategories } from "@/lib/categories/category-select";
import { BanknoteArrowUp } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function SubmitPage() {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    redirectToSignIn();
  }
  const userIdSafe = userId as string;
  const categories = await getAllCategories(userIdSafe);
  return (
    <section className="py-20">
      <div className="wrapper flex flex-col items-center">
        <div className="text-center">
          <SectionHeader
            title="Submit an Expense"
            icon={BanknoteArrowUp}
            description="Add a new expense to your records. It will help keep your financial overview up to date."
          />
        </div>
        <div className="max-w-2xl w-full">
          <ExpenseSubmitForm categories={categories} />
        </div>
      </div>
    </section>
  );
}
