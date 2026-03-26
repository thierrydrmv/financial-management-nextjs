import { z } from "zod";

export const expenseSchema = z.object({
  type: z.enum(["income", "expense"], {
    message: "Type is required",
  }),

  title: z
    .string()
    .min(3, { message: "Expense name must be at least 3 characters" })
    .max(120, { message: "Expense name must be less than 120 characters" }),

  categoryId: z.preprocess(
    (value) => {
      if (value === undefined || value === null || value === "") return null;
      if (typeof value === "string") {
        const num = Number(value);
        return Number.isNaN(num) ? value : num;
      }
      return value;
    },
    z.number().int().positive().nullable(),
  ),

  description: z
    .string()
    .max(500, { message: "Description must be less than 500 characters" })
    .optional(),

  amount: z
    .string()
    .min(1, { message: "Amount is required" })
    .transform((val) => Number(val.replace(",", ".")))
    .refine((val) => val > 0, {
      message: "Amount must be greater than 0",
    }),

  expenseDate: z
    .string()
    .min(1, { message: "Expense date is required" })
    .transform((val) => new Date(val)),

  paymentMethod: z.string().min(1, { message: "Payment method is required" }),

  isRecurring: z
    .string()
    .optional()
    .transform((val) => val === "true"),
}).superRefine((data, ctx) => {
  if (data.type === "expense" && data.categoryId === null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["categoryId"],
      message: "Category is required for expense entries",
    });
  }

  if (data.type === "income" && data.categoryId !== null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["categoryId"],
      message: "Income entries should not have a category",
    });
  }
});
