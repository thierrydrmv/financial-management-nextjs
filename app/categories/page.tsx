import CategorySubmitForm from "@/components/categories/category-submit-form";
import SectionHeader from "@/components/common/section-header";
import { SparkleIcon } from "lucide-react";

export default function Categories() {
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
        <div className="max-w-2xl w-full">
          <CategorySubmitForm />
        </div>
      </div>
    </section>
  );
}
