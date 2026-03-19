import { categories, expenses } from "@/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type FormState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message: string;
};

export type ExpenseType = InferSelectModel<typeof expenses>;
export type CategoryType = InferSelectModel<typeof categories>;

export type ExpenseWithCategory = ExpenseType & {
  category: CategoryType;
};
