import { describe, expect, it } from "vitest";
import {
  generateSessionToken,
  hashPassword,
  hashToken,
  verifyPassword,
} from "@/lib/security/password";
import { CUSTOMER_SESSION_COOKIE_NAME } from "@/lib/customer/auth";

describe("Customer Authentication & Security", () => {
  it("hashes and verifies customer passwords with scrypt", async () => {
    const password = "SecureCustomerPassword2026!";
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword("WrongPassword123!", hash)).toBe(false);
  });

  it("enforces customer session token length and cookie name isolation", () => {
    const rawToken = generateSessionToken();
    expect(rawToken.length).toBeGreaterThanOrEqual(40);

    const hashed = hashToken(rawToken);
    expect(hashed).toHaveLength(64); // SHA-256 hex length
    expect(CUSTOMER_SESSION_COOKIE_NAME).toBe("bcp_customer_session");
  });
});
