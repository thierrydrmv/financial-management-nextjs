# Wealth Tracker

**A clearer view of your income, expenses, and everyday spending.**

**[Explore the live demo →](https://financial-management-nextjs-two.vercel.app/)**

Wealth Tracker is a personal-finance web application that brings transaction records, spending categories, and monthly insights into one place. It demonstrates how a focused financial-management product could help people turn scattered records into a more understandable picture of their money.

> **Product prototype:** core tracking and dashboard workflows are implemented. This repository demonstrates a possible product, not a production-ready banking or accounting service.

[Features](#features) · [Product walkthrough](#product-walkthrough) · [Tech stack](#tech-stack) · [Run locally](#run-locally) · [Project structure](#project-structure) · [Roadmap](#roadmap)

## The idea

How much did I spend this month? Which categories account for most of it? How does my spending compare with my income?

Wealth Tracker is designed for individuals who want to record transactions manually, organize expenses their own way, and review the results visually—without starting with a complex accounting workflow.

Visitors can explore a read-only preview before signing in. Authenticated users can manage their own records and see those records reflected in the dashboard.

## Features

### Income and expense tracking

- Create, view, edit, and delete transactions.
- Record titles, amounts, dates, descriptions, and payment methods.
- Distinguish income from expenses.
- Mark transactions as recurring for reference. This flag does not automatically generate future entries.

### Personal categories

- Create expense categories and view their transaction counts.
- Prevent category deletion while transactions still reference it.
- Assign categories to expenses; income entries do not use a category.

### Transaction explorer

- Search transactions by title.
- Filter by income or expense and by category.
- Browse paginated results and open transaction details.
- Preserve search and filter state in the URL.

### Financial dashboard

- Compare monthly income and expenses across a selected year.
- Review the selected month's income-minus-expenses balance.
- Explore monthly and yearly spending by category.
- Inspect expense breakdowns and category shares of annual spending.

Dashboard balances come from recorded transactions. They are not connected bank balances or net-worth measurements.

### Preview and account experience

- Signed-out visitors can explore sample transactions, categories, and dashboard data.
- Clerk provides sign-in and account controls.
- Authenticated transaction queries are scoped to the current user.
- Loading skeletons, empty states, and validation feedback support the main workflows.

## Product walkthrough

1. **Explore the preview.** Browse the dashboard, transactions, and categories while signed out.
2. **Sign in.** Switch from sample data to your own transaction workspace.
3. **Create a category.** Add at least one category before recording an expense.
4. **Record transactions.** Add income and expenses with their amounts, dates, and supporting details.
5. **Review your finances.** Filter transactions or inspect monthly trends and spending composition in the dashboard.

| Route | Purpose |
| --- | --- |
| `/` | Landing page and financial summaries |
| `/dashboard` | Monthly and yearly financial analysis |
| `/expenses` | Searchable, filterable income and expense list |
| `/expenses/[id]` | Transaction details |
| `/expenses/[id]/edit` | Transaction editing; preview visitors see a placeholder |
| `/submit` | New transaction form; requires sign-in |
| `/categories` | Category list and management |

Although the source uses `expenses` for routes and the database table, it stores both income and expense transactions.

## Tech stack

| Layer | Technology |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui components, Radix UI, Lucide icons |
| Authentication | Clerk |
| Database | PostgreSQL through Neon |
| Data access | Drizzle ORM and Drizzle Kit |
| Validation | Zod |
| Dates | date-fns |
| Tooling | pnpm, ESLint, TypeScript |

Server Components load data; interactive components handle forms, filters, and dashboard controls. Server Actions validate submissions, perform database mutations, and revalidate affected routes. The prototype does not expose a separate public REST API.

## Run locally

### Prerequisites

- A Node.js version supported by the pinned Next.js version.
- pnpm; the repository includes `pnpm-lock.yaml`.
- A Clerk application with development keys.
- A Neon PostgreSQL database dedicated to development.

### 1. Install dependencies

From the repository root:

```bash
pnpm install --frozen-lockfile
```

### 2. Configure the environment

Create `.env` in the repository root:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

Replace the placeholders with your development configuration. Use `.env` because the Drizzle configuration loads it through `dotenv/config`. Never commit real database credentials or secret keys.

The visitor preview skips personal-data queries, but it is not a configuration-free standalone demo: the application still imports the database module and uses Clerk.

### 3. Initialize a fresh development database

```bash
pnpm exec drizzle-kit push
```

Use this against a **new, disposable development database**, and review the proposed changes. Do not use it blindly against an existing or production database.

The committed migrations currently differ from `db/schema.ts`: the initial migration requires a category for every transaction and retains organization columns absent from the current schema. The schema allows income without a category. Reconcile migration history before adopting a migration-based deployment workflow.

### 4. Start the application

```bash
pnpm dev
```

Open [localhost:3000](http://localhost:3000). Explore the signed-out preview, then sign in to create your own categories and transactions.

### Development commands

```bash
pnpm dev              # Development server
pnpm lint             # ESLint checks
pnpm exec tsc --noEmit # Type checking
pnpm build            # Production build
pnpm start            # Serve the production build
```

These instructions reflect the repository configuration. A clean installation, authenticated end-to-end workflow, and production build have not been independently verified for this README.

### Sample data

The visitor preview uses [lib/demo/preview-data.ts](lib/demo/preview-data.ts) and does not require database seeding.

The separate [db/seed.ts](db/seed.ts) script targets a hard-coded user ID and **deletes that user's existing transactions and categories before inserting samples**. It is not part of the default setup. Review and adapt it only for a disposable test account and database.

## Project structure

| Location | Responsibility |
| --- | --- |
| [app/](app/) | Routes, layouts, and loading states |
| [components/](components/) | Forms, dashboard visuals, transaction explorer, and shared UI |
| [lib/expenses/](lib/expenses/) | Transaction queries, actions, validation, and URL filters |
| [lib/categories/](lib/categories/) | Category queries, actions, and validation |
| [lib/dashboard/](lib/dashboard/) | Financial calculations and chart data preparation |
| [lib/demo/](lib/demo/) | Read-only preview data |
| [db/schema.ts](db/schema.ts) | Transaction and category schema |
| [db/index.ts](db/index.ts) | Neon database connection |
| [drizzle/](drizzle/) | Committed migrations and schema snapshots |
| [proxy.ts](proxy.ts) | Clerk middleware integration |

## Data and access model

Transactions store an amount, type, date, optional description, payment method, recurring flag, and user identifier. Expenses reference a category; income entries can omit it. Monetary amounts are stored as PostgreSQL `numeric(10, 2)` values.

Categories belong to users. Transaction updates and deletions include the authenticated user's ID in their database conditions. Server Actions check authentication; installing Clerk middleware alone is not the authorization policy.

Before handling real financial data, category ownership must also be verified server-side when creating or editing a transaction. The form offers the user's categories, but the current write actions do not independently verify ownership of the submitted category ID.

## Roadmap

### Strengthen the foundation

- Add automated tests for transaction workflows, validation, authorization, and dashboard calculations.
- Validate category ownership on transaction writes and strengthen database ownership constraints.
- Align migration history with the current schema.
- Review monetary calculations, timezone behavior, and cache invalidation across mutations.
- Complete deployment configuration, monitoring, and backup procedures.

### Possible product extensions

- Budgets and category spending limits.
- Scheduled recurring transactions and reminders.
- CSV import and export.
- Currency preferences and an explicit multi-currency model.
- Shared household workspaces with defined access roles.

These are potential next steps, not existing features. The prototype currently uses USD formatting by default and does not provide bank synchronization, payment processing, or automated financial advice. No automated test suite is included in the supplied repository.

---

Wealth Tracker demonstrates a product direction: making manually recorded finances easier to organize, explore, and understand.
