"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { expenseSchema } from "./expense-validations";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import z from "zod";
import { FormState } from "@/types";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export const addExpenseAction = async (
  _prevState: FormState,
  formData: FormData,
) => {
  try {
    const { userId, orgId } = await auth();

    if (!userId)
      return {
        success: false,
        message: "You must be signed in to submit a expense.",
        errors: undefined,
      };

    if (!orgId)
      return {
        success: false,
        message: "You must be a member of an organization to submit a expense.",
        errors: undefined,
      };

    // data
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress || "anonymous";
    const rawFormData = Object.fromEntries(formData.entries());

    console.log(formData);

    // validate the data
    const validatedData = expenseSchema.safeParse(rawFormData);
    if (!validatedData.success) {
      return {
        success: false,
        errors: validatedData.error.flatten().fieldErrors,
        message: "Invalid data",
      };
    }
    const {
      title,
      categoryId,
      amount,
      description,
      expenseDate,
      paymentMethod,
      isRecurring,
    } = validatedData.data;

    // transform the data

    await db.insert(expenses).values({
      title,
      categoryId,
      amount: amount.toString(),
      description,
      expenseDate,
      paymentMethod,
      isRecurring,
      submittedBy: userEmail,
      organizationId: orgId,
      userId,
    });

    revalidatePath("/");
    revalidatePath("/expenses");

    return {
      success: true,
      message: "Expense submitted successfully! It will be reviewed shortly.",
      errors: undefined,
    };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        message: "Failed to submit expense",
      };
    }
    return {
      success: false,
      errors: undefined,
      message: "Failed to submit expense",
    };
  }
};

export const deleteExpenseAction = async (
  formData: FormData,
): Promise<void> => {
  const { userId, orgId } = await auth();

  if (!userId) throw new Error("You must be signed in to delete an expense.");

  if (!orgId)
    throw new Error(
      "You must be a member of an organization to delete an expense.",
    );

  const idValue = formData.get("id");
  const id = Number(idValue);

  if (!idValue || Number.isNaN(id)) {
    throw new Error("Invalid expense id.");
  }

  try {
    await db.delete(expenses).where(eq(expenses.id, id));
    revalidatePath("/");
    revalidatePath("/expenses");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete expense.");
  }
  redirect("/expenses");
};

export type ExpenseActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const updateExpenseSchema = expenseSchema.extend({
  id: z.coerce.number().int().positive("Invalid expense id."),
});

export async function updateExpenseAction(
  prevState: ExpenseActionState,
  formData: FormData,
): Promise<ExpenseActionState> {
  try {
    const rawData = {
      id: formData.get("id"),
      title: formData.get("title"),
      description: formData.get("description") || null,
      amount: formData.get("amount"),
      categoryId: formData.get("categoryId"),
      expenseDate: formData.get("expenseDate"),
      paymentMethod: formData.get("paymentMethod"),
      isRecurring: formData.get("isRecurring") === "true",
    };

    const validatedFields = updateExpenseSchema.safeParse(rawData);

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Please correct the highlighted fields.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const data = validatedFields.data;

    await db
      .update(expenses)
      .set({
        title: data.title,
        description: data.description,
        amount: String(data.amount),
        categoryId: data.categoryId,
        expenseDate: new Date(data.expenseDate),
        paymentMethod: data.paymentMethod,
        isRecurring: data.isRecurring ?? false,
      })
      .where(eq(expenses.id, data.id));

    revalidatePath("/expenses");
    revalidatePath(`/expenses/${data.id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Expense updated successfully.",
    };
  } catch (error) {
    console.error("updateExpenseAction error:", error);

    return {
      success: false,
      message: "Failed to update expense.",
    };
  }
}
