import SectionHeader from "@/components/common/section-header";
import ExpenseEditForm from "@/components/expenses/expense-edit-form";
import { getAllCategories } from "@/lib/categories/category-select";
import { getExpenseByIdAndUser } from "@/lib/expenses/expense-select";
import { auth } from "@clerk/nextjs/server";
import { BanknoteArrowUp } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

export async function generateStaticParams() {
  const categories = await getAllCategories();

  return categories.slice(0, 1).map((expense) => ({
    id: String(expense.id),
  }));
}

async function EditExpenseContent({ id }: { id: string }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }
  const [categories, expense] = await Promise.all([
    getAllCategories(),
    getExpenseByIdAndUser(Number(id), userId),
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
