"use server";

import { auth } from "@clerk/nextjs/server";
import { categorySchema } from "./category-validations";
import { db } from "@/db";
import { categories } from "@/db/schema";
import z from "zod";
import { FormState } from "@/types";
import { revalidatePath } from "next/cache";

export const addCategoryAction = async (
  _prevState: FormState,
  formData: FormData,
) => {
  try {
    const { userId, orgId } = await auth();

    if (!userId)
      return {
        success: false,
        message: "You must be signed in to submit a category.",
        errors: undefined,
      };

    if (!orgId)
      return {
        success: false,
        message:
          "You must be a member of an organization to submit a category.",
        errors: undefined,
      };

    // data
    const rawFormData = Object.fromEntries(formData.entries());

    // validate the data
    const validatedData = categorySchema.safeParse(rawFormData);
    if (!validatedData.success) {
      return {
        success: false,
        errors: validatedData.error.flatten().fieldErrors,
        message: "Invalid data",
      };
    }
    const { name } = validatedData.data;

    // transform the data

    await db.insert(categories).values({
      name,
    });

    revalidatePath("/submit");
    revalidatePath("/categories");
    revalidatePath("/expenses");

    return {
      success: true,
      message: "Category submitted successfully! It will be reviewed shortly.",
      errors: undefined,
    };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        message: "Failed to submit category",
      };
    }
    return {
      success: false,
      errors: undefined,
      message: "Failed to submit category",
    };
  }
};
