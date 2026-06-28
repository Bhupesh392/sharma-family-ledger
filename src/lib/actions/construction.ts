"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { construction } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { constructionSchema } from "@/lib/validations";

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
  return constructionSchema.parse({
    whatFor: formData.get("whatFor"),
    amount: formData.get("amount"),
    whoPaid: formData.get("whoPaid"),
    toWhom: formData.get("toWhom") || undefined,
    transactionId: formData.get("transactionId") || undefined,
    mode: formData.get("mode") || undefined,
    date: formData.get("date") || undefined,
  });
}

export async function addConstruction(formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);

  await db.insert(construction).values({
    whatFor: parsed.whatFor,
    amount: String(parsed.amount),
    whoPaid: parsed.whoPaid,
    toWhom: parsed.toWhom || null,
    transactionId: parsed.transactionId || null,
    mode: parsed.mode || null,
    date: parsed.date || null,
    createdById: Number(user.id),
  });

  revalidatePath("/construction");
  revalidatePath("/");
}

export async function updateConstruction(id: number, formData: FormData) {
  await requireUser();
  const parsed = parseForm(formData);

  await db
    .update(construction)
    .set({
      whatFor: parsed.whatFor,
      amount: String(parsed.amount),
      whoPaid: parsed.whoPaid,
      toWhom: parsed.toWhom || null,
      transactionId: parsed.transactionId || null,
      mode: parsed.mode || null,
      date: parsed.date || null,
      updatedAt: new Date(),
    })
    .where(eq(construction.id, id));

  revalidatePath("/construction");
  revalidatePath("/");
}

export async function deleteConstruction(id: number) {
  await requireAdmin();
  await db.delete(construction).where(eq(construction.id, id));
  revalidatePath("/construction");
  revalidatePath("/");
}
