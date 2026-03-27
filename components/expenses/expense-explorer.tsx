"use client";

import { SearchIcon } from "lucide-react";
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
import { ExpenseWithCategory } from "@/types";
import { useMemo, useState } from "react";
import ExpenseCard from "./expense-card";

const PAGE_SIZE = 21;

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

export default function ExpenseExplorer({
  expensesWithCategory,
}: {
  expensesWithCategory: ExpenseWithCategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    "all" | "expense" | "income"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const filteredExpenses = useMemo(() => {
    let filtered = [...expensesWithCategory];

    if (selectedType !== "all") {
      filtered = filtered.filter((expense) => expense.type === selectedType);
    }

    if (searchQuery.trim().length > 0) {
      filtered = filtered.filter((expense) =>
        expense.title.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (expense) => expense.category?.name === selectedCategory,
      );
    }

    return filtered;
  }, [expensesWithCategory, searchQuery, selectedCategory, selectedType]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredExpenses.length / PAGE_SIZE),
  );
  const effectivePage = Math.min(Math.max(1, page), totalPages);

  const paginatedExpenses = useMemo(() => {
    const start = (effectivePage - 1) * PAGE_SIZE;
    return filteredExpenses.slice(start, start + PAGE_SIZE);
  }, [filteredExpenses, effectivePage]);

  const rangeStart =
    filteredExpenses.length === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(effectivePage * PAGE_SIZE, filteredExpenses.length);

  const categories = useMemo(() => {
    const unique = new Map();

    expensesWithCategory.forEach((expense) => {
      if (expense.category) {
        unique.set(expense.category.id, expense.category);
      }
    });

    return Array.from(unique.values());
  }, [expensesWithCategory]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <Input
            type="text"
            placeholder="Search Expenses..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>
      <div className="mb-4 flex gap-2 flex-wrap">
        <Button
          onClick={() => {
            setSelectedType("all");
            setPage(1);
          }}
          variant={selectedType === "all" ? "default" : "outline"}
        >
          All Types
        </Button>
        <Button
          onClick={() => {
            setSelectedType("expense");
            setPage(1);
          }}
          variant={selectedType === "expense" ? "default" : "outline"}
        >
          Expenses
        </Button>
        <Button
          onClick={() => {
            setSelectedType("income");
            setPage(1);
          }}
          variant={selectedType === "income" ? "default" : "outline"}
        >
          Income
        </Button>
      </div>
      <div className="mb-8 flex gap-2 flex-wrap">
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setPage(1);
          }}
          variant={!selectedCategory ? "default" : "outline"}
        >
          All
        </Button>

        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.name);
              setPage(1);
            }}
            variant={selectedCategory === category.name ? "default" : "outline"}
          >
            {category.name}
          </Button>
        ))}
      </div>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          {filteredExpenses.length === 0 ? (
            <>No finance entries match your filters.</>
          ) : (
            <>
              Showing {rangeStart}–{rangeEnd} of {filteredExpenses.length}{" "}
              finance entries
            </>
          )}
        </p>
      </div>
      <div className="grid-wrapper">
        {paginatedExpenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            category={expense.category}
          />
        ))}
      </div>
      {totalPages > 1 ? (
        <Pagination className="mt-10">
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
                  setPage(Math.max(1, effectivePage - 1));
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
                      setPage(item);
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
                  setPage(Math.min(totalPages, effectivePage + 1));
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      ) : null}
    </div>
  );
}
