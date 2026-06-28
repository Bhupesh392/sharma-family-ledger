import { db } from "@/lib/db";
import {
  e392Rent,
  e392Utilities,
  chitrakootRent,
  construction,
  returnItems,
  miscellaneous,
} from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function getAllRent() {
  return db.select().from(e392Rent).orderBy(desc(e392Rent.month));
}

export async function getAllUtilities() {
  return db.select().from(e392Utilities).orderBy(desc(e392Utilities.date));
}

export async function getAllChitrakootRent() {
  return db.select().from(chitrakootRent).orderBy(desc(chitrakootRent.month));
}

export async function getAllConstruction() {
  return db.select().from(construction).orderBy(desc(construction.date));
}

export async function getAllReturnItems() {
  return db.select().from(returnItems).orderBy(desc(returnItems.date));
}

export async function getAllMisc() {
  return db.select().from(miscellaneous).orderBy(desc(miscellaneous.date));
}

export async function getDashboardSummary() {
  const [rent, utilities, chitrakoot, constructionRows, returns, misc] =
    await Promise.all([
      getAllRent(),
      getAllUtilities(),
      getAllChitrakootRent(),
      getAllConstruction(),
      getAllReturnItems(),
      getAllMisc(),
    ]);

  const sum = (arr: { amount?: string; rent?: string }[], key: "amount" | "rent" = "amount") =>
    arr.reduce((acc, r) => acc + parseFloat((r as Record<string, string>)[key] ?? "0"), 0);

  const e392RentTotal = sum(rent, "rent");
  const e392UtilitiesTotal = sum(utilities);
  const chitrakootRentTotal = sum(chitrakoot);
  const chitrakootSubmittedTotal = chitrakoot.reduce(
    (acc, r) => acc + (r.submittedAmount ? parseFloat(r.submittedAmount) : 0),
    0
  );
  const constructionTotal = sum(constructionRows);
  const returnsTotal = sum(returns);
  const miscTotal = sum(misc);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const rentThisMonth = rent.filter((r) => r.month.startsWith(currentMonthKey));
  const floorTotals = {
    GROUND: sum(rent.filter((r) => r.floor === "GROUND"), "rent"),
    FIRST: sum(rent.filter((r) => r.floor === "FIRST"), "rent"),
    SECOND: sum(rent.filter((r) => r.floor === "SECOND"), "rent"),
  };

  const totalIncome = e392RentTotal + chitrakootRentTotal;
  const totalExpense = e392UtilitiesTotal + constructionTotal + miscTotal;
  const pendingChitrakootDifference = chitrakootRentTotal - chitrakootSubmittedTotal;

  return {
    e392RentTotal,
    e392UtilitiesTotal,
    chitrakootRentTotal,
    chitrakootSubmittedTotal,
    pendingChitrakootDifference,
    constructionTotal,
    returnsTotal,
    miscTotal,
    floorTotals,
    rentThisMonthCount: rentThisMonth.length,
    totalIncome,
    totalExpense,
    counts: {
      rent: rent.length,
      utilities: utilities.length,
      chitrakoot: chitrakoot.length,
      construction: constructionRows.length,
      returns: returns.length,
      misc: misc.length,
    },
    recentRent: rent.slice(0, 5),
    recentMisc: misc.slice(0, 5),
    recentConstruction: constructionRows.slice(0, 5),
  };
}
