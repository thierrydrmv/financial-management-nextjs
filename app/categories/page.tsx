import CategoryList from "@/components/categories/category-list";
import CategorySubmitForm from "@/components/categories/category-submit-form";
import SectionHeader from "@/components/common/section-header";
import { getAllCategoriesWithExpenseCount } from "@/lib/categories/category-select";
import { SparkleIcon } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function Categories() {
  const { userId, orgId, redirectToSignIn } = await auth();

  if (!userId) {
    redirectToSignIn();
  }
  const userIdSafe = userId as string;
  const categories = await getAllCategoriesWithExpenseCount(
    userIdSafe,
    orgId ?? null,
  );

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
            <CategoryList
              categories={categories}
              hasOrganization={Boolean(orgId)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
