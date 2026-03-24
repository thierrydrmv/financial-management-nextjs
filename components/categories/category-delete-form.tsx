"use client";
import { Trash2Icon } from "lucide-react";
import { useActionState } from "react";
import { Button } from "../ui/button";
import { deleteCategoryAction } from "@/lib/categories/category-actions";
import { FormState } from "@/types";
import { cn } from "@/lib/utils";
const initialState: FormState = {
  success: false,
  errors: {},
  message: "",
};
export function CategoryDeleteForm({
  id,
  disabled = false,
}: {
  id: string;
  disabled?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    deleteCategoryAction,
    initialState,
  );

  const isDisabled = disabled || isPending;

  const { message, success } = state;
  return (
    <form action={formAction} className="shrink-0 space-y-2">
      <input type="hidden" name="id" value={id} />
      {message ? (
        <div
          className={cn(
            "rounded-md border px-3 py-2 text-xs",
            success
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-destructive/30 bg-destructive/10 text-destructive",
          )}
          role="alert"
          aria-live="polite"
        >
          {message}
        </div>
      ) : null}
      <Button
        type="submit"
        variant="outline"
        size="icon"
        disabled={isDisabled}
        className="cursor-pointer hover:border-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
      >
        <Trash2Icon className="size-4" />
      </Button>
    </form>
  );
}
