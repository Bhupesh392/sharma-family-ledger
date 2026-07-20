/**
 * Payment Automation Server Actions
 * Handles rent payment submissions, parsing, and approval workflow
 */

"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  paymentSubmissions,
  upiMappings,
  e392Rent,
  chitrakootRent,
  tenants,
  properties,
  tenancies,
  parsingLogs,
  activityLog,
} from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { parsePaymentMessage, validateParsedPayment, calculateConfidence } from "@/lib/parsers/payment-parser";
import { parsePaymentImage } from "@/lib/parsers/ocr-parser";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schema for payment submission
const PaymentSubmissionSchema = z.object({
  tenantId: z.number(),
  propertyId: z.number(),
  amount: z.number().positive(),
  date: z.string(),
  transactionId: z.string().optional(),
  bank: z.string().optional(),
  upiId: z.string().optional(),
  rawMessage: z.string().optional(),
  imageUrl: z.string().optional(),
  parsedData: z.string().optional(),
  confidenceScore: z.number().min(0).max(100).optional(),
});

/**
 * Submit a rent payment (from tenant portal)
 */
export async function submitPayment(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Parse form data (formData.get() returns null when not set, convert to undefined for Zod)
    const data = {
      tenantId: parseInt(formData.get("tenantId") as string),
      propertyId: parseInt(formData.get("propertyId") as string),
      amount: parseFloat(formData.get("amount") as string),
      date: formData.get("date") as string,
      transactionId: (formData.get("transactionId") as string | null) || undefined,
      bank: (formData.get("bank") as string | null) || undefined,
      upiId: (formData.get("upiId") as string | null) || undefined,
      rawMessage: (formData.get("rawMessage") as string | null) || undefined,
      imageUrl: (formData.get("imageUrl") as string | null) || undefined,
      parsedData: (formData.get("parsedData") as string | null) || undefined,
      confidenceScore: formData.get("confidenceScore") ? parseInt(formData.get("confidenceScore") as string) : undefined,
    };

    // Validate input
    const validated = PaymentSubmissionSchema.safeParse(data);
    if (!validated.success) {
      console.error("Payment validation errors:", validated.error.flatten());
      return { success: false, error: "Invalid payment data" };
    }

    const { tenantId, propertyId, amount, date, ...rest } = validated.data;

    // Verify tenant exists
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!tenant) {
      return { success: false, error: "Tenant not found" };
    }

    // Verify property exists
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, propertyId),
    });

    if (!property) {
      return { success: false, error: "Property not found" };
    }

    // Check for duplicate transaction
    if (rest.transactionId) {
      const existing = await db.query.paymentSubmissions.findFirst({
        where: eq(paymentSubmissions.transactionId, rest.transactionId),
      });

      if (existing) {
        return { success: false, error: "This transaction has already been submitted" };
      }
    }

    // Calculate confidence if not provided
    let confidenceScore = rest.confidenceScore;
    if (!confidenceScore && rest.rawMessage) {
      const parsed = parsePaymentMessage(rest.rawMessage);
      if (parsed) {
        confidenceScore = calculateConfidence(parsed);
      }
    }

    // Create payment submission
    const [submission] = await db.insert(paymentSubmissions).values({
      tenantId,
      propertyId,
      amount: amount.toString(),
      date: date.split('T')[0], // Extract date part
      ...rest,
      confidenceScore: confidenceScore || 50,
      status: "PENDING",
    }).returning();

    // Log activity
    await db.insert(activityLog).values({
      userId: Number(session.user.id),
      userName: session.user.name || "Unknown",
      action: "CREATE",
      entityType: "RENT",
      entityId: submission.id,
      entityLabel: `Payment submission: ₹${amount} for ${property.name}`,
      newValues: JSON.stringify(submission),
    });

    revalidatePath("/tenant");
    revalidatePath("/admin/payment-review");

    return {
      success: true,
      message: "Payment submitted successfully! It will be reviewed within 24 hours.",
      submissionId: submission.id,
    };
  } catch (error) {
    console.error("Error submitting payment:", error);
    return { success: false, error: "Failed to submit payment" };
  }
}

/**
 * Parse payment from uploaded image
 */
export async function parsePaymentFromImage(formData: FormData) {
  try {
    const imageFile = formData.get("image") as File;
    
    if (!imageFile || imageFile.size === 0) {
      return { success: false, error: "No image provided" };
    }

    // Parse image using OCR
    const { parsed, ocrConfidence } = await parsePaymentImage(imageFile);

    if (!parsed) {
      return {
        success: false,
        error: "Could not parse payment details from image. Please try again or use text input.",
        ocrConfidence,
      };
    }

    // Validate parsed data
    const validation = validateParsedPayment(parsed);
    
    // Log parsing attempt
    await db.insert(parsingLogs).values({
      rawInput: `[IMAGE] ${imageFile.name}`,
      parsedResult: JSON.stringify(parsed),
      success: true,
      parserVersion: "1.0.0",
    });

    return {
      success: true,
      parsed,
      validation,
      ocrConfidence,
    };
  } catch (error) {
    console.error("Error parsing image:", error);
    return {
      success: false,
      error: "Failed to parse image. Please try again or use text input.",
    };
  }
}

/**
 * Parse payment from text message
 */
export async function parsePaymentFromText(text: string) {
  try {
    const parsed = parsePaymentMessage(text);

    if (!parsed) {
      // Log failed parsing
      await db.insert(parsingLogs).values({
        rawInput: text,
        parsedResult: null,
        success: false,
        errorMessage: "No pattern matched",
        parserVersion: "1.0.0",
      });

      return {
        success: false,
        error: "Could not parse payment details. Please check the message format.",
      };
    }

    // Validate parsed data
    const validation = validateParsedPayment(parsed);

    // Calculate confidence
    const confidence = calculateConfidence(parsed);
    parsed.confidence = confidence;

    // Log successful parsing
    await db.insert(parsingLogs).values({
      rawInput: text,
      parsedResult: JSON.stringify(parsed),
      success: true,
      parserVersion: "1.0.0",
    });

    return {
      success: true,
      parsed,
      validation,
    };
  } catch (error) {
    console.error("Error parsing text:", error);
    return {
      success: false,
      error: "Failed to parse message. Please try again.",
    };
  }
}

/**
 * Match payment to property/tenant using UPI ID, phone, or amount+date
 */
export async function matchPaymentToProperty(parsed: {
  amount: number;
  date: Date;
  payer: string;
  upiId?: string;
  transactionId?: string;
}) {
  try {
    // Try 1: Match by UPI ID
    if (parsed.upiId) {
      const upiMatch = await db.query.upiMappings.findFirst({
        where: eq(upiMappings.upiId, parsed.upiId),
        with: {
          property: true,
          tenant: true,
        },
      });

      if (upiMatch) {
        return {
          success: true,
          match: {
            property: upiMatch.property,
            tenant: upiMatch.tenant,
            confidence: 100,
            method: "UPI ID",
          },
        };
      }
    }

    // Try 2: Match by phone number
    const phoneMatch = await db.query.tenants.findFirst({
      where: sql`${tenants.phone} LIKE '%' || ${parsed.payer} || '%'`,
    });

    if (phoneMatch) {
      const activeTenancy = await db.query.tenancies.findFirst({
        where: and(
          eq(tenancies.tenantId, phoneMatch.id),
          eq(tenancies.status, "ACTIVE")
        ),
      });

      if (activeTenancy) {
        const property = await db.query.properties.findFirst({
          where: eq(properties.id, activeTenancy.propertyId),
        });

        if (property) {
          return {
            success: true,
            match: {
              property,
              tenant: phoneMatch,
              confidence: 90,
              method: "Phone number",
            },
          };
        }
      }
    }

    // Try 3: Match by name (fuzzy)
    const nameMatch = await db.query.tenants.findFirst({
      where: sql`LOWER(${tenants.name}) LIKE '%' || LOWER(${parsed.payer}) || '%'`,
    });

    if (nameMatch) {
      const activeTenancy = await db.query.tenancies.findFirst({
        where: and(
          eq(tenancies.tenantId, nameMatch.id),
          eq(tenancies.status, "ACTIVE")
        ),
      });

      if (activeTenancy) {
        const property = await db.query.properties.findFirst({
          where: eq(properties.id, activeTenancy.propertyId),
        });

        if (property) {
          return {
            success: true,
            match: {
              property,
              tenant: nameMatch,
              confidence: 70,
              method: "Name matching",
            },
          };
        }
      }
    }

    // Try 4: Match by amount + date
    const amountDateMatch = await db.query.paymentSubmissions.findFirst({
      where: and(
        eq(paymentSubmissions.amount, parsed.amount.toString()),
        eq(paymentSubmissions.date, parsed.date.toISOString().split('T')[0]),
        eq(paymentSubmissions.status, "APPROVED")
      ),
      with: {
        property: true,
        tenant: true,
      },
    });

    if (amountDateMatch) {
      return {
        success: true,
        match: {
          property: amountDateMatch.property,
          tenant: amountDateMatch.tenant,
          confidence: 60,
          method: "Amount + date",
        },
      };
    }

    return {
      success: false,
      error: "Could not match payment to a property. Manual review required.",
    };
  } catch (error) {
    console.error("Error matching payment:", error);
    return {
      success: false,
      error: "Failed to match payment",
    };
  }
}

/**
 * Get pending payment submissions for admin review
 */
export async function getPendingPayments() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const pending = await db.query.paymentSubmissions.findMany({
      where: eq(paymentSubmissions.status, "PENDING"),
      orderBy: desc(paymentSubmissions.createdAt),
      with: {
        tenant: true,
        property: true,
        reviewedBy: {
          columns: {
            id: true,
            name: true,
          },
        },
      },
    });

    return {
      success: true,
      payments: pending,
    };
  } catch (error) {
    console.error("Error fetching pending payments:", error);
    return { success: false, error: "Failed to fetch pending payments" };
  }
}

/**
 * Approve payment submission and create rent entry
 */
export async function approvePaymentSubmission(submissionId: number) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Get submission
    const [submission] = await db.query.paymentSubmissions.findMany({
      where: eq(paymentSubmissions.id, submissionId),
    });

    if (!submission) {
      return { success: false, error: "Payment submission not found" };
    }

    // Get property and tenant separately
    const property = await db.query.properties.findFirst({
      where: eq(properties.id, submission.propertyId),
    });

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, submission.tenantId),
    });

    if (!property || !tenant) {
      return { success: false, error: "Property or tenant not found" };
    }

    if (!submission) {
      return { success: false, error: "Payment submission not found" };
    }

    if (submission.status !== "PENDING") {
      return { success: false, error: "Payment has already been processed" };
    }

    // Determine which rent table to use
    const rentLedger = property.rentLedger;
    let rentEntryId: number | undefined;

    if (rentLedger === "E392_GROUND" || rentLedger === "E392_FIRST" || rentLedger === "E392_SECOND") {
      // Create E-392 rent entry
      const [rentEntry] = await db.insert(e392Rent).values({
        month: submission.date,
        floor: rentLedger.replace("E392_", "").toUpperCase() as "GROUND" | "FIRST" | "SECOND",
        rent: submission.amount,
        paidTo: property.name,
        mode: submission.bank?.includes("UPI") || submission.upiId ? "UPI" : "Online",
        notes: `Auto-created from payment submission #${submission.id}. ${submission.rawMessage || ""}`,
        propertyId: submission.propertyId,
        createdById: Number(session.user.id),
      }).returning();

      rentEntryId = rentEntry.id;
    } else if (rentLedger === "CHITRAKOOT_SHOP") {
      // Create Chitrakoot rent entry
      const [rentEntry] = await db.insert(chitrakootRent).values({
        month: submission.date,
        amount: submission.amount,
        paidTo: property.name,
        mode: submission.bank?.includes("UPI") || submission.upiId ? "UPI" : "Online",
        notes: `Auto-created from payment submission #${submission.id}. ${submission.rawMessage || ""}`,
        propertyId: submission.propertyId,
        createdById: Number(session.user.id),
      }).returning();

      rentEntryId = rentEntry.id;
    }

    // Update submission status
    await db.update(paymentSubmissions)
      .set({
        status: "APPROVED",
        reviewedById: Number(session.user.id),
        reviewedAt: new Date(),
        rentEntryId: rentEntryId || undefined,
        updatedAt: new Date(),
      })
      .where(eq(paymentSubmissions.id, submissionId));

    // Log activity
    await db.insert(activityLog).values({
      userId: Number(session.user.id),
      userName: session.user.name || "Unknown",
      action: "CREATE",
      entityType: "RENT",
      entityId: rentEntryId || submissionId,
      entityLabel: `Approved payment: ₹${submission.amount} for ${property.name}`,
      oldValues: JSON.stringify(submission),
      newValues: JSON.stringify({ status: "APPROVED", rentEntryId }),
    });

    revalidatePath("/admin/payment-review");
    revalidatePath("/income");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Payment approved and rent entry created",
      rentEntryId,
    };
  } catch (error) {
    console.error("Error approving payment:", error);
    return { success: false, error: "Failed to approve payment" };
  }
}

/**
 * Reject payment submission
 */
export async function rejectPaymentSubmission(submissionId: number, reason: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Update submission status
    await db.update(paymentSubmissions)
      .set({
        status: "REJECTED",
        reviewedById: Number(session.user.id),
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(paymentSubmissions.id, submissionId));

    // Log activity
    await db.insert(activityLog).values({
      userId: Number(session.user.id),
      userName: session.user.name || "Unknown",
      action: "UPDATE",
      entityType: "RENT",
      entityId: submissionId,
      entityLabel: `Rejected payment submission #${submissionId}`,
      newValues: JSON.stringify({ status: "REJECTED", reason }),
    });

    revalidatePath("/admin/payment-review");

    return {
      success: true,
      message: "Payment rejected",
    };
  } catch (error) {
    console.error("Error rejecting payment:", error);
    return { success: false, error: "Failed to reject payment" };
  }
}

/**
 * Add UPI mapping (admin only)
 */
export async function addUpiMapping(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const upiId = formData.get("upiId") as string;
    const propertyId = parseInt(formData.get("propertyId") as string);
    const tenantId = parseInt(formData.get("tenantId") as string);

    if (!upiId || !propertyId || !tenantId) {
      return { success: false, error: "Missing required fields" };
    }

    const [mapping] = await db.insert(upiMappings).values({
      upiId,
      propertyId,
      tenantId,
      isVerified: true,
    }).returning();

    revalidatePath("/settings");

    return {
      success: true,
      message: "UPI mapping added successfully",
      mapping,
    };
  } catch (error) {
    console.error("Error adding UPI mapping:", error);
    return { success: false, error: "Failed to add UPI mapping" };
  }
}

/**
 * Get all UPI mappings (admin only)
 */
export async function getUpiMappings() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const mappings = await db.query.upiMappings.findMany({
      with: {
        property: true,
        tenant: true,
      },
      orderBy: desc(upiMappings.createdAt),
    });

    return {
      success: true,
      mappings,
    };
  } catch (error) {
    console.error("Error fetching UPI mappings:", error);
    return { success: false, error: "Failed to fetch UPI mappings" };
  }
}