"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { expenseSchema } from "./expense-validations";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import z from "zod";
import { FormState } from "@/types";

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
