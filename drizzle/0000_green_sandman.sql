CREATE TABLE "expense_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"user_id" varchar(255),
	"organization_id" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" text,
	"amount" numeric(10, 2) NOT NULL,
	"category_id" integer NOT NULL,
	"expense_date" timestamp with time zone NOT NULL,
	"payment_method" varchar(50),
	"is_recurring" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"submitted_by" varchar(120) DEFAULT 'anonymous',
	"user_id" varchar(255),
	"organization_id" varchar(255)
);
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "categories_user_idx" ON "expense_categories" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "categories_organization_idx" ON "expense_categories" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "expenses_category_idx" ON "expenses" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "expenses_date_idx" ON "expenses" USING btree ("expense_date");--> statement-breakpoint
CREATE INDEX "expenses_user_idx" ON "expenses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "expenses_organization_idx" ON "expenses" USING btree ("organization_id");