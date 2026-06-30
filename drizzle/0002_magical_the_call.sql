CREATE TYPE "public"."agreement_status" AS ENUM('ACTIVE', 'DUE_FOR_RENEWAL', 'EXPIRED', 'RENEWED', 'NOT_SET');--> statement-breakpoint
CREATE TYPE "public"."id_proof_type" AS ENUM('AADHAAR', 'PAN', 'PASSPORT', 'VOTER_ID', 'DRIVING_LICENSE', 'OTHER');--> statement-breakpoint
ALTER TABLE "tenancies" ADD COLUMN "agreement_start_date" date;--> statement-breakpoint
ALTER TABLE "tenancies" ADD COLUMN "agreement_duration_months" integer;--> statement-breakpoint
ALTER TABLE "tenancies" ADD COLUMN "agreement_renewal_date" date;--> statement-breakpoint
ALTER TABLE "tenancies" ADD COLUMN "agreement_status" "agreement_status" DEFAULT 'NOT_SET' NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "id_proof_type" "id_proof_type";--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "id_proof_number" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "occupation" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "number_of_occupants" integer;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "emergency_contact_name" text;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "emergency_contact_phone" text;