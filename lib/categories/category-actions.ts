"use server";

import { auth } from "@clerk/nextjs/server";
import { categorySchema } from "./category-validations";
import { db } from "@/db";
import { categories, expenses } from "@/db/schema";
import z from "zod";
import { FormState } from "@/types";
import { revalidatePath } from "next/cache";
import { and, count, eq } from "drizzle-orm";

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

    const existing = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(eq(categories.userId, userId), eq(categories.name, name.trim())),
      )
      .limit(1);

    if (existing.length > 0) {
      return {
        success: false,
        message: "You already have a category with this name.",
        errors: { name: ["A category with this name already exists."] },
      };
    }

    // transform the data

    await db.insert(categories).values({
      name,
      userId,
      organizationId: orgId,
    });

    revalidatePath("/submit");
    revalidatePath("/categories");
    revalidatePath("/expenses");

    return {
      success: true,
      message: "Category submitted successfully!",
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

export const deleteCategoryAction = async (
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> => {
  const { userId, orgId } = await auth();
  if (!userId) {
    return {
      success: false,
      message: "You must be signed in to delete a category.",
      errors: undefined,
    };
  }
  if (!orgId) {
    return {
      success: false,
      message: "You must be a member of an organization to delete a category.",
      errors: undefined,
    };
  }
  const idValue = formData.get("id");
  const id = Number(idValue);
  if (!idValue || Number.isNaN(id)) {
    return {
      success: false,
      message: "Invalid category id.",
      errors: undefined,
    };
  }
  try {
    const [row] = await db
      .select({ value: count() })
      .from(expenses)
      .where(eq(expenses.categoryId, id));
    const usageCount = Number(row?.value ?? 0);
    if (usageCount > 0) {
      return {
        success: false,
        message:
          "This category is still used by one or more expenses. Reassign or delete those expenses first.",
        errors: undefined,
      };
    }
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
    revalidatePath("/");
    revalidatePath("/categories");
    revalidatePath("/expenses");
    revalidatePath("/submit");
    return {
      success: true,
      message: "Category deleted.",
      errors: undefined,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      errors: undefined,
      message: "Failed to delete category. Please try again.",
    };
  }
};
