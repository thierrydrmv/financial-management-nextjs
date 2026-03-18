"use client";

import { SearchIcon } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ExpenseWithCategory } from "@/types";
import { useMemo, useState } from "react";
import ExpenseCard from "./expense-card";

export default function ExpenseExplorer({
  expensesWithCategory,
}: {
  expensesWithCategory: ExpenseWithCategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const filteredExpenses = useMemo(() => {
    let filtered = [...expensesWithCategory];

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
  }, [expensesWithCategory, searchQuery, selectedCategory]);

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
            placeholder="Search Products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setSelectedCategory(null)}
            variant={!selectedCategory ? "default" : "outline"}
          >
            All
          </Button>

          {categories.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.name)}
              variant={
                selectedCategory === category.name ? "default" : "outline"
              }
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredExpenses.length} expenses
        </p>
      </div>
      <div className="grid-wrapper">
        {filteredExpenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            category={expense.category}
          />
        ))}
      </div>
    </div>
  );
}
