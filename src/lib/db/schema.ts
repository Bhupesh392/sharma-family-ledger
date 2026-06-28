import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  date,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["ADMIN", "MEMBER"]);
export const floorEnum = pgEnum("floor", ["GROUND", "FIRST", "SECOND"]);
export const returnStatusEnum = pgEnum("return_status", [
  "PENDING",
  "COMPLETED",
]);

// ---------- Users ----------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: roleEnum("role").notNull().default("MEMBER"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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
