# Wealth Tracker — Application Documentation

This document describes the **financial-management-app** project: a Next.js application branded as **Wealth Tracker** for recording income and expenses, organizing them by category, and visualizing cash flow on a dashboard.

---

## 1. Purpose

The app helps users:

- Track **income** and **expenses** with dates, amounts, payment methods, and optional recurrence flags.
- Organize spending with **user-scoped categories** (required for expense lines; income entries do not use categories).
- Browse and filter a **paginated expense list**, open **detail** and **edit** views, and delete entries.
- View **today / week / month** summaries on the home page (for signed-in users) and explore **analytics** on the dashboard (monthly balance, category breakdowns, charts).

**Signed-out visitors** still see a meaningful UI: the home page and several screens use **deterministic demo (“preview”) data** so the product is explorable before sign-up.

---

## 2. Technology Stack

| Area | Choice |
|------|--------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | React 19, [Tailwind CSS](https://tailwindcss.com) 4, [shadcn/ui](https://ui.shadcn.com)-style components (`components/ui/`) |
| Auth | [Clerk](https://clerk.com) (`@clerk/nextjs`) — `ClerkProvider` in root layout, `auth()` / `currentUser()` in server code |
| Database | [PostgreSQL](https://www.postgresql.org) via [Neon](https://neon.tech) serverless (`@neondatabase/serverless`) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) — schema in `db/schema.ts`, migrations under `drizzle/` |
| Validation | [Zod](https://zod.dev) for forms and server actions |
| Dates | [date-fns](https://date-fns.org), [react-day-picker](https://react-day-picker.js.org) for calendars |

---

## 3. High-Level Architecture

- **Server Components** load data and pass props to client components where interactivity is needed (dashboard, forms, filters).
- **Server Actions** (`"use server"`) in `lib/expenses/expense-actions.ts` and `lib/categories/category-actions.ts` perform creates, updates, and deletes; they revalidate relevant paths after mutations.
- **User isolation**: rows in `expenses` and `expense_categories` are tied to `userId` from Clerk; queries filter by the authenticated user.
- **Preview mode**: When `auth()` returns no `userId`, pages use helpers in `lib/demo/preview-data.ts` instead of the database, with UI hints (`PreviewModeBanner`, `previewMode` props).

---

## 4. Data Model

Defined in `db/schema.ts` (Drizzle).

### `expense_categories`

- `id`, `name`, `createdAt`, `userId` (nullable for legacy/anonymous flows; app logic scopes by signed-in user).

### `expenses`

- **Core**: `title`, optional `description`, `amount` (numeric), `type` — enum **`income` | `expense`** (default `expense`).
- **Relations**: `categoryId` → categories (optional; **required for expenses**, not used for income per validation).
- **When**: `expenseDate` (timestamptz).
- **Extra**: `paymentMethod`, `isRecurring`, `submittedBy` (e.g. email), `createdAt`, `userId`.
- **Indexes**: category, date, and user for common queries.

### Scripts

- `db/seed.ts` — optional seed data for development (categories + expenses for a fixed test user id); run with `tsx` after configuring `DATABASE_URL`.

---

## 5. Routes and Features

| Route | Behavior |
|-------|----------|
| `/` | Landing: hero (with optional preview stats if signed out), then **Today / Week / Month** expense sections (real data when signed in, preview otherwise). |
| `/submit` | **Protected** — redirects to `/` if not signed in. Form to add income or expense (`ExpenseSubmitForm`). Requires at least one category before submitting an **expense**. |
| `/expenses` | List with **pagination** and **filters** (search, type, category) via URL search params. Preview dataset when signed out. |
| `/expenses/[id]` | Expense detail; edit link when signed in. |
| `/expenses/[id]/edit` | Edit form (`updateExpenseAction`). |
| `/categories` | Manage categories: add (unique name per user), list with expense counts, delete when safe. Preview UI when signed out. |
| `/dashboard` | Finance dashboard: year/month selection, income vs expense series, balance, category donuts, breakdowns. Uses client-side computation from serialized expenses (`computeFinanceDashboardData`). Preview when signed out. |

Global **header** (`components/common/header.tsx`): navigation to Home, Expenses, Dashboard, Categories; Clerk **Sign in / Sign up** or **Submit expense** + **User button** when signed in.

---

## 6. Important Code Locations

| Path | Role |
|------|------|
| `app/` | App Router pages, layouts, loading UI |
| `components/` | Feature UI (expenses, dashboard, categories, landing, demo banners) |
| `lib/expenses/` | Server actions, Zod schemas, list queries, pagination constants |
| `lib/categories/` | Category actions and selects |
| `lib/dashboard/` | Dashboard math, search-param parsing, chart helpers, expense serialization |
| `lib/demo/preview-data.ts` | Synthetic EU-style demo dataset for unsigned users |
| `lib/formatters/currency.ts` | `formatCurrency` (default **USD** / `en-US`; demo narrative may reference EUR in comments) |
| `db/index.ts` | Neon HTTP client + Drizzle instance |
| `drizzle.config.ts` | Drizzle Kit config for migrations |
| `proxy.ts` | Exports Clerk `clerkMiddleware` with a standard matcher — **Next.js only runs middleware from a root `middleware.ts` file**; if you rely on Clerk middleware for route protection, ensure this logic lives in `middleware.ts` (or equivalent) per [Clerk Next.js docs](https://clerk.com/docs/quickstarts/nextjs). |

---

## 7. Environment Variables

The app expects at minimum:

- **`DATABASE_URL`** — PostgreSQL connection string (e.g. Neon). Required by `db/index.ts` at runtime.
- **Clerk** — typically `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` (and any Clerk URLs your dashboard prescribes). Configure these in `.env.local` for local development.

Do not commit secrets; use `.env.local` (gitignored).

---

## 8. NPM Scripts

```bash
npm run dev    # Next.js development server
npm run build  # Production build
npm run start  # Run production server
npm run lint   # ESLint
```

Database tooling (via `drizzle-kit` in devDependencies) is commonly used as `npx drizzle-kit generate` / `migrate` — see [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview) for your workflow.

---

## 9. User Flow Summary

1. **Sign up / sign in** with Clerk.
2. **Create categories** (needed before recording expenses).
3. **Submit expenses or income** from `/submit` (or navigate from the header).
4. **Browse and filter** on `/expenses`, open details, **edit** or **delete** as needed.
5. Use **`/`** for quick period summaries and **`/dashboard`** for deeper analysis.

---

## 10. Types

Shared TypeScript types live in `types/index.ts` (e.g. `FormState`, `ExpenseWithCategory` combining Drizzle expense rows with optional category summary).

This file is intended as a single place to explain the whole application; extend it as features and deployment practices evolve.
