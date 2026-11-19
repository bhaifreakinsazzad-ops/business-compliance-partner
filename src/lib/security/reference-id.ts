import { randomBytes } from "node:crypto";

// 32-character unambiguous uppercase alphabet (no modulo bias with byte & 31).
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Generates a cryptographically random public reference identifier on the server.
 * Format: PS-YYYY-XXXXXXXX (never PS-DEMO-*).
 */
export function generatePublicReference(year = new Date().getUTCFullYear()): string {
  const bytes = randomBytes(8);
  let suffix = "";
  for (let i = 0; i < 8; i += 1) {
    suffix += REFERENCE_ALPHABET[bytes[i]! & 31];
  }
  return `PS-${year}-${suffix}`;
}

export function isValidPublicReference(value: string): boolean {
  if (!value || value.startsWith("PS-DEMO-")) return false;
  return /^PS-\d{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(value);
}
