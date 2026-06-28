"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { e392Rent, e392Utilities } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { rentSchema, utilitySchema } from "@/lib/validations";

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

  await db.insert(e392Rent).values({
    month: parsed.month,
    floor: parsed.floor,
    rent: String(parsed.rent),
    paidTo: parsed.paidTo,
    mode: parsed.mode,
    notes: parsed.notes || null,
    createdById: Number(user.id),
  });

  revalidatePath("/e392-rent");
  revalidatePath("/");
}

export async function updateRent(id: number, formData: FormData) {
  await requireUser();
  const parsed = rentSchema.parse({
    month: formData.get("month"),
    floor: formData.get("floor"),
    rent: formData.get("rent"),
    paidTo: formData.get("paidTo"),
    mode: formData.get("mode"),
    notes: formData.get("notes") || undefined,
  });

  await db
    .update(e392Rent)
    .set({
      month: parsed.month,
      floor: parsed.floor,
      rent: String(parsed.rent),
      paidTo: parsed.paidTo,
      mode: parsed.mode,
      notes: parsed.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(e392Rent.id, id));

  revalidatePath("/e392-rent");
  revalidatePath("/");
}

export async function deleteRent(id: number) {
  await requireAdmin();
  await db.delete(e392Rent).where(eq(e392Rent.id, id));
  revalidatePath("/e392-rent");
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

  await db.insert(e392Utilities).values({
    date: parsed.date,
    utility: parsed.utility,
    floor: parsed.floor,
    paidTo: parsed.paidTo,
    amount: String(parsed.amount),
    mode: parsed.mode || null,
    notes: parsed.notes || null,
    createdById: Number(user.id),
  });

  revalidatePath("/e392-utilities");
  revalidatePath("/");
}

export async function updateUtility(id: number, formData: FormData) {
  await requireUser();
  const parsed = utilitySchema.parse({
    date: formData.get("date"),
    utility: formData.get("utility"),
    floor: formData.get("floor"),
    paidTo: formData.get("paidTo"),
    amount: formData.get("amount"),
    mode: formData.get("mode") || undefined,
    notes: formData.get("notes") || undefined,
  });

  await db
    .update(e392Utilities)
    .set({
      date: parsed.date,
      utility: parsed.utility,
      floor: parsed.floor,
      paidTo: parsed.paidTo,
      amount: String(parsed.amount),
      mode: parsed.mode || null,
      notes: parsed.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(e392Utilities.id, id));

  revalidatePath("/e392-utilities");
  revalidatePath("/");
}

export async function deleteUtility(id: number) {
  await requireAdmin();
  await db.delete(e392Utilities).where(eq(e392Utilities.id, id));
  revalidatePath("/e392-utilities");
  revalidatePath("/");
}
