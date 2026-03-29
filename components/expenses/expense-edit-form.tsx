"use client";

import { DollarSign, Loader2Icon } from "lucide-react";
import { FormField } from "../forms/form-field";
import { Button } from "../ui/button";
import { Suspense, useActionState, useState } from "react";
import { FormState } from "@/types";
import { cn } from "@/lib/utils";
import { updateExpenseAction } from "@/lib/expenses/expense-actions";
import { sanitizeAmountInput } from "@/lib/expenses/amount-input";

const initialState: FormState = {
  success: false,
  errors: {},
  message: "",
};

interface ExpenseEditFormProps {
  categories: {
    id: number;
    name: string;
  }[];
  expense: {
    id: number;
    type: "income" | "expense";
    title: string;
    description?: string | null;
    amount: string;
    categoryId: number | null;
    expenseDate: Date;
    paymentMethod?: string | null;
    isRecurring?: boolean | null;
  };
}

export default function ExpenseEditForm({
  categories,
  expense,
}: ExpenseEditFormProps) {
  const [type, setType] = useState<"income" | "expense">(expense.type);
  const [date, setDate] = useState<Date | undefined>(
    expense.expenseDate ? new Date(expense.expenseDate) : undefined,
  );
  const [paymentMethod, setPaymentMethod] = useState(
    expense.paymentMethod || "",
  );
  const [category, setCategory] = useState(
    expense.categoryId?.toString() || "",
  );
  const [isRecurring, setIsRecurring] = useState(expense.isRecurring ?? false);
  const [amount, setAmount] = useState(() =>
    sanitizeAmountInput(String(expense.amount ?? "")),
  );

  const [state, formAction, isPending] = useActionState(
    updateExpenseAction,
    initialState,
  );

  const { errors, message, success } = state;

  const getFieldErrors = (fieldName: string): string[] => {
    if (!errors) return [];
    return (errors as Record<string, string[]>)[fieldName] ?? [];
  };

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id.toString(),
  }));

  return (
    <form className="space-y-6" action={formAction}>
      <input type="hidden" name="id" value={expense.id} />
      <input type="hidden" name="type" value={type} />

      {message && (
        <div
          className={cn(
            "p-4 rounded-lg border",
            success
              ? "bg-primary/10 border-primary text-primary"
              : "bg-destructive/10 border-destructive text-destructive",
          )}
        >
          {message}
        </div>
      )}

      <FormField
        label="Type"
        id="type"
        name="type"
        select
        options={[
          { label: "Expense", value: "expense" },
          { label: "Income", value: "income" },
        ]}
        selectValue={type}
        onValueChange={(value) => {
          const financeType: "income" | "expense" = value as
            | "income"
            | "expense";
          setType(financeType);
          if (financeType === "income") setCategory("");
        }}
        error={getFieldErrors("type")}
      />

      <FormField
        label="Finance Name"
        id="title"
        name="title"
        defaultValue={expense.title}
        required
        onChange={() => {}}
        error={getFieldErrors("title")}
      />

      <FormField
        label="Amount"
        id="amount"
        name="amount"
        value={amount}
        onChange={(e) => setAmount(sanitizeAmountInput(e.target.value))}
        required
        error={getFieldErrors("amount")}
      />

      {type === "expense" ? (
        <FormField
          label="Category"
          id="categoryId"
          name="categoryId"
          select
          options={categoryOptions}
          selectValue={category}
          onValueChange={setCategory}
          error={getFieldErrors("categoryId")}
        />
      ) : null}
      <input type="hidden" name="categoryId" value={category} />

      <Suspense fallback={<div>Loading calendar...</div>}>
        <FormField
          label="Finance Date"
          id="expenseDate"
          name="expenseDate"
          selectedDate={date}
          onSelectDate={setDate}
          error={getFieldErrors("expenseDate")}
          calendar
        />
      </Suspense>
      <input
        type="hidden"
        name="expenseDate"
        value={date ? date.toISOString() : ""}
      />

      <FormField
        label="Payment Method"
        id="paymentMethod"
        name="paymentMethod"
        select
        options={[
          { label: "Credit Card", value: "credit-card" },
          { label: "Debit Card", value: "debit-card" },
          { label: "Cash", value: "cash" },
          { label: "Pix", value: "pix" },
        ]}
        selectValue={paymentMethod}
        onValueChange={setPaymentMethod}
        error={getFieldErrors("paymentMethod")}
      />
      <input type="hidden" name="paymentMethod" value={paymentMethod} />

      <FormField
        label="Recurring"
        id="isRecurring"
        name="isRecurring"
        checkbox
        onCheckedChange={(checked) => setIsRecurring(checked === true)}
        defaultChecked={expense.isRecurring ?? false}
        error={[]}
      />
      <input
        type="hidden"
        name="isRecurring"
        value={isRecurring ? "true" : "false"}
      />

      <FormField
        label="Description"
        id="description"
        name="description"
        defaultValue={expense.description ?? ""}
        textarea
        onChange={() => {}}
        error={getFieldErrors("description")}
      />

      <Button type="submit" size="lg" className="w-full">
        {isPending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <>
            <DollarSign className="size-4" />
            Update Expense
          </>
        )}
      </Button>
    </form>
  );
}
