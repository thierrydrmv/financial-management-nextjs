import { Card, CardContent } from "@/components/ui/card";
import { Group } from "lucide-react";
import { CategoryDeleteForm } from "./category-delete-form";
import { CategoryWithExpenseCount } from "@/lib/categories/category-select";
export default function CategoryList({
  categories,
}: {
  categories: CategoryWithExpenseCount[];
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
      <h2 className="text-lg font-semibold tracking-tight">Your categories</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {categories.map((cat) => (
          <li key={cat.id}>
            <Card className="py-0 shadow-none">
              <CardContent className="flex items-center gap-3 px-4 py-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Group
                    className="size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="truncate font-medium">{cat.name}</p>
                    {cat.createdAt ? (
                      <p className="text-xs text-muted-foreground">
                        Added{" "}
                        {new Date(cat.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    ) : null}
                  </div>
                </div>
                <CategoryDeleteForm
                  id={String(cat.id)}
                  disabled={cat.expenseCount > 0}
                />
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
