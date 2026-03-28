import CategoryList from "@/components/categories/category-list";
import { CategoryFormPreviewPlaceholder } from "@/components/categories/category-form-preview-placeholder";
import CategorySubmitForm from "@/components/categories/category-submit-form";
import SectionHeader from "@/components/common/section-header";
import { PreviewModeBanner } from "@/components/demo/preview-mode-banner";
import { getPreviewCategoriesWithCount } from "@/lib/demo/preview-data";
import { getAllCategoriesWithExpenseCount } from "@/lib/categories/category-select";
import { auth } from "@clerk/nextjs/server";
import { SparkleIcon } from "lucide-react";

export default async function Categories() {
  const { userId } = await auth();

  if (!userId) {
    const previewCategoriesWithCount = getPreviewCategoriesWithCount();
    return (
      <section className="py-20">
        <div className="wrapper flex flex-col items-center">
          <div className="w-full max-w-2xl space-y-10">
            <PreviewModeBanner />
            <div className="text-center">
              <SectionHeader
                title="Add a category"
                icon={SparkleIcon}
                description="Categories allow you to group your expenses and understand where your money goes."
              />
            </div>
            <CategoryFormPreviewPlaceholder />
            <div className="border-t pt-10">
              <CategoryList
                categories={previewCategoriesWithCount}
                previewMode
              />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const userIdSafe = userId as string;
  const categories = await getAllCategoriesWithExpenseCount(userIdSafe);

  return (
    <section className="py-20">
      <div className="wrapper flex flex-col items-center">
        <div className="text-center">
          <SectionHeader
            title="Add a category"
            icon={SparkleIcon}
            description="Categories allow you to group your expenses and understand where your money goes."
          />
        </div>
        <div className="w-full max-w-2xl space-y-12">
          <CategorySubmitForm />
          <div className="border-t pt-10">
            <CategoryList categories={categories} />
          </div>
        </div>
      </div>
    </section>
  );
}
