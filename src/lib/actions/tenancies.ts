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
    agreementStartDate: parsed.agreementStartDate || null,
    agreementDurationMonths: parsed.agreementDurationMonths ?? null,
    agreementRenewalDate: renewalDate,
    agreementStatus,
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
  const { renewalDate, status: agreementStatus } = computeAgreementRenewal(
    parsed.agreementStartDate,
    parsed.agreementDurationMonths
  );

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

  revalidatePath("/properties");
  revalidatePath("/tenants");
  revalidatePath("/");
}

/**
 * Marks a tenancy's agreement as freshly renewed: resets the agreement
 * start date to today, keeps the same duration, recomputes the renewal
 * date, and sets status to ACTIVE. Used by the "Mark as renewed" action
 * so the person doesn't have to re-open the full edit form just to bump
 * the renewal date forward.
 */
export async function renewAgreement(id: number) {
  await requireUser();

  const [tenancy] = await db.select().from(tenancies).where(eq(tenancies.id, id)).limit(1);
  if (!tenancy) throw new Error("Tenancy not found");
  if (!tenancy.agreementDurationMonths) {
    throw new Error("Set an agreement duration before renewing");
  }

  const today = new Date().toISOString().slice(0, 10);
  const { renewalDate } = computeAgreementRenewal(today, tenancy.agreementDurationMonths);

  await db
    .update(tenancies)
    .set({
      agreementStartDate: today,
      agreementRenewalDate: renewalDate,
      agreementStatus: "ACTIVE",
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
