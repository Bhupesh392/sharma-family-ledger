ALTER TYPE "public"."role" ADD VALUE 'TENANT';--> statement-breakpoint
CREATE TABLE "parsing_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"raw_input" text NOT NULL,
	"parsed_result" text,
	"success" boolean NOT NULL,
	"error_message" text,
	"parser_version" text DEFAULT '1.0.0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"property_id" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"date" date NOT NULL,
	"transaction_id" text,
	"bank" text,
	"upi_id" text,
	"raw_message" text,
	"image_url" text,
	"parsed_data" text,
	"confidence_score" integer,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"reviewed_by_id" integer,
	"reviewed_at" timestamp,
	"rent_entry_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "upi_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"upi_id" text NOT NULL,
	"property_id" integer NOT NULL,
	"tenant_id" integer NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "upi_mappings_upi_id_unique" UNIQUE("upi_id")
);
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "police_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "police_verification_date" date;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tenant_id" integer;--> statement-breakpoint
ALTER TABLE "payment_submissions" ADD CONSTRAINT "payment_submissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_submissions" ADD CONSTRAINT "payment_submissions_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_submissions" ADD CONSTRAINT "payment_submissions_reviewed_by_id_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upi_mappings" ADD CONSTRAINT "upi_mappings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "upi_mappings" ADD CONSTRAINT "upi_mappings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;