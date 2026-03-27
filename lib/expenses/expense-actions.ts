"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { expenseSchema } from "./expense-validations";
import { db } from "@/db";
import { categories, expenses } from "@/db/schema";
import z from "zod";
import { FormState } from "@/types";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
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
        message: "You must be signed in to submit an expense.",
        errors: undefined,
      };

    if (!orgId)
      return {
        success: false,
        message:
          "You must be a member of an organization to submit an expense.",
        errors: undefined,
      };

    // data
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress || "anonymous";
    const rawFormData = Object.fromEntries(formData.entries());

    // If they are adding an expense and have no categories at all, fail early with a helpful message.
    // (The schema would otherwise just say "Category is required for expense entries".)
    if (rawFormData.type === "expense") {
      const hasAnyCategories = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.organizationId, orgId))
        .limit(1);

      if (hasAnyCategories.length === 0) {
        return {
          success: false,
          message:
            "You need to add at least one category before submitting an expense.",
          errors: {
            categoryId: ["No categories available. Create one first."],
          },
        };
      }
    }

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
      type,
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
      type,
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
      message: "Expense submitted successfully!",
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

  if (!userId) throw new Error("You must be signed in to delete a expense.");

  if (!orgId)
    throw new Error(
      "You must be a member of an organization to delete a expense.",
    );

  const idValue = formData.get("id");
  const id = Number(idValue);

  if (!idValue || Number.isNaN(id)) {
    throw new Error("Invalid expense id.");
  }

  try {
    await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
    revalidatePath("/");
    revalidatePath("/expenses");
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete expense.");
  }
  redirect("/expenses");
};

export async function updateExpenseAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    const { userId, orgId } = await auth();
    if (!userId)
      return {
        success: false,
        message: "You must be signed in to update an expense.",
        errors: undefined,
      };

    if (!orgId)
      return {
        success: false,
        message:
          "You must be a member of an organization to update an expense.",
        errors: undefined,
      };
    const rawData = {
      id: formData.get("id"),
      type: formData.get("type"),
      title: formData.get("title"),
      description: formData.get("description") || null,
      amount: formData.get("amount"),
      categoryId: formData.get("categoryId"),
      expenseDate: formData.get("expenseDate"),
      paymentMethod: formData.get("paymentMethod"),
      isRecurring: formData.get("isRecurring"),
    };

    const validatedFields = expenseSchema.safeParse(rawData);
    if (!validatedFields.success) {
      return {
        success: false,
        message: "Please correct the highlighted fields.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const rawId = formData.get("id") as string;
    if (!rawId || Number.isNaN(Number(rawId))) {
      return {
        success: false,
        message: "Invalid expense id.",
        errors: {
          id: ["Invalid expense id."],
        },
      };
    }
    const id = Number(rawId);
    const data = validatedFields.data;
    await db
      .update(expenses)
      .set({
        type: data.type,
        title: data.title,
        description: data.description,
        amount: String(data.amount),
        categoryId: data.categoryId,
        expenseDate: new Date(data.expenseDate),
        paymentMethod: data.paymentMethod,
        isRecurring: data.isRecurring ?? false,
      })
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

    revalidatePath("/");
    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    revalidatePath(`/expenses/${id}`);

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
