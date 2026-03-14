import { db } from "@/db";
import { products } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { connection } from "next/server";

export async function getFeaturedProducts() {
  "use cache";
  const productsData = await db
    .select()
    .from(products)
    .where(eq(products.status, "approved"))
    .orderBy(desc(products.voteCount));

  return productsData;
}

export async function getAllApprovedProducts() {
  const productsData = await db
    .select()
    .from(products)
    .where(eq(products.status, "approved"))
    .orderBy(desc(products.voteCount));

  return productsData;
}

export async function getAllProducts() {
  "use cache";
  const productsData = await db
    .select()
    .from(products)
    .orderBy(desc(products.voteCount));

  return productsData;
}

export async function getTodayProducts() {
  await connection(); // get data on runtime
  // Everything below will be excluded from prerendering
  const productsData = await getAllApprovedProducts();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return productsData.filter(
    (product) =>
      product.createdAt &&
      new Date(product.createdAt.toISOString()) >= yesterday,
  );
}

export async function getLastWeekProducts() {
  await connection(); // get data on runtime
  // Everything below will be excluded from prerendering
  const productsData = await getAllApprovedProducts();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return productsData.filter(
    (product) =>
      product.createdAt &&
      new Date(product.createdAt.toISOString()) >= oneWeekAgo,
  );
}

export async function getLastMonthProducts() {
  await connection(); // get data on runtime
  // Everything below will be excluded from prerendering
  const productsData = await getAllApprovedProducts();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return productsData.filter(
    (product) =>
      product.createdAt &&
      new Date(product.createdAt.toISOString()) >= oneMonthAgo,
  );
}

export async function getProductBySlug(slug: string) {
  const product = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug));

  return product?.[0] ?? null;
}
