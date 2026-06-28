"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { miscellaneous } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { miscSchema } from "@/lib/validations";

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
  return miscSchema.parse({
    date: formData.get("date"),
    toWhom: formData.get("toWhom"),
    byWho: formData.get("byWho"),
    amount: formData.get("amount"),
    remarks: formData.get("remarks") || undefined,
  });
}

export async function addMisc(formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);

  await db.insert(miscellaneous).values({
    date: parsed.date,
    toWhom: parsed.toWhom,
    byWho: parsed.byWho,
    amount: String(parsed.amount),
    remarks: parsed.remarks || null,
    createdById: Number(user.id),
  });

  revalidatePath("/miscellaneous");
  revalidatePath("/");
}

export async function updateMisc(id: number, formData: FormData) {
  await requireUser();
  const parsed = parseForm(formData);

  await db
    .update(miscellaneous)
    .set({
      date: parsed.date,
      toWhom: parsed.toWhom,
      byWho: parsed.byWho,
      amount: String(parsed.amount),
      remarks: parsed.remarks || null,
      updatedAt: new Date(),
    })
    .where(eq(miscellaneous.id, id));

  revalidatePath("/miscellaneous");
  revalidatePath("/");
}

export async function deleteMisc(id: number) {
  await requireAdmin();
  await db.delete(miscellaneous).where(eq(miscellaneous.id, id));
  revalidatePath("/miscellaneous");
  revalidatePath("/");
}
