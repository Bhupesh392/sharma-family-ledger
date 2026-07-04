"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { e392Rent, e392Utilities } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { rentSchema, utilitySchema } from "@/lib/validations";
import { logActivity } from "@/lib/activity";

async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");
  return session.user;
}

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("Only an admin can do this");
  return user;
}

// ---------- Rent ----------
export async function addRent(formData: FormData) {
  const user = await requireUser();
  const parsed = rentSchema.parse({
    month: formData.get("month"),
    floor: formData.get("floor"),
    rent: formData.get("rent"),
    paidTo: formData.get("paidTo"),
    mode: formData.get("mode"),
    notes: formData.get("notes") || undefined,
  });

  const [row] = await db.insert(e392Rent).values({
    month: parsed.month,
    floor: parsed.floor,
    rent: String(parsed.rent),
    paidTo: parsed.paidTo,
    mode: parsed.mode,
    notes: parsed.notes || null,
    createdById: Number(user.id),
  }).returning();

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "CREATE", entityType: "RENT", entityId: row.id,
    entityLabel: `${parsed.floor} Floor · ${parsed.month}`,
    newValues: { ...parsed },
  });

  revalidatePath("/income");
  revalidatePath("/");
}

export async function updateRent(id: number, formData: FormData) {
  const user = await requireUser();
  const parsed = rentSchema.parse({
    month: formData.get("month"),
    floor: formData.get("floor"),
    rent: formData.get("rent"),
    paidTo: formData.get("paidTo"),
    mode: formData.get("mode"),
    notes: formData.get("notes") || undefined,
  });

  const [old] = await db.select().from(e392Rent).where(eq(e392Rent.id, id)).limit(1);

  await db.update(e392Rent).set({
    month: parsed.month, floor: parsed.floor,
    rent: String(parsed.rent), paidTo: parsed.paidTo,
    mode: parsed.mode, notes: parsed.notes || null,
    updatedAt: new Date(),
  }).where(eq(e392Rent.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "UPDATE", entityType: "RENT", entityId: id,
    entityLabel: `${parsed.floor} Floor · ${parsed.month}`,
    oldValues: old ? { month: old.month, floor: old.floor, rent: old.rent, paidTo: old.paidTo, mode: old.mode } : null,
    newValues: { ...parsed },
  });

  revalidatePath("/income");
  revalidatePath("/");
}

export async function deleteRent(id: number) {
  const user = await requireAdmin();
  const [old] = await db.select().from(e392Rent).where(eq(e392Rent.id, id)).limit(1);
  await db.delete(e392Rent).where(eq(e392Rent.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "DELETE", entityType: "RENT", entityId: id,
    entityLabel: old ? `${old.floor} Floor · ${old.month}` : `Rent #${id}`,
    oldValues: old ? { month: old.month, floor: old.floor, rent: old.rent } : null,
  });

  revalidatePath("/income");
  revalidatePath("/");
}

// ---------- Utilities ----------
export async function addUtility(formData: FormData) {
  const user = await requireUser();
  const parsed = utilitySchema.parse({
    date: formData.get("date"),
    utility: formData.get("utility"),
    floor: formData.get("floor"),
    paidTo: formData.get("paidTo"),
    amount: formData.get("amount"),
    mode: formData.get("mode") || undefined,
    notes: formData.get("notes") || undefined,
  });

  const [row] = await db.insert(e392Utilities).values({
    date: parsed.date, utility: parsed.utility,
    floor: parsed.floor, paidTo: parsed.paidTo,
    amount: String(parsed.amount), mode: parsed.mode || null,
    notes: parsed.notes || null, createdById: Number(user.id),
  }).returning();

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "CREATE", entityType: "UTILITY", entityId: row.id,
    entityLabel: `${parsed.utility} · ${parsed.floor} Floor · ${parsed.date}`,
    newValues: { ...parsed },
  });

  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function updateUtility(id: number, formData: FormData) {
  const user = await requireUser();
  const parsed = utilitySchema.parse({
    date: formData.get("date"),
    utility: formData.get("utility"),
    floor: formData.get("floor"),
    paidTo: formData.get("paidTo"),
    amount: formData.get("amount"),
    mode: formData.get("mode") || undefined,
    notes: formData.get("notes") || undefined,
  });

  const [old] = await db.select().from(e392Utilities).where(eq(e392Utilities.id, id)).limit(1);

  await db.update(e392Utilities).set({
    date: parsed.date, utility: parsed.utility,
    floor: parsed.floor, paidTo: parsed.paidTo,
    amount: String(parsed.amount), mode: parsed.mode || null,
    notes: parsed.notes || null, updatedAt: new Date(),
  }).where(eq(e392Utilities.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "UPDATE", entityType: "UTILITY", entityId: id,
    entityLabel: `${parsed.utility} · ${parsed.floor} Floor`,
    oldValues: old ? { utility: old.utility, floor: old.floor, amount: old.amount, date: old.date } : null,
    newValues: { ...parsed },
  });

  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function deleteUtility(id: number) {
  const user = await requireAdmin();
  const [old] = await db.select().from(e392Utilities).where(eq(e392Utilities.id, id)).limit(1);
  await db.delete(e392Utilities).where(eq(e392Utilities.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "DELETE", entityType: "UTILITY", entityId: id,
    entityLabel: old ? `${old.utility} · ${old.floor} Floor` : `Utility #${id}`,
    oldValues: old ? { utility: old.utility, floor: old.floor, amount: old.amount } : null,
  });

  revalidatePath("/expenses");
  revalidatePath("/");
}
