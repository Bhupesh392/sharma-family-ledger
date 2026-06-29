"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { propertySchema } from "@/lib/validations";

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
    address: formData.get("address") || undefined,
    monthlyRent: formData.get("monthlyRent") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function addProperty(formData: FormData) {
  await requireUser();
  const parsed = parseForm(formData);

  await db.insert(properties).values({
    name: parsed.name,
    type: parsed.type,
    address: parsed.address || null,
    monthlyRent: parsed.monthlyRent != null ? String(parsed.monthlyRent) : null,
    imageUrl: parsed.imageUrl || null,
    notes: parsed.notes || null,
  });

  revalidatePath("/properties");
  revalidatePath("/");
}

export async function updateProperty(id: number, formData: FormData) {
  await requireUser();
  const parsed = parseForm(formData);

  await db
    .update(properties)
    .set({
      name: parsed.name,
      type: parsed.type,
      address: parsed.address || null,
      monthlyRent: parsed.monthlyRent != null ? String(parsed.monthlyRent) : null,
      imageUrl: parsed.imageUrl || null,
      notes: parsed.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(properties.id, id));

  revalidatePath("/properties");
  revalidatePath("/");
}

export async function deleteProperty(id: number) {
  await requireAdmin();
  await db.delete(properties).where(eq(properties.id, id));
  revalidatePath("/properties");
  revalidatePath("/");
}
