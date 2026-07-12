"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenants } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { tenantSchema } from "@/lib/validations";
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
  return tenantSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
    idProofType: formData.get("idProofType") || undefined,
    idProofNumber: formData.get("idProofNumber") || undefined,
    occupation: formData.get("occupation") || undefined,
    numberOfOccupants: formData.get("numberOfOccupants") || undefined,
    emergencyContactName: formData.get("emergencyContactName") || undefined,
    emergencyContactPhone: formData.get("emergencyContactPhone") || undefined,
    notes: formData.get("notes") || undefined,
    policeVerified: formData.get("policeVerified") ? true : false,
    policeVerificationDate: formData.get("policeVerificationDate") || undefined,
  });
}

export async function addTenant(formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);

  const [row] = await db.insert(tenants).values({
    name: parsed.name, phone: parsed.phone || null,
    email: parsed.email || null, idProofType: parsed.idProofType || null,
    idProofNumber: parsed.idProofNumber || null,
    occupation: parsed.occupation || null,
    numberOfOccupants: parsed.numberOfOccupants ?? null,
    emergencyContactName: parsed.emergencyContactName || null,
    emergencyContactPhone: parsed.emergencyContactPhone || null,
    policeVerified: parsed.policeVerified ?? false,
    policeVerificationDate: parsed.policeVerificationDate || null,
    notes: parsed.notes || null,
  }).returning();

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "CREATE", entityType: "TENANT", entityId: row.id,
    entityLabel: parsed.name,
    newValues: { name: parsed.name, phone: parsed.phone, occupation: parsed.occupation },
  });

  revalidatePath("/tenants");
  revalidatePath("/properties");
  revalidatePath("/");
}

export async function updateTenant(id: number, formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);
  const [old] = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);

  await db.update(tenants).set({
    name: parsed.name, phone: parsed.phone || null,
    email: parsed.email || null, idProofType: parsed.idProofType || null,
    idProofNumber: parsed.idProofNumber || null,
    occupation: parsed.occupation || null,
    numberOfOccupants: parsed.numberOfOccupants ?? null,
    emergencyContactName: parsed.emergencyContactName || null,
    emergencyContactPhone: parsed.emergencyContactPhone || null,
    policeVerified: parsed.policeVerified ?? false,
    policeVerificationDate: parsed.policeVerificationDate || null,
    notes: parsed.notes || null, updatedAt: new Date(),
  }).where(eq(tenants.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "UPDATE", entityType: "TENANT", entityId: id,
    entityLabel: parsed.name,
    oldValues: old
      ? { name: old.name, phone: old.phone, occupation: old.occupation, policeVerified: old.policeVerified }
      : null,
    newValues: {
      name: parsed.name,
      phone: parsed.phone,
      occupation: parsed.occupation,
      policeVerified: parsed.policeVerified ?? false,
    },
  });

  revalidatePath("/tenants");
  revalidatePath("/properties");
  revalidatePath("/");
}

export async function deleteTenant(id: number) {
  const user = await requireAdmin();
  const [old] = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
  await db.delete(tenants).where(eq(tenants.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "DELETE", entityType: "TENANT", entityId: id,
    entityLabel: old ? old.name : `Tenant #${id}`,
    oldValues: old ? { name: old.name, phone: old.phone } : null,
  });

  revalidatePath("/tenants");
  revalidatePath("/properties");
  revalidatePath("/");
}
