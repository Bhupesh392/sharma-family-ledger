"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { miscellaneous } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { miscSchema } from "@/lib/validations";
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

  const [row] = await db.insert(miscellaneous).values({
    date: parsed.date, toWhom: parsed.toWhom,
    byWho: parsed.byWho, amount: String(parsed.amount),
    remarks: parsed.remarks || null, createdById: Number(user.id),
  }).returning();

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "CREATE", entityType: "MISC", entityId: row.id,
    entityLabel: `${parsed.toWhom} · ${parsed.date}`,
    newValues: { ...parsed },
  });

  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function updateMisc(id: number, formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);
  const [old] = await db.select().from(miscellaneous).where(eq(miscellaneous.id, id)).limit(1);

  await db.update(miscellaneous).set({
    date: parsed.date, toWhom: parsed.toWhom,
    byWho: parsed.byWho, amount: String(parsed.amount),
    remarks: parsed.remarks || null, updatedAt: new Date(),
  }).where(eq(miscellaneous.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "UPDATE", entityType: "MISC", entityId: id,
    entityLabel: `${parsed.toWhom} · ${parsed.date}`,
    oldValues: old ? { toWhom: old.toWhom, amount: old.amount, date: old.date } : null,
    newValues: { ...parsed },
  });

  revalidatePath("/expenses");
  revalidatePath("/");
}

export async function deleteMisc(id: number) {
  const user = await requireAdmin();
  const [old] = await db.select().from(miscellaneous).where(eq(miscellaneous.id, id)).limit(1);
  await db.delete(miscellaneous).where(eq(miscellaneous.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "DELETE", entityType: "MISC", entityId: id,
    entityLabel: old ? `${old.toWhom} · ${old.date}` : `Misc #${id}`,
    oldValues: old ? { toWhom: old.toWhom, amount: old.amount } : null,
  });

  revalidatePath("/expenses");
  revalidatePath("/");
}
