import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .min(3, { message: "Category name must be at least 3 characters" })
    .max(80, { message: "Category name must be less than 80 characters" }),
});
