/**
 * Seed script — run once to set up family accounts and import historical
 * data from the old Excel sheet.
 *
 *   npx tsx scripts/seed.ts
 *
 * Edit FAMILY_MEMBERS below before running (names + initial passwords).
 * Everyone should change their password is not built in yet — for a
 * family ledger, simplest is to just tell them their password directly.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";
import {
  users,
  e392Rent,
  e392Utilities,
  chitrakootRent,
  construction,
  returnItems,
  miscellaneous,
} from "../src/lib/db/schema";
import seedData from "./seed-data.json";

// ---- 1. Family member accounts ----------------------------------------
// role ADMIN = can delete entries. role MEMBER = can add/edit only.
const FAMILY_MEMBERS: {
  name: string;
  username: string;
  password: string;
  role: "ADMIN" | "MEMBER";
}[] = [
  { name: "Nitin Sharma", username: "nitin", password: "ChangeMe123!", role: "ADMIN" },
  { name: "Chetan Sharma", username: "chetan", password: "ChangeMe123!", role: "MEMBER" },
  { name: "Bhupesh Sharma", username: "bhupesh", password: "ChangeMe123!", role: "MEMBER" },
];

async function main() {
  console.log("Seeding users...");
  for (const m of FAMILY_MEMBERS) {
    const passwordHash = await bcrypt.hash(m.password, 10);
    await db
      .insert(users)
      .values({
        name: m.name,
        username: m.username.toLowerCase(),
        passwordHash,
        role: m.role,
      })
      .onConflictDoNothing();
  }

  console.log("Importing E-392 Ground Floor rent...");
  for (const row of seedData.e392_ground) {
    await db.insert(e392Rent).values({
      month: row.month,
      floor: "GROUND",
      rent: String(row.rent),
      paidTo: row.paidTo,
      mode: row.mode,
    });
  }

  console.log("Importing E-392 First Floor rent...");
  for (const row of seedData.e392_first) {
    await db.insert(e392Rent).values({
      month: row.month,
      floor: "FIRST",
      rent: String(row.rent),
      paidTo: row.paidTo,
      mode: row.mode,
    });
  }

  console.log("Importing E-392 Second Floor rent...");
  for (const row of seedData.e392_second) {
    await db.insert(e392Rent).values({
      month: row.month,
      floor: "SECOND",
      rent: String(row.rent),
      paidTo: row.paidTo,
      mode: row.mode,
    });
  }

  console.log("Importing E-392 Utilities...");
  for (const row of seedData.e392_utilities) {
    await db.insert(e392Utilities).values({
      date: row.date,
      utility: row.utility ?? "Utility",
      floor: row.floor as "GROUND" | "FIRST" | "SECOND",
      paidTo: row.paidTo ?? "",
      amount: String(row.amount),
      mode: row.mode,
    });
  }

  console.log("Importing Chitrakoot Shop rent...");
  for (const row of seedData.chitrakoot_rent) {
    await db.insert(chitrakootRent).values({
      month: row.month,
      amount: String(row.amount),
      paidTo: row.paidTo,
      mode: row.mode,
      submittedAmount: row.submittedAmount != null ? String(row.submittedAmount) : null,
      submittedDate: row.submittedDate,
      notes: row.notes,
    });
  }

  console.log("Importing JagdishPuri Construction expenses...");
  for (const row of seedData.construction) {
    await db.insert(construction).values({
      whatFor: row.whatFor,
      amount: String(row.amount),
      whoPaid: row.whoPaid,
      toWhom: row.toWhom,
      transactionId: row.transactionId,
      mode: row.mode,
      date: row.date,
    });
  }

  console.log("Importing Return Items...");
  for (const row of seedData.return_items) {
    await db.insert(returnItems).values({
      category: row.category,
      amount: String(row.amount),
      submittedToNitin: row.submittedToNitin,
      status: row.status as "PENDING" | "COMPLETED",
      whoReturned: row.whoReturned,
      mode: row.mode,
      transactionId: row.transactionId,
      date: row.date,
    });
  }

  console.log("Importing Miscellaneous expenses...");
  for (const row of seedData.miscellaneous) {
    if (!row.date) continue;
    await db.insert(miscellaneous).values({
      date: row.date,
      toWhom: row.toWhom ?? "",
      byWho: row.byWho ?? "",
      amount: String(row.amount),
      remarks: row.remarks,
    });
  }

  console.log("Done seeding.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
