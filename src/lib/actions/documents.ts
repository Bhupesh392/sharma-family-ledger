"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema";
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

  const encryptedUrl = encrypt(parsed.url);

  const [row] = await db.insert(documents).values({
    name: parsed.name,
    docType: parsed.docType,
    encryptedUrl,
    propertyId: parsed.propertyId ?? null,
    tenantId: parsed.tenantId ?? null,
    notes: parsed.notes || null,
    uploadedById: Number(user.id),
  }).returning();

  await logActivity({
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "CREATE", entityType: "DOCUMENT", entityId: row.id,
    entityLabel: `${parsed.name} (${parsed.docType})`,
    newValues: { name: parsed.name, docType: parsed.docType },
  });

  revalidatePath("/documents");
}

export async function updateDocument(id: number, formData: FormData) {
  const user = await requireUser();
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
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "UPDATE", entityType: "DOCUMENT", entityId: id,
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
    userId: Number(user.id), userName: user.name ?? user.id,
    action: "DELETE", entityType: "DOCUMENT", entityId: id,
    entityLabel: old ? old.name : `Document #${id}`,
    oldValues: old ? { name: old.name, docType: old.docType } : null,
  });

  revalidatePath("/documents");
}

/**
 * Decrypts and returns the document URL — called from an API route so
 * the raw URL never appears in client-side JS bundles or RSC payloads.
 * Any authenticated user can open any document (per the product decision).
 */
export async function getDocumentUrl(id: number): Promise<string> {
  await requireUser();
  const [doc] = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
  if (!doc) throw new Error("Document not found");
  return decrypt(doc.encryptedUrl);
}
