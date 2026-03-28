"use client";

import type { ExpenseListFilters } from "@/lib/expenses/expense-select";
import { SearchIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { cn } from "@/lib/utils";
import { ExpenseWithCategory } from "@/types";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import ExpenseCard from "./expense-card";
import ExpenseExplorerCardsSkeleton from "./expense-explorer-cards-skeleton";

type FilterCategory = { id: number; name: string; createdAt: Date | null };

function buildExpenseListUrl(
  pathname: string,
  state: {
    page: number;
    search: string;
    type: ExpenseListFilters["type"];
    categoryName: string | null;
  },
) {
  const params = new URLSearchParams();
  if (state.page > 1) params.set("page", String(state.page));
  if (state.search.trim()) params.set("q", state.search.trim());
  if (state.type !== "all") params.set("type", state.type);
  if (state.categoryName) params.set("category", state.categoryName);
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Compact page list with ellipses when there are many pages. */
function getPaginationRange(
  current: number,
  total: number,
): Array<number | "ellipsis"> {
  if (total <= 9) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const out: Array<number | "ellipsis"> = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i]!;
    if (i > 0 && n - sorted[i - 1]! > 1) {
      out.push("ellipsis");
    }
    out.push(n);
  }
  return out;
}

function ExpenseSearchField({
  searchFromUrl,
  onCommit,
}: {
  searchFromUrl: string;
  onCommit: (search: string) => void;
}) {
  const [value, setValue] = useState(searchFromUrl);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const trimmed = value.trim();
      const current = searchFromUrl.trim();
      if (trimmed === current) return;
      onCommit(value);
    }, 400);
    return () => window.clearTimeout(t);
  }, [value, searchFromUrl, onCommit]);

  return (
    <div className="flex-1 relative">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
      <Input
        type="text"
        placeholder="Search Expenses..."
        className="pl-10"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export default function ExpenseExplorer({
  expensesWithCategory,
  totalCount,
  page: currentPage,
  pageSize,
  filterCategories,
  filters,
  isPreview = false,
}: {
  expensesWithCategory: ExpenseWithCategory[];
  totalCount: number;
  page: number;
  pageSize: number;
  filterCategories: FilterCategory[];
  filters: ExpenseListFilters;
  /** Demo data: filters/search don’t update the URL; cards still link to detail preview. */
  isPreview?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isListPending, startListTransition] = useTransition();

  const navigate = useCallback(
    (
      updates: Partial<
        ExpenseListFilters & {
          page: number;
        }
      >,
    ) => {
      if (isPreview) return;
      const next = {
        page: currentPage,
        search: filters.search,
        type: filters.type,
        categoryName: filters.categoryName,
        ...updates,
      };
      startListTransition(() => {
        router.replace(buildExpenseListUrl(pathname, next), { scroll: false });
      });
    },
    [currentPage, filters, isPreview, pathname, router],
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const effectivePage = Math.min(Math.max(1, currentPage), totalPages);

  const rangeStart = totalCount === 0 ? 0 : (effectivePage - 1) * pageSize + 1;
  const rangeEnd = Math.min(effectivePage * pageSize, totalCount);

  const categoryButtons = useMemo(
    () =>
      filterCategories.map((category) => (
        <Button
          key={category.id}
          onClick={() => {
            navigate({
              categoryName: category.name,
              page: 1,
            });
          }}
          variant={
            filters.categoryName === category.name ? "default" : "outline"
          }
        >
          {category.name}
        </Button>
      )),
    [filterCategories, filters.categoryName, navigate],
  );

  const previewControlsClass = isPreview
    ? "pointer-events-none select-none opacity-90"
    : "";

  return (
    <div data-preview={isPreview ? "true" : undefined}>
      {isPreview ? (
        <p className="mb-6 text-center text-xs font-medium text-muted-foreground">
          Sample data — click a card to view details. Sign in to use search,
          filters, and your real expenses.
        </p>
      ) : null}
      <div
        className={cn(
          "mb-8 flex flex-col gap-4 sm:flex-row",
          previewControlsClass,
        )}
      >
        <ExpenseSearchField
          key={filters.search}
          searchFromUrl={filters.search}
          onCommit={(search) => navigate({ search, page: 1 })}
        />
      </div>
      <div className={cn("mb-4 flex flex-wrap gap-2", previewControlsClass)}>
        <Button
          onClick={() => {
            navigate({ type: "all", page: 1 });
          }}
          variant={filters.type === "all" ? "default" : "outline"}
        >
          All Types
        </Button>
        <Button
          onClick={() => {
            navigate({ type: "expense", page: 1 });
          }}
          variant={filters.type === "expense" ? "default" : "outline"}
        >
          Expenses
        </Button>
        <Button
          onClick={() => {
            navigate({ type: "income", page: 1 });
          }}
          variant={filters.type === "income" ? "default" : "outline"}
        >
          Income
        </Button>
      </div>
      <div className={cn("mb-8 flex flex-wrap gap-2", previewControlsClass)}>
        <Button
          onClick={() => {
            navigate({ categoryName: null, page: 1 });
          }}
          variant={!filters.categoryName ? "default" : "outline"}
        >
          All
        </Button>

        {categoryButtons}
      </div>
      <div className="mb-6">
        <p
          className={`text-sm text-muted-foreground transition-opacity ${isListPending ? "opacity-50" : ""}`}
        >
          {totalCount === 0 ? (
            <>No finance entries match your filters.</>
          ) : (
            <>
              Showing {rangeStart}–{rangeEnd} of {totalCount} finance entries
            </>
          )}
        </p>
      </div>
      {isListPending ? (
        <ExpenseExplorerCardsSkeleton count={pageSize} />
      ) : (
        <div className="grid-wrapper">
          {expensesWithCategory.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              category={expense.category}
            />
          ))}
        </div>
      )}
      {totalPages > 1 ? (
        <Pagination
          className={cn(
            "mt-10 transition-opacity",
            isListPending && "pointer-events-none opacity-50",
            isPreview && "pointer-events-none opacity-90",
          )}
        >
          <PaginationContent className="flex-wrap justify-center gap-1">
            <PaginationItem>
              <PaginationPrevious
                href="#"
                className={
                  effectivePage <= 1
                    ? "pointer-events-none opacity-40"
                    : undefined
                }
                onClick={(e) => {
                  e.preventDefault();
                  navigate({ page: Math.max(1, effectivePage - 1) });
                }}
              />
            </PaginationItem>
            {getPaginationRange(effectivePage, totalPages).map((item, idx) =>
              item === "ellipsis" ? (
                <PaginationItem key={`e-${idx}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href="#"
                    size="default"
                    className="min-w-9"
                    isActive={item === effectivePage}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate({ page: item });
                    }}
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}
            <PaginationItem>
              <PaginationNext
                href="#"
                className={
                  effectivePage >= totalPages
                    ? "pointer-events-none opacity-40"
                    : undefined
                }
                onClick={(e) => {
                  e.preventDefault();
                  navigate({
                    page: Math.min(totalPages, effectivePage + 1),
                  });
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
