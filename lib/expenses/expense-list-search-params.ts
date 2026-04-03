import type { ExpenseListFilters } from "@/lib/expenses/expense-select";

/**
 * Maps URL search params (`page`, `q`, `type`, `category`) to a safe page index and
 * {@link ExpenseListFilters} for the expense list / explorer.
 */
export function parseExpenseListSearchParams(
  raw: Record<string, string | string[] | undefined>,
): { page: number; filters: ExpenseListFilters } {
  const pageRaw = typeof raw.page === "string" ? parseInt(raw.page, 10) : 1;
  const pageParsed =
    Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;

  const searchQuery = typeof raw.q === "string" ? raw.q : "";
  const typeRaw = typeof raw.type === "string" ? raw.type : "all";
  const expenseType: ExpenseListFilters["type"] =
    typeRaw === "expense" || typeRaw === "income" ? typeRaw : "all";

  const categoryName =
    typeof raw.category === "string" && raw.category.length > 0
      ? raw.category
      : null;

  return {
    page: pageParsed,
    filters: {
      type: expenseType,
      search: searchQuery,
      categoryName,
    },
  };
}
