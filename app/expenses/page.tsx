import SectionHeader from "@/components/common/section-header";
import { PreviewModeBanner } from "@/components/demo/preview-mode-banner";
import ExpenseExplorer from "@/components/expenses/expense-explorer";
import { EXPENSE_LIST_PAGE_SIZE } from "@/lib/expenses/expense-list-constants";
import {
  getPreviewExpensesPaginated,
  PREVIEW_FILTER_CATEGORIES,
} from "@/lib/demo/preview-data";
import { parseExpenseListSearchParams } from "@/lib/expenses/expense-list-search-params";
import {
  countExpensesWithCategoryForUser,
  getCategoriesForUserExpenseFilters,
  getExpensesWithCategoryByUserPaginated,
} from "@/lib/expenses/expense-select";
import { auth } from "@clerk/nextjs/server";
import { CompassIcon } from "lucide-react";

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
              title="All Incomes and Expenses"
              icon={CompassIcon}
              description="Browse and manage all your recorded incomes and expenses"
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
            title="All Incomes and Expenses"
            icon={CompassIcon}
            description="Browse and manage all your recorded incomes and expenses"
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
