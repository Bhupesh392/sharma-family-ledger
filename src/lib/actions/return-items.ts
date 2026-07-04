"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { returnItems } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { returnItemSchema } from "@/lib/validations";
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
function parseForm(formData: FormData) {
  return returnItemSchema.parse({
    category: formData.get("category"),
    amount: formData.get("amount"),
    submittedToNitin: formData.get("submittedToNitin"),
    status: formData.get("status"),
    whoReturned: formData.get("whoReturned") || undefined,
    mode: formData.get("mode") || undefined,
    transactionId: formData.get("transactionId") || undefined,
    date: formData.get("date") || undefined,
  });
}

export async function addReturnItem(formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);

  const [row] = await db.insert(returnItems).values({
    category: parsed.category, amount: String(parsed.amount),
    submittedToNitin: parsed.submittedToNitin, status: parsed.status,
    whoReturned: parsed.whoReturned || null, mode: parsed.mode || null,
    transactionId: parsed.transactionId || null, date: parsed.date || null,
    createdById: Number(user.id),
  }).returning();

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "CREATE", entityType: "RETURN_ITEM", entityId: row.id,
    entityLabel: `${parsed.category}`,
    newValues: { ...parsed },
  });

  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function updateReturnItem(id: number, formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);
  const [old] = await db.select().from(returnItems).where(eq(returnItems.id, id)).limit(1);

  await db.update(returnItems).set({
    category: parsed.category, amount: String(parsed.amount),
    submittedToNitin: parsed.submittedToNitin, status: parsed.status,
    whoReturned: parsed.whoReturned || null, mode: parsed.mode || null,
    transactionId: parsed.transactionId || null, date: parsed.date || null,
    updatedAt: new Date(),
  }).where(eq(returnItems.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "UPDATE", entityType: "RETURN_ITEM", entityId: id,
    entityLabel: `${parsed.category}`,
    oldValues: old ? { category: old.category, amount: old.amount, status: old.status } : null,
    newValues: { ...parsed },
  });

  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function deleteReturnItem(id: number) {
  const user = await requireAdmin();
  const [old] = await db.select().from(returnItems).where(eq(returnItems.id, id)).limit(1);
  await db.delete(returnItems).where(eq(returnItems.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "DELETE", entityType: "RETURN_ITEM", entityId: id,
    entityLabel: old ? old.category : `Return #${id}`,
    oldValues: old ? { category: old.category, amount: old.amount } : null,
  });

  revalidatePath("/expenses");
  revalidatePath("/");
}
