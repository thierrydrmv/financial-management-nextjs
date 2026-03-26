CREATE TYPE "public"."finance_type" AS ENUM('income', 'expense');--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "type" "finance_type" DEFAULT 'expense' NOT NULL;