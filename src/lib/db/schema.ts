import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  date,
  timestamp,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["ADMIN", "MEMBER", "TENANT"]);
export const floorEnum = pgEnum("floor", ["GROUND", "FIRST", "SECOND"]);
export const returnStatusEnum = pgEnum("return_status", [
  "PENDING",
  "COMPLETED",
]);
export const propertyTypeEnum = pgEnum("property_type", [
  "RESIDENTIAL",
  "SHOP",
]);
export const rentLedgerEnum = pgEnum("rent_ledger", [
  "E392_GROUND",
  "E392_FIRST",
  "E392_SECOND",
  "CHITRAKOOT_SHOP",
  "OTHER",
]);
export const tenancyStatusEnum = pgEnum("tenancy_status", [
  "ACTIVE",
  "ENDED",
]);
export const agreementStatusEnum = pgEnum("agreement_status", [
  "ACTIVE",
  "DUE_FOR_RENEWAL",
  "EXPIRED",
  "RENEWED",
  "NOT_SET",
]);
export const idProofTypeEnum = pgEnum("id_proof_type", [
  "AADHAAR",
  "PAN",
  "PASSPORT",
  "VOTER_ID",
  "DRIVING_LICENSE",
  "OTHER",
]);

// ---------- Tenants ----------
// A tenant is a person, independent of which property they currently rent.
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  idProofType: idProofTypeEnum("id_proof_type"),
  idProofNumber: text("id_proof_number"),
  occupation: text("occupation"),
  numberOfOccupants: integer("number_of_occupants"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  policeVerified: boolean("police_verified").notNull().default(false),
  policeVerificationDate: date("police_verification_date"),
  passwordHash: text("password_hash"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Properties ----------
// One row per rentable unit: E-392 Ground/First/Second floor, Chitrakoot Shop.
// Designed to be extensible if more properties are added later.
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g. "E-392 Ground Floor"
  type: propertyTypeEnum("type").notNull().default("RESIDENTIAL"),
  // Which underlying rent table this property's income is tracked in.
  // Used to know where to log a new rent entry on renewal (e.g. from
  // "Mark as renewed"). OTHER means: just update monthlyRent, don't
  // auto-log anywhere.
  rentLedger: rentLedgerEnum("rent_ledger").notNull().default("OTHER"),
  address: text("address"),
  monthlyRent: numeric("monthly_rent", { precision: 12, scale: 2 }),
  imageUrl: text("image_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Users ----------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("MEMBER"),
  tenantId: integer("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Tenancies ----------
// Links a tenant to a property for a date range. A property's current
// occupancy is derived from whether it has a tenancy with status ACTIVE.
export const tenancies = pgTable("tenancies", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id")
    .notNull()
    .references(() => properties.id),
  tenantId: integer("tenant_id")
    .notNull()
    .references(() => tenants.id),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  status: tenancyStatusEnum("status").notNull().default("ACTIVE"),
  securityDeposit: numeric("security_deposit", { precision: 12, scale: 2 }),
  depositReturned: numeric("deposit_returned", { precision: 12, scale: 2 }),
  // Rent agreement tracking. Renewal date is stored (not just computed on
  // the fly) so it can be filtered/sorted on directly; it's kept in sync
  // with agreementStartDate + agreementDurationMonths by the server action.
  agreementStartDate: date("agreement_start_date"),
  agreementDurationMonths: integer("agreement_duration_months"),
  agreementRenewalDate: date("agreement_renewal_date"),
  agreementStatus: agreementStatusEnum("agreement_status").notNull().default("NOT_SET"),
  notes: text("notes"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- E-392 Rent (per floor) ----------
export const e392Rent = pgTable("e392_rent", {
  id: serial("id").primaryKey(),
  month: date("month").notNull(), // first of month
  floor: floorEnum("floor").notNull(),
  rent: numeric("rent", { precision: 12, scale: 2 }).notNull(),
  paidTo: text("paid_to").notNull().default("Nitin Sharma"),
  mode: text("mode").notNull().default("Online"),
  notes: text("notes"),
  propertyId: integer("property_id").references(() => properties.id),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- E-392 Utilities ----------
export const e392Utilities = pgTable("e392_utilities", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  utility: text("utility").notNull(), // Water Bill / Electricity Bill / etc
  floor: floorEnum("floor").notNull(),
  paidTo: text("paid_to").notNull(), // PHED / JVVNL etc
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  mode: text("mode"),
  notes: text("notes"),
  propertyId: integer("property_id").references(() => properties.id),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Chitrakoot Shop Rent ----------
export const chitrakootRent = pgTable("chitrakoot_rent", {
  id: serial("id").primaryKey(),
  month: date("month").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  paidTo: text("paid_to").notNull().default("Chetan Sharma"),
  mode: text("mode").notNull().default("UPI"),
  submittedAmount: numeric("submitted_amount", { precision: 12, scale: 2 }),
  submittedDate: date("submitted_date"),
  notes: text("notes"),
  propertyId: integer("property_id").references(() => properties.id),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- JagdishPuri Construction ----------
export const construction = pgTable("construction", {
  id: serial("id").primaryKey(),
  whatFor: text("what_for").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  whoPaid: text("who_paid").notNull().default("Nitin Sharma"),
  toWhom: text("to_whom"),
  transactionId: text("transaction_id"),
  mode: text("mode"),
  date: date("date"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Return Items ----------
export const returnItems = pgTable("return_items", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  submittedToNitin: text("submitted_to_nitin").notNull().default("Yes"),
  status: returnStatusEnum("status").notNull().default("PENDING"),
  whoReturned: text("who_returned"),
  mode: text("mode"),
  transactionId: text("transaction_id"),
  date: date("date"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Miscellaneous ----------
export const miscellaneous = pgTable("miscellaneous", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  toWhom: text("to_whom").notNull(),
  byWho: text("by_who").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  remarks: text("remarks"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Activity Log ----------
export const actionEnum = pgEnum("action_type", ["CREATE", "UPDATE", "DELETE"]);
export const entityTypeEnum = pgEnum("entity_type", [
  "RENT", "UTILITY", "CHITRAKOOT_RENT", "CONSTRUCTION",
  "RETURN_ITEM", "MISC", "PROPERTY", "TENANT", "TENANCY", "DOCUMENT",
]);

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  userName: text("user_name").notNull(),
  action: actionEnum("action").notNull(),
  entityType: entityTypeEnum("entity_type").notNull(),
  entityId: integer("entity_id"),
  entityLabel: text("entity_label").notNull(),
  oldValues: text("old_values"),   // JSON string — JSONB via text for compatibility
  newValues: text("new_values"),   // JSON string
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Page Views ----------
export const pageViews = pgTable("page_views", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  userName: text("user_name").notNull(),
  page: text("page").notNull(),
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ---------- Documents ----------
export const docTypeEnum = pgEnum("doc_type", [
  "AGREEMENT",
  "ID_DOCUMENT",
  "RECEIPT",
  "OTHER",
]);

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  docType: docTypeEnum("doc_type").notNull().default("OTHER"),
  // Encrypted Drive link — stored as "iv:authTag:ciphertext" (hex-encoded).
  // Never decrypted until the user explicitly clicks "Open".
  encryptedUrl: text("encrypted_url").notNull(),
  propertyId: integer("property_id").references(() => properties.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  notes: text("notes"),
  uploadedById: integer("uploaded_by_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- UPI Mappings ----------
// Maps UPI IDs to properties/tenants for automatic payment matching
export const upiMappings = pgTable("upi_mappings", {
  id: serial("id").primaryKey(),
  upiId: text("upi_id").notNull().unique(),
  propertyId: integer("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  tenantId: integer("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  isVerified: boolean("is_verified").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Payment Submissions ----------
// Tracks rent payment submissions from tenants (via WhatsApp/image upload)
export const paymentSubmissions = pgTable("payment_submissions", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  propertyId: integer("property_id")
    .notNull()
    .references(() => properties.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  date: date("date").notNull(),
  transactionId: text("transaction_id"),
  bank: text("bank"),
  upiId: text("upi_id"),
  rawMessage: text("raw_message"),
  imageUrl: text("image_url"),
  parsedData: text("parsed_data"), // JSON string
  confidenceScore: integer("confidence_score"),
  status: text("status").notNull().default("PENDING"), // PENDING, APPROVED, REJECTED
  reviewedById: integer("reviewed_by_id").references(() => users.id, { onDelete: "set null" }),
  reviewedAt: timestamp("reviewed_at"),
  rentEntryId: integer("rent_entry_id"), // Link to created rent entry
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---------- Relations ----------
// Required for Drizzle ORM `with:` queries to work

export const paymentSubmissionsRelations = relations(paymentSubmissions, ({ one }) => ({
  tenant: one(tenants, {
    fields: [paymentSubmissions.tenantId],
    references: [tenants.id],
  }),
  property: one(properties, {
    fields: [paymentSubmissions.propertyId],
    references: [properties.id],
  }),
  reviewedBy: one(users, {
    fields: [paymentSubmissions.reviewedById],
    references: [users.id],
  }),
}));

export const tenantsRelations = relations(tenants, ({ many }) => ({
  paymentSubmissions: many(paymentSubmissions),
}));

export const propertiesRelations = relations(properties, ({ many }) => ({
  paymentSubmissions: many(paymentSubmissions),
}));

export const usersRelations = relations(users, ({ many }) => ({
  reviewedSubmissions: many(paymentSubmissions),
}));

export const upiMappingsRelations = relations(upiMappings, ({ one }) => ({
  property: one(properties, {
    fields: [upiMappings.propertyId],
    references: [properties.id],
  }),
  tenant: one(tenants, {
    fields: [upiMappings.tenantId],
    references: [tenants.id],
  }),
}));

// ---------- Parsing Logs ----------
// Logs parsing attempts for improving accuracy
export const parsingLogs = pgTable("parsing_logs", {
  id: serial("id").primaryKey(),
  rawInput: text("raw_input").notNull(),
  parsedResult: text("parsed_result"), // JSON string
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  parserVersion: text("parser_version").notNull().default("1.0.0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
