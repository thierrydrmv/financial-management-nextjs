import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  json,
  uniqueIndex,
  index,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";

// ============= PRODUCTS =============
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),

    // Core product info
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).notNull(),
    tagline: varchar("tagline", { length: 200 }),
    description: text("description"),

    // Links & media
    websiteUrl: text("website_url"),
    tags: json("tags").$type<string[]>(), // e.g. ["AI", "Productivity"]

    // Voting
    voteCount: integer("vote_count").notNull().default(0),

    // Metadata
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    status: varchar("status", { length: 20 }).default("pending"), // pending | approved | rejected
    submittedBy: varchar("submitted_by", { length: 120 }).default("anonymous"),
    userId: varchar("user_id", { length: 255 }), // Clerk user ID

    // Organization reference (for backend queries only)
    organizationId: varchar("organization_id", { length: 255 }), // Clerk org ID
  },
  (table) => ({
    slugIdx: uniqueIndex("products_slug_idx").on(table.slug),
    statusIdx: index("products_status_idx").on(table.status),
    organizationIdx: index("products_organization_idx").on(
      table.organizationId,
    ),
  }),
);

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

    // Category
    categoryId: integer("category_id")
      .references(() => expenseCategories.id)
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
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 80 }).notNull(), // e.g. Moradia | Alimentação | Transporte | Lazer | Saúde | Vestuário
  color: varchar("color", { length: 20 }), // for charts
  icon: varchar("icon", { length: 50 }), // UI icon reference
});
