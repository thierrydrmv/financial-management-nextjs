import { z } from "zod";

export const expenseSchema = z.object({
  type: z.enum(["income", "expense"], {
    message: "Type is required",
  }),

  title: z
    .string()
    .min(3, { message: "Expense name must be at least 3 characters" })
    .max(120, { message: "Expense name must be less than 120 characters" }),

  categoryId: z
    .string()
    .min(1, { message: "Category is required" })
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), {
      message: "Category must be a valid number",
    }),

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
});
