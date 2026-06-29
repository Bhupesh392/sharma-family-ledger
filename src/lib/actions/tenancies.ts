"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenancies } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { tenancySchema } from "@/lib/validations";

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
  return tenancySchema.parse({
    propertyId: formData.get("propertyId"),
    tenantId: formData.get("tenantId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    status: formData.get("status"),
    securityDeposit: formData.get("securityDeposit") || undefined,
    depositReturned: formData.get("depositReturned") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function addTenancy(formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);

  await db.insert(tenancies).values({
    propertyId: parsed.propertyId,
    tenantId: parsed.tenantId,
    startDate: parsed.startDate,
    endDate: parsed.endDate || null,
    status: parsed.status,
    securityDeposit:
      parsed.securityDeposit != null ? String(parsed.securityDeposit) : null,
    depositReturned:
      parsed.depositReturned != null ? String(parsed.depositReturned) : null,
    notes: parsed.notes || null,
    createdById: Number(user.id),
  });

  revalidatePath("/properties");
  revalidatePath("/tenants");
  revalidatePath("/");
}

export async function updateTenancy(id: number, formData: FormData) {
  await requireUser();
  const parsed = parseForm(formData);

  await db
    .update(tenancies)
    .set({
      propertyId: parsed.propertyId,
      tenantId: parsed.tenantId,
      startDate: parsed.startDate,
      endDate: parsed.endDate || null,
      status: parsed.status,
      securityDeposit:
        parsed.securityDeposit != null ? String(parsed.securityDeposit) : null,
      depositReturned:
        parsed.depositReturned != null ? String(parsed.depositReturned) : null,
      notes: parsed.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(tenancies.id, id));

  revalidatePath("/properties");
  revalidatePath("/tenants");
  revalidatePath("/");
}

export async function deleteTenancy(id: number) {
  await requireAdmin();
  await db.delete(tenancies).where(eq(tenancies.id, id));
  revalidatePath("/properties");
  revalidatePath("/tenants");
  revalidatePath("/");
}
