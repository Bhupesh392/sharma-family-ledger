"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tenancies, properties, e392Rent, chitrakootRent } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { tenancySchema } from "@/lib/validations";
import { z } from "zod";
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
  return tenancySchema.parse({
    propertyId: formData.get("propertyId"),
    tenantId: formData.get("tenantId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    status: formData.get("status"),
    securityDeposit: formData.get("securityDeposit") || undefined,
    depositReturned: formData.get("depositReturned") || undefined,
    agreementStartDate: formData.get("agreementStartDate") || undefined,
    agreementDurationMonths: formData.get("agreementDurationMonths") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

/**
 * Given an agreement start date + duration, computes the renewal due
 * date and a status:
 *  - NOT_SET: no agreement start date recorded
 *  - EXPIRED: renewal date is in the past
 *  - DUE_FOR_RENEWAL: renewal date is within the next 30 days
 *  - ACTIVE: renewal date is more than 30 days away
 * RENEWED is a manual status the person can set themselves (when they've
 * just renewed and the new agreement fields haven't been re-entered yet);
 * it is never assigned automatically.
 */
function computeAgreementRenewal(
  agreementStartDate: string | null | undefined,
  agreementDurationMonths: number | null | undefined
): { renewalDate: string | null; status: "ACTIVE" | "DUE_FOR_RENEWAL" | "EXPIRED" | "NOT_SET" } {
  if (!agreementStartDate || !agreementDurationMonths) {
    return { renewalDate: null, status: "NOT_SET" };
  }

  const start = new Date(agreementStartDate + "T00:00:00");
  const renewal = new Date(start);
  renewal.setMonth(renewal.getMonth() + agreementDurationMonths);

  const renewalDateStr = renewal.toISOString().slice(0, 10);

  const now = new Date();
  const daysUntilRenewal = Math.floor((renewal.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let status: "ACTIVE" | "DUE_FOR_RENEWAL" | "EXPIRED";
  if (daysUntilRenewal < 0) {
    status = "EXPIRED";
  } else if (daysUntilRenewal <= 30) {
    status = "DUE_FOR_RENEWAL";
  } else {
    status = "ACTIVE";
  }

  return { renewalDate: renewalDateStr, status };
}

export async function addTenancy(formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);
  const { renewalDate, status: agreementStatus } = computeAgreementRenewal(
    parsed.agreementStartDate,
    parsed.agreementDurationMonths
  );

  const [row] = await db.insert(tenancies).values({
    propertyId: parsed.propertyId,
    tenantId: parsed.tenantId,
    startDate: parsed.startDate,
    endDate: parsed.endDate || null,
    status: parsed.status,
    securityDeposit:
      parsed.securityDeposit != null ? String(parsed.securityDeposit) : null,
    depositReturned:
      parsed.depositReturned != null ? String(parsed.depositReturned) : null,
    agreementStartDate: parsed.agreementStartDate || null,
    agreementDurationMonths: parsed.agreementDurationMonths ?? null,
    agreementRenewalDate: renewalDate,
    agreementStatus,
    notes: parsed.notes || null,
    createdById: Number(user.id),
  }).returning();

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "CREATE", entityType: "TENANCY", entityId: row.id,
    entityLabel: `Tenancy · Property #${parsed.propertyId} · from ${parsed.startDate}`,
    newValues: { propertyId: parsed.propertyId, tenantId: parsed.tenantId, startDate: parsed.startDate, status: parsed.status },
  });

  revalidatePath("/properties");
  revalidatePath("/tenants");
  revalidatePath("/");
}

export async function updateTenancy(id: number, formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);
  const { renewalDate, status: agreementStatus } = computeAgreementRenewal(
    parsed.agreementStartDate,
    parsed.agreementDurationMonths
  );

  const [old] = await db.select().from(tenancies).where(eq(tenancies.id, id)).limit(1);

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
      agreementStartDate: parsed.agreementStartDate || null,
      agreementDurationMonths: parsed.agreementDurationMonths ?? null,
      agreementRenewalDate: renewalDate,
      agreementStatus,
      notes: parsed.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(tenancies.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "UPDATE", entityType: "TENANCY", entityId: id,
    entityLabel: `Tenancy · Property #${parsed.propertyId}`,
    oldValues: old ? { status: old.status, agreementStartDate: old.agreementStartDate, agreementDurationMonths: old.agreementDurationMonths, securityDeposit: old.securityDeposit } : null,
    newValues: { status: parsed.status, agreementStartDate: parsed.agreementStartDate, agreementDurationMonths: parsed.agreementDurationMonths, securityDeposit: parsed.securityDeposit },
  });

  revalidatePath("/properties");
  revalidatePath("/tenants");
  revalidatePath("/");
}

const renewalSchema = z.object({
  revisedRent: z.coerce.number().positive("Enter the revised rent amount"),
});

/**
 * Marks a tenancy's agreement as freshly renewed, capturing a revised
 * rent amount:
 *  1. Resets the agreement start date to today, keeps the same duration,
 *     recomputes the renewal date, sets agreement status to ACTIVE.
 *  2. Updates the property's standing monthlyRent to the revised amount.
 *  3. If the property is linked to a rent ledger (E-392 floor or
 *     Chitrakoot Shop), logs a new rent-collected entry for the current
 *     month at the revised amount, so it shows up in Income immediately.
 *     Properties with rentLedger = OTHER only get their monthlyRent
 *     updated; nothing is auto-logged.
 */
export async function renewAgreementWithRent(id: number, formData: FormData) {
  const user = await requireUser();
  const { revisedRent } = renewalSchema.parse({
    revisedRent: formData.get("revisedRent"),
  });

  const [tenancy] = await db.select().from(tenancies).where(eq(tenancies.id, id)).limit(1);
  if (!tenancy) throw new Error("Tenancy not found");
  if (!tenancy.agreementDurationMonths) {
    throw new Error("Set an agreement duration before renewing");
  }

  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, tenancy.propertyId))
    .limit(1);
  if (!property) throw new Error("Property not found");

  const today = new Date().toISOString().slice(0, 10);
  const { renewalDate } = computeAgreementRenewal(today, tenancy.agreementDurationMonths);
  const currentMonth = today.slice(0, 7) + "-01";

  await db
    .update(tenancies)
    .set({
      agreementStartDate: today,
      agreementRenewalDate: renewalDate,
      agreementStatus: "ACTIVE",
      updatedAt: new Date(),
    })
    .where(eq(tenancies.id, id));

  await db
    .update(properties)
    .set({ monthlyRent: String(revisedRent), updatedAt: new Date() })
    .where(eq(properties.id, property.id));

  switch (property.rentLedger) {
    case "E392_GROUND":
    case "E392_FIRST":
    case "E392_SECOND": {
      const floor = property.rentLedger.replace("E392_", "") as "GROUND" | "FIRST" | "SECOND";
      await db.insert(e392Rent).values({
        month: currentMonth,
        floor,
        rent: String(revisedRent),
        paidTo: "Nitin Sharma",
        mode: "Online",
        notes: "Revised rent following agreement renewal",
        propertyId: property.id,
        createdById: Number(user.id),
      });
      revalidatePath("/income");
      break;
    }
    case "CHITRAKOOT_SHOP": {
      await db.insert(chitrakootRent).values({
        month: currentMonth,
        amount: String(revisedRent),
        paidTo: "Chetan Sharma",
        mode: "UPI",
        notes: "Revised rent following agreement renewal",
        propertyId: property.id,
        createdById: Number(user.id),
      });
      revalidatePath("/income");
      break;
    }
    case "OTHER":
    default:
      break;
  }

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "UPDATE", entityType: "TENANCY", entityId: id,
    entityLabel: `Agreement renewed · ${property.name}`,
    oldValues: { agreementStatus: tenancy.agreementStatus, monthlyRent: property.monthlyRent },
    newValues: { agreementStatus: "ACTIVE", monthlyRent: revisedRent, agreementStartDate: today, agreementRenewalDate: renewalDate },
  });

  revalidatePath("/properties");
  revalidatePath("/tenants");
  revalidatePath("/");
}

export async function deleteTenancy(id: number) {
  const user = await requireAdmin();
  const [old] = await db.select().from(tenancies).where(eq(tenancies.id, id)).limit(1);
  await db.delete(tenancies).where(eq(tenancies.id, id));

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "DELETE", entityType: "TENANCY", entityId: id,
    entityLabel: old ? `Tenancy from ${old.startDate}` : `Tenancy #${id}`,
    oldValues: old ? { status: old.status, startDate: old.startDate } : null,
  });

  revalidatePath("/properties");
  revalidatePath("/tenants");
  revalidatePath("/");
}
