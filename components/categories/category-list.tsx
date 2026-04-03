import { Card, CardContent } from "@/components/ui/card";
import { TagIcon } from "lucide-react";
import { CategoryDeleteForm } from "./category-delete-form";
import { CategoryWithExpenseCount } from "@/lib/categories/category-select";
export default function CategoryList({
  categories,
  previewMode = false,
}: {
  categories: CategoryWithExpenseCount[];
  /** Demo list: no delete actions. */
  previewMode?: boolean;
}) {
  if (categories.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No categories yet. Add your first one above.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">
        {previewMode ? "Sample categories" : "Your categories"}
      </h2>
      {previewMode ? (
        <p className="text-xs text-muted-foreground">
          Illustrative labels only — sign in to create your own.
        </p>
      ) : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Card className="py-0 shadow-none">
              <CardContent className="flex items-center gap-3 px-4 py-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <TagIcon
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{category.name}</p>
                    {category.createdAt ? (
                      <p className="text-xs text-muted-foreground">
                        Added{" "}
                        {new Date(category.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>
                {previewMode ? null : (
                  <CategoryDeleteForm
                    id={String(category.id)}
                    disabled={category.expenseCount > 0}
                    title={
                      category.expenseCount > 0
                        ? "Cannot delete a category that is still used by expenses."
                        : undefined
                    }
                  />
                )}
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
