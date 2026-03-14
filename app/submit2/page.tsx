import SectionHeader from "@/components/common/section-header";
import ProductSubmitForm from "@/components/products/product-submit-form";
import { SparkleIcon } from "lucide-react";

export default function SubmitPage() {
  return (
    <section className="py-20">
      <div className="wrapper flex flex-col items-center">
        <div className="mb-12 text-center">
          <SectionHeader
            title="Submit Your Project"
            icon={SparkleIcon}
            description="Share your creation with the community. Your submission will be reviewed before going live."
          />
        </div>
        <div className="max-w-2xl w-full">
          <ProductSubmitForm />
        </div>
      </div>
    </section>
  );
}
