import SectionHeader from "@/components/common/section-header";
import { PreviewModeBanner } from "@/components/demo/preview-mode-banner";
import ExpenseExplorer from "@/components/expenses/expense-explorer";
import { EXPENSE_LIST_PAGE_SIZE } from "@/lib/expenses/expense-list-constants";
import {
  getPreviewExpensesPaginated,
  PREVIEW_FILTER_CATEGORIES,
} from "@/lib/demo/preview-data";
import {
  countExpensesWithCategoryForUser,
  getCategoriesForUserExpenseFilters,
  getExpensesWithCategoryByUserPaginated,
  type ExpenseListFilters,
} from "@/lib/expenses/expense-select";
import { auth } from "@clerk/nextjs/server";
import { CompassIcon } from "lucide-react";

function parseExpenseListSearchParams(
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

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const { page: pageFromUrl, filters } = parseExpenseListSearchParams(raw);
  const { userId } = await auth();

  if (!userId) {
    const { expenses, totalCount, page } = getPreviewExpensesPaginated(
      filters,
      pageFromUrl,
      EXPENSE_LIST_PAGE_SIZE,
    );
    return (
      <div className="py-20">
        <div className="wrapper">
          <PreviewModeBanner />
          <div className="mb-12">
            <SectionHeader
              title="All Expenses"
              icon={CompassIcon}
              description="Browse and manage all your recorded expenses"
            />
          </div>
          <ExpenseExplorer
            expensesWithCategory={expenses}
            totalCount={totalCount}
            page={page}
            pageSize={EXPENSE_LIST_PAGE_SIZE}
            filterCategories={PREVIEW_FILTER_CATEGORIES}
            filters={filters}
          />
        </div>
      </div>
    );
  }

  const userIdSafe = userId as string;

  const totalCount = await countExpensesWithCategoryForUser(
    userIdSafe,
    filters,
  );
  const totalPages = Math.max(
    1,
    Math.ceil(totalCount / EXPENSE_LIST_PAGE_SIZE),
  );
  const page = Math.min(Math.max(1, pageFromUrl), totalPages);

  const [expensesWithCategory, filterCategories] = await Promise.all([
    getExpensesWithCategoryByUserPaginated(userIdSafe, filters, page),
    getCategoriesForUserExpenseFilters(userIdSafe),
  ]);

  return (
    <div className="py-20">
      <div className="wrapper">
        <div className="mb-12">
          <SectionHeader
            title="All Expenses"
            icon={CompassIcon}
            description="Browse and manage all your recorded expenses"
          />
          <ExpenseExplorer
            expensesWithCategory={expensesWithCategory}
            totalCount={totalCount}
            page={page}
            pageSize={EXPENSE_LIST_PAGE_SIZE}
            filterCategories={filterCategories}
            filters={filters}
          />
        </div>
      </div>
    </div>
  );
}
