"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { tenantSchema } from "@/lib/validations";

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
  return tenantSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function addTenant(formData: FormData) {
  await requireUser();
  const parsed = parseForm(formData);

  await db.insert(tenants).values({
    name: parsed.name,
    phone: parsed.phone || null,
    email: parsed.email || null,
    notes: parsed.notes || null,
  });

  revalidatePath("/tenants");
  revalidatePath("/properties");
  revalidatePath("/");
}

export async function updateTenant(id: number, formData: FormData) {
  await requireUser();
  const parsed = parseForm(formData);

  await db
    .update(tenants)
    .set({
      name: parsed.name,
      phone: parsed.phone || null,
      email: parsed.email || null,
      notes: parsed.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, id));

  revalidatePath("/tenants");
  revalidatePath("/properties");
  revalidatePath("/");
}

export async function deleteTenant(id: number) {
  await requireAdmin();
  await db.delete(tenants).where(eq(tenants.id, id));
  revalidatePath("/tenants");
  revalidatePath("/properties");
  revalidatePath("/");
}
