"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { productSchema } from "./product-validations";
import { db } from "@/db";
import { products } from "@/db/schema";
import z from "zod";
import { FormState } from "@/types";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const addProductAction = async (
  prevState: FormState,
  formData: FormData,
) => {
  try {
    const { userId, orgId } = await auth();

    if (!userId)
      return {
        success: false,
        message: "You must be signed in to submit a product.",
        errors: undefined,
      };

    if (!orgId)
      return {
        success: false,
        message: "You must be a member of an organization to submit a product.",
        errors: undefined,
      };

    // data
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress || "anonymous";
    const rawFormData = Object.fromEntries(formData.entries());

    // validate the data
    const validatedData = productSchema.safeParse(rawFormData);
    if (!validatedData.success) {
      return {
        success: false,
        errors: validatedData.error.flatten().fieldErrors,
        message: "Invalid data",
      };
    }
    const { name, slug, tagline, description, websiteUrl, tags } =
      validatedData.data;

    const tagsArray = tags ? tags.filter((tag) => typeof tag === "string") : [];

    // transform the data

    await db.insert(products).values({
      name,
      slug,
      tagline,
      description,
      websiteUrl,
      tags: tagsArray,
      status: "pending",
      submittedBy: userEmail,
      organizationId: orgId,
      userId,
    });

    return {
      success: true,
      message: "Product submitted successfully! It will be reviewed shortly.",
      errors: undefined,
    };
  } catch (error) {
    console.error(error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
        message: "Failed to submit product",
      };
    }
    return {
      success: false,
      errors: undefined,
      message: "Failed to submit product",
    };
  }
};

export const downvoteProductAction = async (productId: number) => {
  try {
    const { userId, orgId } = await auth();
    if (!userId)
      return {
        success: false,
        message: "You must be signed in to downvote a product.",
        errors: undefined,
      };

    if (!orgId)
      return {
        success: false,
        message:
          "You must be a member of an organization to downvote a product.",
        errors: undefined,
      };

    await db
      .update(products)
      .set({
        voteCount: sql`GREATEST(0, vote_count - 1)`,
      })
      .where(eq(products.id, productId));

    revalidatePath("/");

    return {
      success: true,
      message: "Product downvote successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to downvote product",
      voteCount: 0,
    };
  }
};

export const upvoteProductAction = async (productId: number) => {
  try {
    const { userId, orgId } = await auth();
    if (!userId)
      return {
        success: false,
        message: "You must be signed in to upvote a product.",
        errors: undefined,
      };

    if (!orgId)
      return {
        success: false,
        message: "You must be a member of an organization to upvote a product.",
        errors: undefined,
      };

    await db
      .update(products)
      .set({
        voteCount: sql`GREATEST(0, vote_count + 1)`,
      })
      .where(eq(products.id, productId));

    revalidatePath("/");

    return {
      success: true,
      message: "Product upvoted successfully",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "Failed to upvote product",
      voteCount: 0,
    };
  }
};
