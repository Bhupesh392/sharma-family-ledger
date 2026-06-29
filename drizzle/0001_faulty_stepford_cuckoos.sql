CREATE TYPE "public"."property_type" AS ENUM('RESIDENTIAL', 'SHOP');--> statement-breakpoint
CREATE TYPE "public"."tenancy_status" AS ENUM('ACTIVE', 'ENDED');--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "property_type" DEFAULT 'RESIDENTIAL' NOT NULL,
	"address" text,
	"monthly_rent" numeric(12, 2),
	"image_url" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenancies" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"status" "tenancy_status" DEFAULT 'ACTIVE' NOT NULL,
	"security_deposit" numeric(12, 2),
	"deposit_returned" numeric(12, 2),
	"notes" text,
	"created_by_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chitrakoot_rent" ADD COLUMN "property_id" integer;--> statement-breakpoint
ALTER TABLE "e392_rent" ADD COLUMN "property_id" integer;--> statement-breakpoint
ALTER TABLE "e392_utilities" ADD COLUMN "property_id" integer;--> statement-breakpoint
ALTER TABLE "tenancies" ADD CONSTRAINT "tenancies_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancies" ADD CONSTRAINT "tenancies_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenancies" ADD CONSTRAINT "tenancies_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chitrakoot_rent" ADD CONSTRAINT "chitrakoot_rent_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e392_rent" ADD CONSTRAINT "e392_rent_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "e392_utilities" ADD CONSTRAINT "e392_utilities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;