import { Prisma } from "@prisma/client";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import {
  sanitizeAnalyticsPayload,
  type AnalyticsEventName,
} from "@/lib/analytics/events";

export interface ServerAnalyticsRecordInput {
  eventName: Extract<
    AnalyticsEventName,
    "order_created" | "payment_verified" | "enrollment_created" | "enrollment_completed"
  >;
  customerId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  payload?: Record<string, unknown>;
}

/**
 * Records an authoritative `server_verified` conversion event inside PostgreSQL.
 * Safe no-op when analytics table is not yet migrated or DB is unavailable so
 * verified transactions are never rolled back by telemetry logging.
 */
export async function recordServerVerifiedEvent(
  input: ServerAnalyticsRecordInput,
): Promise<void> {
  if (!isDatabaseConfigured()) return;

  const cleanPayload = sanitizeAnalyticsPayload(input.payload ?? {});

  try {
    await prisma.analyticsServerEvent.create({
      data: {
        eventName: input.eventName,
        verificationLevel: "server_verified",
        customerId: input.customerId ?? null,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        payload: cleanPayload as Prisma.InputJsonValue,
      },
    });
  } catch {
    // Non-blocking audit telemetry
  }
}
