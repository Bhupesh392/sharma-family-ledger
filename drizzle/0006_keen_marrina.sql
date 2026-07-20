-- Payment Automation Schema
-- Adds support for automated rent entry via WhatsApp/image parsing

-- UPI ID mappings table
CREATE TABLE IF NOT EXISTS "upi_mappings" (
  "id" serial PRIMARY KEY NOT NULL,
  "upi_id" varchar(100) UNIQUE NOT NULL,
  "property_id" integer NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE,
  "tenant_id" integer NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "is_verified" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Payment submissions tracking
CREATE TABLE IF NOT EXISTS "payment_submissions" (
  "id" serial PRIMARY KEY NOT NULL,
  "tenant_id" integer NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "property_id" integer NOT NULL REFERENCES "properties"("id") ON DELETE CASCADE,
  "amount" numeric(12, 2) NOT NULL,
  "date" date NOT NULL,
  "transaction_id" varchar(100),
  "bank" varchar(100),
  "upi_id" varchar(100),
  "raw_message" text,
  "image_url" text,
  "parsed_data" jsonb,
  "confidence_score" integer,
  "status" varchar(20) DEFAULT 'PENDING' NOT NULL,
  "reviewed_by" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "reviewed_at" timestamp,
  "rent_entry_id" integer,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- Parsing logs for improving accuracy
CREATE TABLE IF NOT EXISTS "parsing_logs" (
  "id" serial PRIMARY KEY NOT NULL,
  "raw_input" text NOT NULL,
  "parsed_result" jsonb,
  "success" boolean NOT NULL,
  "error_message" text,
  "parser_version" varchar(20) DEFAULT '1.0.0' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Add payment tracking columns to rent tables
ALTER TABLE "e392_rent" ADD COLUMN IF NOT EXISTS "payment_method" varchar(50) DEFAULT 'Cash';
ALTER TABLE "e392_rent" ADD COLUMN IF NOT EXISTS "transaction_id" varchar(100);
ALTER TABLE "e392_rent" ADD COLUMN IF NOT EXISTS "upi_id" varchar(100);
ALTER TABLE "e392_rent" ADD COLUMN IF NOT EXISTS "auto_parsed" boolean DEFAULT false;

ALTER TABLE "chitrakoot_rent" ADD COLUMN IF NOT EXISTS "payment_method" varchar(50) DEFAULT 'Cash';
ALTER TABLE "chitrakoot_rent" ADD COLUMN IF NOT EXISTS "transaction_id" varchar(100);
ALTER TABLE "chitrakoot_rent" ADD COLUMN IF NOT EXISTS "upi_id" varchar(100);
ALTER TABLE "chitrakoot_rent" ADD COLUMN IF NOT EXISTS "auto_parsed" boolean DEFAULT false;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_upi_mappings_upi_id" ON "upi_mappings" ("upi_id");
CREATE INDEX IF NOT EXISTS "idx_upi_mappings_property_id" ON "upi_mappings" ("property_id");
CREATE INDEX IF NOT EXISTS "idx_upi_mappings_tenant_id" ON "upi_mappings" ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_payment_submissions_tenant_id" ON "payment_submissions" ("tenant_id");
CREATE INDEX IF NOT EXISTS "idx_payment_submissions_property_id" ON "payment_submissions" ("property_id");
CREATE INDEX IF NOT EXISTS "idx_payment_submissions_status" ON "payment_submissions" ("status");
CREATE INDEX IF NOT EXISTS "idx_payment_submissions_date" ON "payment_submissions" ("date");
CREATE INDEX IF NOT EXISTS "idx_parsing_logs_created_at" ON "parsing_logs" ("created_at");

-- Insert sample UPI mappings for testing
INSERT INTO "upi_mappings" ("upi_id", "property_id", "tenant_id", "is_verified")
VALUES 
  ('itis.nitinsharma@okicici', 1, 1, true),
  ('chetansharma140986@okhdfcbank', 4, 4, true)
ON CONFLICT ("upi_id") DO NOTHING;