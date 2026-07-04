import { db } from "@/lib/db";
import { activityLog } from "@/lib/db/schema";

type ActionType = "CREATE" | "UPDATE" | "DELETE";
type EntityType =
  | "RENT" | "UTILITY" | "CHITRAKOOT_RENT" | "CONSTRUCTION"
  | "RETURN_ITEM" | "MISC" | "PROPERTY" | "TENANT" | "TENANCY" | "DOCUMENT";

export async function logActivity({
  userId,
  userName,
  action,
  entityType,
  entityId,
  entityLabel,
  oldValues,
  newValues,
}: {
  userId: number;
  userName: string;
  action: ActionType;
  entityType: EntityType;
  entityId?: number;
  entityLabel: string;
  oldValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
}) {
  try {
    await db.insert(activityLog).values({
      userId,
      userName,
      action,
      entityType,
      entityId: entityId ?? null,
      entityLabel,
      oldValues: oldValues ? JSON.stringify(oldValues) : null,
      newValues: newValues ? JSON.stringify(newValues) : null,
    });
  } catch (err) {
    // Never let audit logging break the main operation.
    console.error("[activity-log] Failed to write log entry:", err);
  }
}
