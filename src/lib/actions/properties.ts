"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { propertySchema } from "@/lib/validations";
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
  return propertySchema.parse({
    name: formData.get("name"),
    type: formData.get("type"),
    rentLedger: formData.get("rentLedger"),
    address: formData.get("address") || undefined,
    monthlyRent: formData.get("monthlyRent") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function addProperty(formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);

  const [row] = await db.insert(properties).values({
    name: parsed.name, type: parsed.type, rentLedger: parsed.rentLedger,
    address: parsed.address || null,
    monthlyRent: parsed.monthlyRent != null ? String(parsed.monthlyRent) : null,
    imageUrl: parsed.imageUrl || null, notes: parsed.notes || null,
  }).returning();

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "CREATE", entityType: "PROPERTY", entityId: row.id,
    entityLabel: parsed.name,
    newValues: { name: parsed.name, type: parsed.type, monthlyRent: parsed.monthlyRent },
  });

  revalidatePath("/properties");
  revalidatePath("/");
}

export async function updateProperty(id: number, formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);
  const [old] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);

  await db.update(properties).set({
    name: parsed.name, type: parsed.type, rentLedger: parsed.rentLedger,
    address: parsed.address || null,
    monthlyRent: parsed.monthlyRent != null ? String(parsed.monthlyRent) : null,
    imageUrl: parsed.imageUrl || null, notes: parsed.notes || null,
    updatedAt: new Date(),
  }).where(eq(properties.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "UPDATE", entityType: "PROPERTY", entityId: id,
    entityLabel: parsed.name,
    oldValues: old ? { name: old.name, type: old.type, monthlyRent: old.monthlyRent } : null,
    newValues: { name: parsed.name, type: parsed.type, monthlyRent: parsed.monthlyRent },
  });

  revalidatePath("/properties");
  revalidatePath("/");
}

export async function deleteProperty(id: number) {
  const user = await requireAdmin();
  const [old] = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
  await db.delete(properties).where(eq(properties.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "DELETE", entityType: "PROPERTY", entityId: id,
    entityLabel: old ? old.name : `Property #${id}`,
    oldValues: old ? { name: old.name, type: old.type, monthlyRent: old.monthlyRent } : null,
  });

  revalidatePath("/properties");
  revalidatePath("/");
}
