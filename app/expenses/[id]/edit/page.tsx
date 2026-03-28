import SectionHeader from "@/components/common/section-header";
import ExpenseEditForm from "@/components/expenses/expense-edit-form";
import { getAllCategories } from "@/lib/categories/category-select";
import { getExpenseByIdAndUser } from "@/lib/expenses/expense-select";
import { auth } from "@clerk/nextjs/server";
import { BanknoteArrowUp } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function EditExpenseContent({ id }: { id: string }) {
  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    redirectToSignIn();
  }
  if (!id || Number.isNaN(Number(id))) notFound();
  const userIdSafe = userId as string;

  const [categories, expense] = await Promise.all([
    getAllCategories(userIdSafe),
    getExpenseByIdAndUser(Number(id), userIdSafe),
  ]);

  if (!expense) notFound();

  return <ExpenseEditForm categories={categories} expense={expense} />;
}

export default async function EditPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  return (
    <section className="py-20">
      <div className="wrapper flex flex-col items-center">
        <div className="text-center">
          <SectionHeader
            title="Edit Expense"
            icon={BanknoteArrowUp}
            description="Update your expense information."
          />
        </div>

        <div className="max-w-2xl w-full">
          <Suspense fallback={<div>Loading expense...</div>}>
            <EditExpenseContent id={id} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
