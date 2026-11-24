import { describe, expect, it } from "vitest";
import { sanitizeAnalyticsPayload } from "@/lib/analytics/events";
import { sanitizeCsvCell, toCsv } from "@/lib/security/csv";
import { hashPassword, verifyPassword } from "@/lib/security/password";
import { InMemoryRateLimiter } from "@/lib/security/rate-limit";
import { hasPermission } from "@/lib/security/rbac";
import { readJsonBody } from "@/lib/security/request-body";
import {
  generatePublicReference,
  isValidPublicReference,
} from "@/lib/security/reference-id";

describe("Security, RBAC, Reference ID, CSV & Analytics utilities", () => {
  it("generates BCP references while preserving validation for legacy PS references", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 50; i += 1) {
      const ref = generatePublicReference(2026);
      expect(ref).toMatch(/^BCP-2026-/);
      expect(isValidPublicReference(ref)).toBe(true);
      ids.add(ref);
    }
    expect(ids.size).toBe(50);
    expect(isValidPublicReference("PS-DEMO-12345678")).toBe(false);
    expect(isValidPublicReference("PS-2026-ABCDEFGH")).toBe(true);
  });

  it("hashes and verifies passwords with scrypt timing-safe comparison", async () => {
    const hash = await hashPassword("StrongPassphrase!2026");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(await verifyPassword("StrongPassphrase!2026", hash)).toBe(true);
    expect(await verifyPassword("WrongPassword!2026", hash)).toBe(false);
  });

  it("enforces least-privilege RBAC across ADMIN, EDITOR, and LEAD_MANAGER", () => {
    expect(hasPermission("ADMIN", "settings:manage")).toBe(true);
    expect(hasPermission("ADMIN", "leads:export")).toBe(true);

    expect(hasPermission("EDITOR", "content:publish")).toBe(true);
    expect(hasPermission("EDITOR", "leads:view")).toBe(false);
    expect(hasPermission("EDITOR", "leads:export")).toBe(false);
    expect(hasPermission("EDITOR", "settings:manage")).toBe(false);

    expect(hasPermission("LEAD_MANAGER", "leads:view")).toBe(true);
    expect(hasPermission("LEAD_MANAGER", "leads:update")).toBe(true);
    expect(hasPermission("LEAD_MANAGER", "content:publish")).toBe(false);
    expect(hasPermission("LEAD_MANAGER", "settings:manage")).toBe(false);
  });

  it("neutralizes spreadsheet formula injection in CSV export", () => {
    expect(sanitizeCsvCell("=CMD('calc')")).toBe("'=CMD('calc')");
    expect(sanitizeCsvCell("+8801712345678")).toBe("'+8801712345678");
    expect(sanitizeCsvCell("-1+1")).toBe("'-1+1");
    expect(sanitizeCsvCell("@SUM(A1:A2)")).toBe("'@SUM(A1:A2)");
    const csv = toCsv(["Reference", "Notes"], [["PS-2026-ABCDEFGH", "=1+1"]]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("'=1+1");
  });

  it("enforces sliding-window rate limits", () => {
    const limiter = new InMemoryRateLimiter({ maxRequests: 2, windowMs: 1000 });
    expect(limiter.check("ip1", 100).allowed).toBe(true);
    expect(limiter.check("ip1", 200).allowed).toBe(true);
    expect(limiter.check("ip1", 300).allowed).toBe(false);
    expect(limiter.check("ip1", 1200).allowed).toBe(true);
  });

  it("strips all PII fields from analytics payloads", () => {
    const clean = sanitizeAnalyticsPayload({
      pillar: "COURSES",
      slug: "complete-income-tax-course-bangladesh",
      name: "Secret Name",
      mobile: "01712345678",
      phone: "01712345678",
      email: "user@domain.com",
      addressArea: "Dhaka",
      problemDescription: "Confidential issue",
      publicReference: "BCP-2026-12345678",
    });

    expect(clean).toEqual({
      pillar: "COURSES",
      slug: "complete-income-tax-course-bangladesh",
    });
  });

  it("rejects oversized JSON before schema validation", async () => {
    const request = new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: "x".repeat(128) }),
    });
    await expect(readJsonBody(request, 32)).rejects.toMatchObject({
      code: "BODY_TOO_LARGE",
    });
  });
});
