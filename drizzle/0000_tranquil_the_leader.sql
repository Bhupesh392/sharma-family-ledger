CREATE TYPE "public"."floor" AS ENUM('GROUND', 'FIRST', 'SECOND');--> statement-breakpoint
CREATE TYPE "public"."return_status" AS ENUM('PENDING', 'COMPLETED');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'MEMBER');--> statement-breakpoint
CREATE TABLE "chitrakoot_rent" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" date NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"paid_to" text DEFAULT 'Chetan Sharma' NOT NULL,
	"mode" text DEFAULT 'UPI' NOT NULL,
	"submitted_amount" numeric(12, 2),
	"submitted_date" date,
	"notes" text,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "construction" (
	"id" serial PRIMARY KEY NOT NULL,
	"what_for" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"who_paid" text DEFAULT 'Nitin Sharma' NOT NULL,
	"to_whom" text,
	"transaction_id" text,
	"mode" text,
	"date" date,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "e392_rent" (
	"id" serial PRIMARY KEY NOT NULL,
	"month" date NOT NULL,
	"floor" "floor" NOT NULL,
	"rent" numeric(12, 2) NOT NULL,
	"paid_to" text DEFAULT 'Nitin Sharma' NOT NULL,
	"mode" text DEFAULT 'Online' NOT NULL,
	"notes" text,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "e392_utilities" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"utility" text NOT NULL,
	"floor" "floor" NOT NULL,
	"paid_to" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"mode" text,
	"notes" text,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "miscellaneous" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"to_whom" text NOT NULL,
	"by_who" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"remarks" text,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "return_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"submitted_to_nitin" text DEFAULT 'Yes' NOT NULL,
	"status" "return_status" DEFAULT 'PENDING' NOT NULL,
	"who_returned" text,
	"mode" text,
	"transaction_id" text,
	"date" date,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" DEFAULT 'MEMBER' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "chitrakoot_rent" ADD CONSTRAINT "chitrakoot_rent_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "construction" ADD CONSTRAINT "construction_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e392_rent" ADD CONSTRAINT "e392_rent_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e392_utilities" ADD CONSTRAINT "e392_utilities_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "miscellaneous" ADD CONSTRAINT "miscellaneous_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "return_items" ADD CONSTRAINT "return_items_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;