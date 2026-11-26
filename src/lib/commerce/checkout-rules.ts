import { createHash } from "node:crypto";

export const MAX_COPIES_PER_BOOK = 20;
export const MAX_TOTAL_COPIES_PER_ORDER = 50;

export interface RequestedBookLine {
  bookId: string;
  quantity: number;
}

export class CommerceValidationError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Deterministically merges duplicate bookId rows and enforces per-book
 * and total order quantity limits AFTER merging so duplicate line items
 * cannot bypass checkout caps.
 */
export function normalizeAndValidateBookItems(
  items: RequestedBookLine[],
): RequestedBookLine[] {
  const quantityByBook = new Map<string, number>();

  for (const item of items) {
    const id = item.bookId.trim();
    if (!id) {
      throw new CommerceValidationError(
        400,
        "VALIDATION_ERROR",
        "বইয়ের আইডি প্রয়োজন।",
      );
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      throw new CommerceValidationError(
        400,
        "VALIDATION_ERROR",
        "বইয়ের সংখ্যা ন্যূনতম ১ হতে হবে।",
      );
    }
    quantityByBook.set(id, (quantityByBook.get(id) ?? 0) + item.quantity);
  }

  const merged = Array.from(quantityByBook.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bookId, quantity]) => ({ bookId, quantity }));

  let totalCopies = 0;
  for (const row of merged) {
    if (row.quantity > MAX_COPIES_PER_BOOK) {
      throw new CommerceValidationError(
        400,
        "BOOK_QUANTITY_CAP_EXCEEDED",
        `একটি বই সর্বোচ্চ ${MAX_COPIES_PER_BOOK} কপি পর্যন্ত একসাথে অর্ডার করা যাবে।`,
      );
    }
    totalCopies += row.quantity;
  }

  if (totalCopies > MAX_TOTAL_COPIES_PER_ORDER) {
    throw new CommerceValidationError(
      400,
      "ORDER_QUANTITY_CAP_EXCEEDED",
      `একটি অর্ডারে সর্বমোট সর্বোচ্চ ${MAX_TOTAL_COPIES_PER_ORDER} কপি বই অর্ডার করা যাবে।`,
    );
  }

  return merged;
}

export function isSandboxGatewayEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const nodeEnv = env.NODE_ENV?.toLowerCase();
  const appEnv = env.NEXT_PUBLIC_APP_ENV?.toLowerCase();
  if (nodeEnv === "production" || appEnv === "production") {
    return false;
  }
  return env.SANDBOX_PAYMENTS_ENABLED?.trim().toLowerCase() === "true";
}

export const ORDER_STATUS_TRANSITIONS: Record<string, ReadonlySet<string>> = {
  CONFIRMED: new Set(["IN_FULFILLMENT", "SHIPPED", "CANCELLED"]),
  IN_FULFILLMENT: new Set(["SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  SHIPPED: new Set(["DELIVERED", "REFUNDED"]),
  DELIVERED: new Set(["REFUNDED"]),
  CANCELLED: new Set([]),
  REFUNDED: new Set([]),
};

export function canTransitionOrderStatus(
  fromStatus: string,
  toStatus: string,
): boolean {
  if (fromStatus === toStatus) return true;
  return ORDER_STATUS_TRANSITIONS[fromStatus]?.has(toStatus) ?? false;
}

function stableSortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableSortValue);
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(record).sort()) {
      const child = record[key];
      if (child !== undefined) {
        sorted[key] = stableSortValue(child);
      }
    }
    return sorted;
  }
  return value;
}

/**
 * Computes a deterministic SHA-256 fingerprint of an idempotent commerce payload
 * so reusing an idempotencyKey with a modified payload is rejected (409).
 */
export function hashIdempotencyPayload(payload: unknown): string {
  const canonical = JSON.stringify(stableSortValue(payload));
  return createHash("sha256").update(canonical).digest("hex");
}
