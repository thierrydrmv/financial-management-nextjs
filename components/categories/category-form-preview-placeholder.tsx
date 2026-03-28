import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockIcon } from "lucide-react";

/** Non-functional form shell for the categories page when previewing signed out. */
export function CategoryFormPreviewPlaceholder() {
  return (
    <div className="rounded-xl border border-dashed border-muted-foreground/35 bg-muted/20 p-6">
      <div className="mb-4 flex items-start gap-2 text-sm text-muted-foreground">
        <LockIcon className="size-4 mt-0.5 shrink-0" aria-hidden />
        <p>
          <span className="font-medium text-foreground">Sign in</span> to create
          and manage real categories. The fields below are a static preview
          only.
        </p>
      </div>
      <div className="grid gap-4 opacity-60 pointer-events-none">
        <Input placeholder="Category name (demo)" disabled readOnly />
        <Button type="button" disabled className="w-full sm:w-auto">
          Add category
        </Button>
      </div>
    </div>
  );
}
