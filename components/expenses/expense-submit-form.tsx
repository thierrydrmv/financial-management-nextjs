"use client";

import { DollarSign, Loader2Icon } from "lucide-react";
import { FormField } from "../forms/form-field";
import { Button } from "../ui/button";
import { Suspense, useActionState, useState } from "react";
import { FormState } from "@/types";
import { cn } from "@/lib/utils";
import { addExpenseAction } from "@/lib/expenses/expense-actions";

const initialState: FormState = {
  success: false,
  errors: {},
  message: "",
};

export default function ExpenseSubmitForm() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [state, formAction, isPending] = useActionState(
    addExpenseAction,
    initialState,
  );

  const { errors, message, success } = state;
  const getFieldErrors = (fieldName: string): string[] => {
    if (!errors) return [];
    return (errors as Record<string, string[]>)[fieldName] ?? [];
  };

  return (
    <form className="space-y-6" action={formAction}>
      {message && (
        <div
          className={cn(
            "p-4 rounded-lg border",
            success
              ? "bg-primary/10 border-primary text-primary"
              : "bg-destructive/10 border-destructive text-destructive",
          )}
          role="alert"
          aria-live="polite"
        >
          {message}
        </div>
      )}
      <FormField
        label="Expense Name"
        id="title"
        name="title"
        placeholder="My expense..."
        required
        onChange={() => {}}
        error={getFieldErrors("title")}
      />
      <FormField
        label="Amount"
        id="amount"
        name="amount"
        placeholder="$20,00..."
        required
        onChange={() => {}}
        error={getFieldErrors("amount")}
      />
      <FormField
        label="Category"
        id="categoryId"
        name="categoryId"
        placeholder="Choose a category..."
        required
        onChange={() => {}}
        error={getFieldErrors("categoryId")}
      />
      <Suspense fallback={<div>Loading calendar...</div>}>
        <FormField
          label="Expense Date"
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
        placeholder="Select payment method"
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
        onCheckedChange={(checked) => console.log(checked)}
        error={[]}
      />
      <FormField
        label="Description"
        id="description"
        name="description"
        placeholder="Tell us more about your expense..."
        required
        onChange={() => {}}
        error={getFieldErrors("description")}
        textarea
      />
      <Button type="submit" size="lg" className="w-full">
        {isPending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <>
            <DollarSign className="size-4" />
            Submit Expense
          </>
        )}
      </Button>
    </form>
  );
}
