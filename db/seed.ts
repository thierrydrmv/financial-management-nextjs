import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq } from "drizzle-orm";
import { categories, expenses } from "./schema";

const db = drizzle(process.env.DATABASE_URL!);

const SEED_USER_ID = "user_3AXu35Efl2Nxyge4515o1SVQvng";
const SEED_ORG_ID = "org_3AcAzBvwpZJ6zIzKuGvqjSviR9K";

const seedCategories = [
  { name: "Food" },
  { name: "Transport" },
  { name: "Housing" },
  { name: "Entertainment" },
  { name: "Health" },
  { name: "Shopping" },
];

type CategoryRow = { id: number; name: string };

type ExpenseSeed = {
  title: string;
  description: string | null;
  amount: string;
  categoryId: number;
  expenseDate: Date;
  paymentMethod: string;
  isRecurring: boolean;
};

const PAYMENT_METHODS = ["credit-card", "debit-card", "cash", "pix"] as const;

function pickPayment(salt: number): string {
  return PAYMENT_METHODS[salt % PAYMENT_METHODS.length];
}

/** Slight amount jitter so charts look natural month to month */
function amountStr(base: number, salt: number): string {
  const jitter = 1 + (((salt * 13) % 21) - 10) / 100;
  return (Math.round(base * jitter * 100) / 100).toFixed(2);
}

function maxDayInMonthForSeed(
  year: number,
  month0: number,
  today: Date,
): number {
  const lastOfMonth = new Date(year, month0 + 1, 0).getDate();
  if (year === today.getFullYear() && month0 === today.getMonth()) {
    return Math.min(lastOfMonth, today.getDate());
  }
  return lastOfMonth;
}

function clampDay(
  year: number,
  month0: number,
  day: number,
  today: Date,
): number {
  const maxD = maxDayInMonthForSeed(year, month0, today);
  return Math.min(maxD, Math.max(1, day));
}

function buildExpensesForMonth(
  year: number,
  month0: number,
  byName: (n: string) => number,
  today: Date,
): ExpenseSeed[] {
  const maxD = maxDayInMonthForSeed(year, month0, today);
  if (maxD < 1) return [];

  const salt = year * 12 + month0;
  const rows: ExpenseSeed[] = [];

  const d = (day: number) =>
    new Date(year, month0, clampDay(year, month0, day, today));

  rows.push({
    title: "Rent",
    description: "Monthly rent",
    amount: amountStr(1200, salt),
    categoryId: byName("Housing"),
    expenseDate: d(3),
    paymentMethod: pickPayment(salt),
    isRecurring: true,
  });

  rows.push({
    title: "Groceries",
    description: "Supermarket",
    amount: amountStr(92, salt + 1),
    categoryId: byName("Food"),
    expenseDate: d(7 + (salt % 5)),
    paymentMethod: pickPayment(salt + 2),
    isRecurring: true,
  });

  rows.push({
    title: "Groceries",
    description: "Weekly shop",
    amount: amountStr(78, salt + 3),
    categoryId: byName("Food"),
    expenseDate: d(14 + (salt % 4)),
    paymentMethod: pickPayment(salt + 4),
    isRecurring: true,
  });

  rows.push({
    title: "Groceries",
    description: "Top-up",
    amount: amountStr(45, salt + 5),
    categoryId: byName("Food"),
    expenseDate: d(21 + (salt % 3)),
    paymentMethod: pickPayment(salt + 6),
    isRecurring: false,
  });

  rows.push({
    title: "Transit pass",
    description: "Monthly pass",
    amount: amountStr(72, salt + 7),
    categoryId: byName("Transport"),
    expenseDate: d(1),
    paymentMethod: pickPayment(salt + 8),
    isRecurring: true,
  });

  rows.push({
    title: "Fuel / rides",
    description: "Commute and trips",
    amount: amountStr(48, salt + 9),
    categoryId: byName("Transport"),
    expenseDate: d(11 + (salt % 7)),
    paymentMethod: pickPayment(salt + 10),
    isRecurring: false,
  });

  if (salt % 3 !== 0) {
    rows.push({
      title: "Streaming / outings",
      description: "Entertainment",
      amount: amountStr(32, salt + 11),
      categoryId: byName("Entertainment"),
      expenseDate: d(18 + (salt % 6)),
      paymentMethod: pickPayment(salt + 12),
      isRecurring: salt % 2 === 0,
    });
  }

  if (salt % 2 === 0) {
    rows.push({
      title: "Pharmacy",
      description: "Health supplies",
      amount: amountStr(28, salt + 13),
      categoryId: byName("Health"),
      expenseDate: d(9 + (salt % 8)),
      paymentMethod: pickPayment(salt + 14),
      isRecurring: false,
    });
  }

  if (salt % 4 !== 1) {
    rows.push({
      title: "Shopping",
      description: "Misc purchases",
      amount: amountStr(65, salt + 15),
      categoryId: byName("Shopping"),
      expenseDate: d(25 + (salt % 4)),
      paymentMethod: pickPayment(salt + 16),
      isRecurring: false,
    });
  }

  rows.push({
    title: "Utilities estimate",
    description: "Electric / internet share",
    amount: amountStr(110, salt + 17),
    categoryId: byName("Housing"),
    expenseDate: d(16),
    paymentMethod: pickPayment(salt + 18),
    isRecurring: true,
  });

  return rows;
}

function seedExpenses(categoryIds: CategoryRow[]): ExpenseSeed[] {
  const byName = (n: string) => {
    const found = categoryIds.find((c) => c.name === n);
    if (!found) {
      throw new Error(`Seed category not found: "${n}"`);
    }
    return found.id;
  };
  const today = new Date();
  const all: ExpenseSeed[] = [];

  const cursor = new Date(2023, 0, 1);

  while (
    cursor.getFullYear() < today.getFullYear() ||
    (cursor.getFullYear() === today.getFullYear() &&
      cursor.getMonth() <= today.getMonth())
  ) {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    all.push(...buildExpensesForMonth(y, m, byName, today));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return all;
}

async function main() {
  console.log("🌱 Seeding database...");

  await db
    .delete(expenses)
    .where(
      and(eq(expenses.userId, SEED_USER_ID), eq(expenses.organizationId, SEED_ORG_ID)),
    );
  await db
    .delete(categories)
    .where(
      and(eq(categories.userId, SEED_USER_ID), eq(categories.organizationId, SEED_ORG_ID)),
    );
  console.log("✅ Cleared existing data");

  const insertedCategories = await db
    .insert(categories)
    .values(
      seedCategories.map((c) => ({
        name: c.name,
        userId: SEED_USER_ID,
        organizationId: SEED_ORG_ID,
      })),
    )
    .returning({ id: categories.id, name: categories.name });

  console.log(`✅ Inserted ${insertedCategories.length} categories`);

  const expenseRows = seedExpenses(insertedCategories);
  await db.insert(expenses).values(
    expenseRows.map((e) => ({
      ...e,
      submittedBy: "seed@example.com",
      userId: SEED_USER_ID,
      organizationId: SEED_ORG_ID,
    })),
  );

  console.log(
    `✅ Inserted ${expenseRows.length} expenses (2023 → current month)`,
  );

  const count = await db.select().from(expenses);
  console.log(
    `\n🎉 Seeded ${insertedCategories.length} categories and ${count.length} expenses`,
  );
}

main()
  .catch((error) => {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("\n✨ Seeding complete!");
    process.exit(0);
  });
