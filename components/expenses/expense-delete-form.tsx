import { Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { deleteExpenseAction } from "@/lib/expenses/expense-actions";

export function ExpenseDeleteForm({ id }: { id: string }) {
  return (
    <form action={deleteExpenseAction}>
      <input type="hidden" name="id" value={id} />
      <Button
        type="submit"
        variant="outline"
        className="w-full cursor-pointer hover:border-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
      >
        <Trash2Icon className="size-4 mr-2" />
        Delete
      </Button>
    </form>
  );
}
