import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
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

const seedExpenses = (
  categoryIds: { id: number; name: string }[],
): Array<{
  title: string;
  description: string | null;
  amount: string;
  categoryId: number;
  expenseDate: Date;
  paymentMethod: string;
  isRecurring: boolean;
}> => {
  const byName = (n: string) => categoryIds.find((c) => c.name === n)!.id;
  const now = new Date();
  const daysAgo = (d: number) => {
    const d2 = new Date(now);
    d2.setDate(d2.getDate() - d);
    return d2;
  };

  return [
    {
      title: "Groceries",
      description: "Weekly supermarket run",
      amount: "85.50",
      categoryId: byName("Food"),
      expenseDate: daysAgo(1),
      paymentMethod: "credit-card",
      isRecurring: true,
    },
    {
      title: "Bus pass",
      description: "Monthly transit",
      amount: "72.00",
      categoryId: byName("Transport"),
      expenseDate: daysAgo(3),
      paymentMethod: "debit-card",
      isRecurring: true,
    },
    {
      title: "Rent",
      description: null,
      amount: "1200.00",
      categoryId: byName("Housing"),
      expenseDate: daysAgo(5),
      paymentMethod: "credit-card",
      isRecurring: true,
    },
    {
      title: "Movie tickets",
      description: "Weekend cinema",
      amount: "24.00",
      categoryId: byName("Entertainment"),
      expenseDate: daysAgo(2),
      paymentMethod: "cash",
      isRecurring: false,
    },
    {
      title: "Pharmacy",
      description: "Medication refill",
      amount: "35.99",
      categoryId: byName("Health"),
      expenseDate: daysAgo(4),
      paymentMethod: "debit-card",
      isRecurring: false,
    },
  ];
};

async function main() {
  console.log("🌱 Seeding database...");

  await db.delete(expenses);
  await db.delete(categories);
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

  console.log(`✅ Inserted ${expenseRows.length} expenses`);

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
