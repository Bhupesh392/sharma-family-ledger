import { z } from "zod";

export const floorValues = ["GROUND", "FIRST", "SECOND"] as const;

export const rentSchema = z.object({
  month: z
    .string()
    .min(1, "Month is required")
    .transform((v) => (v.length === 7 ? `${v}-01` : v)),
  floor: z.enum(floorValues),
  rent: z.coerce.number().positive("Rent must be greater than 0"),
  paidTo: z.string().min(1, "Required"),
  mode: z.string().min(1, "Required"),
  notes: z.string().optional(),
});

export const utilitySchema = z.object({
  date: z.string().min(1, "Date is required"),
  utility: z.string().min(1, "Required"),
  floor: z.enum(floorValues),
  paidTo: z.string().min(1, "Required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  mode: z.string().optional(),
  notes: z.string().optional(),
});

export const chitrakootSchema = z.object({
  month: z
    .string()
    .min(1, "Month is required")
    .transform((v) => (v.length === 7 ? `${v}-01` : v)),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paidTo: z.string().min(1, "Required"),
  mode: z.string().min(1, "Required"),
  submittedAmount: z.coerce.number().optional().nullable(),
  submittedDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const constructionSchema = z.object({
  whatFor: z.string().min(1, "Required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  whoPaid: z.string().min(1, "Required"),
  toWhom: z.string().optional(),
  transactionId: z.string().optional(),
  mode: z.string().optional(),
  date: z.string().optional(),
});

export const returnItemSchema = z.object({
  category: z.string().min(1, "Required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  submittedToNitin: z.string().min(1, "Required"),
  status: z.enum(["PENDING", "COMPLETED"]),
  whoReturned: z.string().optional(),
  mode: z.string().optional(),
  transactionId: z.string().optional(),
  date: z.string().optional(),
});

export const miscSchema = z.object({
  date: z.string().min(1, "Date is required"),
  toWhom: z.string().min(1, "Required"),
  byWho: z.string().min(1, "Required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  remarks: z.string().optional(),
});

export const propertyTypeValues = ["RESIDENTIAL", "SHOP"] as const;

export const propertySchema = z.object({
  name: z.string().min(1, "Required"),
  type: z.enum(propertyTypeValues),
  address: z.string().optional(),
  monthlyRent: z.coerce.number().optional().nullable(),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
});

export const idProofTypeValues = [
  "AADHAAR",
  "PAN",
  "PASSPORT",
  "VOTER_ID",
  "DRIVING_LICENSE",
  "OTHER",
] as const;

export const tenantSchema = z.object({
  name: z.string().min(1, "Required"),
  phone: z.string().optional(),
  email: z.string().optional(),
  idProofType: z.enum(idProofTypeValues).optional().nullable(),
  idProofNumber: z.string().optional(),
  occupation: z.string().optional(),
  numberOfOccupants: z.coerce.number().int().positive().optional().nullable(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  notes: z.string().optional(),
});

export const tenancyStatusValues = ["ACTIVE", "ENDED"] as const;

export const agreementStatusValues = [
  "ACTIVE",
  "DUE_FOR_RENEWAL",
  "EXPIRED",
  "RENEWED",
  "NOT_SET",
] as const;

export const tenancySchema = z.object({
  propertyId: z.coerce.number().positive("Select a property"),
  tenantId: z.coerce.number().positive("Select a tenant"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  status: z.enum(tenancyStatusValues),
  securityDeposit: z.coerce.number().optional().nullable(),
  depositReturned: z.coerce.number().optional().nullable(),
  agreementStartDate: z.string().optional().nullable(),
  agreementDurationMonths: z.coerce.number().int().positive().optional().nullable(),
  // agreementRenewalDate is derived server-side from start + duration,
  // not accepted directly from the form.
  notes: z.string().optional(),
});
