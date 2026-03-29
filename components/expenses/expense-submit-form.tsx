"use client";

import { DollarSign, Loader2Icon } from "lucide-react";
import { FormField } from "../forms/form-field";
import { Button } from "../ui/button";
import {
  Suspense,
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FormState } from "@/types";
import { cn } from "@/lib/utils";
import { addExpenseAction } from "@/lib/expenses/expense-actions";
import { sanitizeAmountInput } from "@/lib/expenses/amount-input";

const initialState: FormState = {
  success: false,
  errors: {},
  message: "",
};

/** DOM order for scrolling to the first field error (matches form layout). */
const FIELD_SCROLL_ORDER = [
  "title",
  "type",
  "amount",
  "categoryId",
  "expenseDate",
  "paymentMethod",
  "description",
  "isRecurring",
] as const;

interface ExpenseSubmitFormProps {
  categories: {
    id: number;
    name: string;
  }[];
}

export default function ExpenseSubmitForm({
  categories,
}: ExpenseSubmitFormProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [category, setCategory] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  /** Bumps on successful submit so the form remounts and uncontrolled fields reset. */
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, isPending] = useActionState(
    addExpenseAction,
    initialState,
  );

  const alertRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!state.success) return;
    queueMicrotask(() => {
      setType("expense");
      setDate(undefined);
      setPaymentMethod("");
      setCategory("");
      setIsRecurring(false);
      setAmount("");
      setTitle("");
      setDescription("");
      setFormKey((k) => k + 1);
    });
  }, [state.success]);

  const { errors, message, success } = state;

  useLayoutEffect(() => {
    if (!state.message?.trim()) return;

    if (state.success) {
      alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const fieldErrors = state.errors as
      | Record<string, string[] | undefined>
      | undefined;
    if (fieldErrors) {
      for (const field of FIELD_SCROLL_ORDER) {
        const list = fieldErrors[field];
        if (Array.isArray(list) && list.length > 0) {
          const el = document.querySelector<HTMLElement>(
            `[data-field="${field}"]`,
          );
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            return;
          }
        }
      }
    }

    alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [state]);
  const getFieldErrors = (fieldName: string): string[] => {
    if (!errors) return [];
    return (errors as Record<string, string[]>)[fieldName] ?? [];
  };

  // Only block on load when there are zero categories (must create one first).
  // Once at least one category exists, no inline error until submit (server validation).
  const serverCategoryErrors = getFieldErrors("categoryId");
  const localCategoryErrors: string[] =
    type === "expense" && categories.length === 0
      ? ["No categories available. Create one first."]
      : [];
  const categoryFieldErrors =
    serverCategoryErrors.length > 0
      ? serverCategoryErrors
      : localCategoryErrors;

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id.toString(),
  }));

  return (
    <div className="space-y-6">
      {message && (
        <div
          ref={alertRef}
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
      <form key={formKey} className="space-y-6" action={formAction}>
      <FormField
        label="Name"
        id="title"
        name="title"
        placeholder="My finance entry..."
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={getFieldErrors("title")}
      />
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
          const nextType = value as "expense" | "income";
          setType(nextType);
          if (nextType === "income") setCategory("");
        }}
        error={getFieldErrors("type")}
      />
      <input type="hidden" name="type" value={type} />
      <FormField
        label="Amount"
        id="amount"
        name="amount"
        placeholder="$20,00..."
        required
        inputMode="decimal"
        value={amount}
        onChange={(e) => setAmount(sanitizeAmountInput(e.target.value))}
        error={getFieldErrors("amount")}
      />
      {type === "expense" ? (
        <FormField
          label="Category"
          id="categoryId"
          name="categoryId"
          placeholder="Choose a category..."
          required
          select
          options={categoryOptions}
          selectValue={category}
          onValueChange={setCategory}
          error={categoryFieldErrors}
        />
      ) : null}
      <input
        type="hidden"
        name="categoryId"
        value={type === "expense" ? category : ""}
      />
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
        onCheckedChange={(checked) => setIsRecurring(checked === true)}
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
        placeholder="Tell us more about your expense..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
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
    </div>
  );
}
