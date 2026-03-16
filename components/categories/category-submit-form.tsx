"use client";

import { Box, Loader2Icon } from "lucide-react";
import { FormField } from "../forms/form-field";
import { Button } from "../ui/button";
import { useActionState } from "react";
import { FormState } from "@/types";
import { cn } from "@/lib/utils";
import { addCategoryAction } from "@/lib/categories/category-actions";

const initialState: FormState = {
  success: false,
  errors: {},
  message: "",
};

export default function CategorySubmitForm() {
  const [state, formAction, isPending] = useActionState(
    addCategoryAction,
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
        label="Category Name"
        id="name"
        name="name"
        placeholder="Category..."
        required
        onChange={() => {}}
        error={getFieldErrors("name")}
      />
      <Button type="submit" size="lg" className="w-full">
        {isPending ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <>
            <Box className="size-4" />
            Submit Category
          </>
        )}
      </Button>
    </form>
  );
}
