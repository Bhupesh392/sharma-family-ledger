"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chitrakootRent } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { chitrakootSchema } from "@/lib/validations";

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

function parseForm(formData: FormData) {
  return chitrakootSchema.parse({
    month: formData.get("month"),
    amount: formData.get("amount"),
    paidTo: formData.get("paidTo"),
    mode: formData.get("mode"),
    submittedAmount: formData.get("submittedAmount") || undefined,
    submittedDate: formData.get("submittedDate") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function addChitrakootRent(formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);

  await db.insert(chitrakootRent).values({
    month: parsed.month,
    amount: String(parsed.amount),
    paidTo: parsed.paidTo,
    mode: parsed.mode,
    submittedAmount:
      parsed.submittedAmount != null ? String(parsed.submittedAmount) : null,
    submittedDate: parsed.submittedDate || null,
    notes: parsed.notes || null,
    createdById: Number(user.id),
  });

  revalidatePath("/chitrakoot-rent");
  revalidatePath("/");
}

export async function updateChitrakootRent(id: number, formData: FormData) {
  await requireUser();
  const parsed = parseForm(formData);

  await db
    .update(chitrakootRent)
    .set({
      month: parsed.month,
      amount: String(parsed.amount),
      paidTo: parsed.paidTo,
      mode: parsed.mode,
      submittedAmount:
        parsed.submittedAmount != null ? String(parsed.submittedAmount) : null,
      submittedDate: parsed.submittedDate || null,
      notes: parsed.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(chitrakootRent.id, id));

  revalidatePath("/chitrakoot-rent");
  revalidatePath("/");
}

export async function deleteChitrakootRent(id: number) {
  await requireAdmin();
  await db.delete(chitrakootRent).where(eq(chitrakootRent.id, id));
  revalidatePath("/chitrakoot-rent");
  revalidatePath("/");
}
