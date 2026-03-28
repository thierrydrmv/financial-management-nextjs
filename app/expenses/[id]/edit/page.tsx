import SectionHeader from "@/components/common/section-header";
import { PreviewModeBanner } from "@/components/demo/preview-mode-banner";
import ExpenseEditForm from "@/components/expenses/expense-edit-form";
import { ExpenseEditPreviewPlaceholder } from "@/components/expenses/expense-edit-preview-placeholder";
import { getPreviewExpenseById } from "@/lib/demo/preview-data";
import { getAllCategories } from "@/lib/categories/category-select";
import { getExpenseByIdAndUser } from "@/lib/expenses/expense-select";
import { auth } from "@clerk/nextjs/server";
import { BanknoteArrowUp } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

async function EditExpenseContent({ id }: { id: string }) {
  const { userId } = await auth();

  if (!id || Number.isNaN(Number(id))) notFound();
  const numId = Number(id);

  if (!userId) {
    const preview = getPreviewExpenseById(numId);
    if (!preview) redirect("/");
    return (
      <div className="w-full space-y-8">
        <PreviewModeBanner />
        <ExpenseEditPreviewPlaceholder expense={preview} />
      </div>
    );
  }

  const userIdSafe = userId as string;

  const [categories, expense] = await Promise.all([
    getAllCategories(userIdSafe),
    getExpenseByIdAndUser(numId, userIdSafe),
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

        <div className="w-full max-w-2xl">
          <Suspense fallback={<div>Loading expense...</div>}>
            <EditExpenseContent id={id} />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
