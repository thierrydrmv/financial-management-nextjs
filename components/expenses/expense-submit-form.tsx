"use client";

import { DollarSign, Loader2Icon } from "lucide-react";
import { FormField } from "../forms/form-field";
import { Button } from "../ui/button";
import { addProductAction } from "@/lib/products/product-actions";
import { Suspense, useActionState } from "react";
import { FormState } from "@/types";
import { cn } from "@/lib/utils";

const initialState: FormState = {
  success: false,
  errors: {},
  message: "",
};

export default function ExpenseSubmitForm() {
  const [state, formAction, isPending] = useActionState(
    addProductAction,
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
        label="Category"
        id="categoryId"
        name="categoryId"
        placeholder="Choose a category..."
        required
        onChange={() => {}}
        error={getFieldErrors("categoryId")}
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

      <FormField
        label="Amount"
        id="amount"
        name="amount"
        placeholder="$20,00..."
        required
        onChange={() => {}}
        error={getFieldErrors("amount")}
      />
      <Suspense fallback={<div>Loading calendar...</div>}>
        <FormField
          label="Expense Date"
          id="expenseDate"
          name="expenseDate"
          placeholder="21/03/2026..."
          required
          onChange={() => {}}
          error={getFieldErrors("expenseDate")}
          calendar
        />
      </Suspense>
      <FormField
        label="Expense Date"
        id="paymentMethod"
        name="paymentMethod"
        placeholder="Credit Card | Debit | Cash | Pix..."
        required
        onChange={() => {}}
        error={getFieldErrors("paymentMethod")}
      />
      <FormField
        label="Recurring"
        id="isRecurring"
        name="isRecurring"
        placeholder=""
        required
        onChange={() => {}}
        error={getFieldErrors("isRecurring")}
        checkbox
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
