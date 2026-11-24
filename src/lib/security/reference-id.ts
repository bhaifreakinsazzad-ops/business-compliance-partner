import { randomBytes } from "node:crypto";

// 32-character unambiguous uppercase alphabet (no modulo bias with byte & 31).
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generates a cryptographically random public reference identifier on the server.
 * New format: BCP-YYYY-XXXXXXXX. Legacy PS references remain searchable/valid.
 */
export function generatePublicReference(year = new Date().getUTCFullYear()): string {
  const bytes = randomBytes(8);
  let suffix = "";
  for (let i = 0; i < 8; i += 1) {
    suffix += REFERENCE_ALPHABET[bytes[i]! & 31];
  }
  return `BCP-${year}-${suffix}`;
}

export function isValidPublicReference(value: string): boolean {
  if (!value || value.startsWith("PS-DEMO-") || value.startsWith("BCP-DEMO-")) {
    return false;
  }
  return /^(?:BCP|PS)-\d{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(value);
}
