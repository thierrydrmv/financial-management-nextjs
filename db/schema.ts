import {
  pgTable,
  pgEnum,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  index,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";

export const financeTypeEnum = pgEnum("finance_type", ["income", "expense"]);

// ============= EXPENSES =============
export const expenses = pgTable(
  "expenses",
  {
    id: serial("id").primaryKey(),

    // Core info
    title: varchar("title", { length: 120 }).notNull(), // e.g. "Rent", "Groceries"
    description: text("description"),

    // Money
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    type: financeTypeEnum("type").notNull().default("expense"),

    // Category
    categoryId: integer("category_id")
      .references(() => categories.id)
      .notNull(),

    // Date of the expense
    expenseDate: timestamp("expense_date", { withTimezone: true }).notNull(),

    // Payment
    paymentMethod: varchar("payment_method", { length: 50 }),
    // e.g. Credit Card | Debit | Cash | Pix

    // Recurring expense
    isRecurring: boolean("is_recurring").default(false),

    // Metadata
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    submittedBy: varchar("submitted_by", { length: 120 }).default("anonymous"),

    // Ownership
    userId: varchar("user_id", { length: 255 }),
    organizationId: varchar("organization_id", { length: 255 }),
  },
  (table) => ({
    categoryIdx: index("expenses_category_idx").on(table.categoryId),
    dateIdx: index("expenses_date_idx").on(table.expenseDate),
    userIdx: index("expenses_user_idx").on(table.userId),
    organizationIdx: index("expenses_organization_idx").on(
      table.organizationId,
    ),
  }),
);

// ============= CATEGORIES =============
export const categories = pgTable(
  "expense_categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    // e.g. Moradia | Alimentação | Transporte | Lazer | Saúde | Vestuário
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    // Add these:
    userId: varchar("user_id", { length: 255 }),
    organizationId: varchar("organization_id", { length: 255 }),
  },
  (table) => ({
    userIdx: index("categories_user_idx").on(table.userId),
    organizationIdx: index("categories_organization_idx").on(
      table.organizationId,
    ),
  }),
);
