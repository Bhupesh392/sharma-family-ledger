"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { documents, tenancies } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { documentSchema } from "@/lib/validations";
import { encrypt, decrypt } from "@/lib/crypto";
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

async function getTenantPropertyId(tenantId: number) {
  const [activeTenancy] = await db
    .select()
    .from(tenancies)
    .where(eq(tenancies.tenantId, tenantId), eq(tenancies.status, "ACTIVE"))
    .limit(1);

  return activeTenancy?.propertyId ?? null;
}

function parseForm(formData: FormData) {
  return documentSchema.parse({
    name: formData.get("name"),
    docType: formData.get("docType"),
    url: formData.get("url"),
    propertyId: formData.get("propertyId") || undefined,
    tenantId: formData.get("tenantId") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function addDocument(formData: FormData) {
  const user = await requireUser();
  const parsed = parseForm(formData);

  if (user.role === "TENANT" && parsed.docType !== "RECEIPT") {
    throw new Error("Tenants may only upload receipt documents.");
  }

  const encryptedUrl = encrypt(parsed.url);

  const values = {
    name: parsed.name,
    docType: parsed.docType,
    encryptedUrl,
    propertyId: parsed.propertyId ?? null,
    tenantId: parsed.tenantId ?? null,
    notes: parsed.notes || null,
    uploadedById: Number(user.id),
  };

  if (user.role === "TENANT") {
    const tenantId = Number(user.tenantId);
    values.tenantId = tenantId;
    values.propertyId = await getTenantPropertyId(tenantId);
    values.docType = "RECEIPT";
  }

  const [row] = await db.insert(documents).values(values).returning();

  await logActivity({
    userId: Number(user.id),
    userName: user.name ?? user.id,
    action: "CREATE",
    entityType: "DOCUMENT",
    entityId: row.id,
    entityLabel: `${parsed.name} (${parsed.docType})`,
    newValues: { name: parsed.name, docType: parsed.docType },
  });

  revalidatePath("/documents");
}

export async function updateDocument(id: number, formData: FormData) {
  const user = await requireAdmin();
  const parsed = parseForm(formData);
  const [old] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);

  const encryptedUrl = encrypt(parsed.url);

  await db.update(documents).set({
    name: parsed.name,
    docType: parsed.docType,
    encryptedUrl,
    propertyId: parsed.propertyId ?? null,
    tenantId: parsed.tenantId ?? null,
    notes: parsed.notes || null,
    updatedAt: new Date(),
  }).where(eq(documents.id, id));

  await logActivity({
    userId: Number(user.id),
    userName: user.name ?? user.id,
    action: "UPDATE",
    entityType: "DOCUMENT",
    entityId: id,
    entityLabel: parsed.name,
    oldValues: old ? { name: old.name, docType: old.docType } : null,
    newValues: { name: parsed.name, docType: parsed.docType },
  });

  revalidatePath("/documents");
}

export async function deleteDocument(id: number) {
  const user = await requireAdmin();
  const [old] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  await db.delete(documents).where(eq(documents.id, id));

  await logActivity({
    userId: Number(user.id),
    userName: user.name ?? user.id,
    action: "DELETE",
    entityType: "DOCUMENT",
    entityId: id,
    entityLabel: old ? old.name : `Document #${id}`,
    oldValues: old ? { name: old.name, docType: old.docType } : null,
  });

  revalidatePath("/documents");
}

export async function getDocumentUrl(id: number): Promise<string> {
  const session = await auth();
  if (!session?.user) throw new Error("Not signed in");

  const [doc] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  if (!doc) throw new Error("Document not found");

  if (session.user.role === "TENANT" && session.user.tenantId) {
    if (doc.tenantId !== Number(session.user.tenantId)) {
      throw new Error("Access denied");
    }
  }

  return decrypt(doc.encryptedUrl);
}
