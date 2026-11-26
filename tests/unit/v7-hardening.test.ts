import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getAnalyticsVerificationLevel,
  sanitizeAnalyticsPayload,
} from "@/lib/analytics/events";
import {
  canTransitionOrderStatus,
  CommerceValidationError,
  hashIdempotencyPayload,
  isSandboxGatewayEnabled,
  normalizeAndValidateBookItems,
} from "@/lib/commerce/checkout-rules";
import {
  computeLineItemTotalPaisa,
  formatBdtFromPaisa,
  fromPaisa,
  toPaisa,
} from "@/lib/commerce/payments";
import { hasPermission } from "@/lib/security/rbac";
import {
  assertDurablePrivateStorageConfigured,
  buildSafeAttachmentContentDisposition,
  computeBufferSha256,
  resolveSafeStoragePath,
  StorageConfigurationError,
  verifyDocumentMagicBytes,
} from "@/lib/storage/private-documents";
import { clampFrameDelta, createDeltaTimer } from "@/lib/three/timing";

describe("V7 Security, Storage & Commerce Unit Hardening", () => {
  const savedEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    PRIVATE_STORAGE_PROVIDER: process.env.PRIVATE_STORAGE_PROVIDER,
    PRIVATE_STORAGE_DIR: process.env.PRIVATE_STORAGE_DIR,
    ALLOW_EPHEMERAL_PRIVATE_STORAGE: process.env.ALLOW_EPHEMERAL_PRIVATE_STORAGE,
    SANDBOX_PAYMENTS_ENABLED: process.env.SANDBOX_PAYMENTS_ENABLED,
  };

  afterEach(() => {
    vi.unstubAllEnvs();
    process.env.NEXT_PUBLIC_APP_ENV = savedEnv.NEXT_PUBLIC_APP_ENV;
    process.env.PRIVATE_STORAGE_PROVIDER = savedEnv.PRIVATE_STORAGE_PROVIDER;
    process.env.PRIVATE_STORAGE_DIR = savedEnv.PRIVATE_STORAGE_DIR;
    process.env.ALLOW_EPHEMERAL_PRIVATE_STORAGE =
      savedEnv.ALLOW_EPHEMERAL_PRIVATE_STORAGE;
    process.env.SANDBOX_PAYMENTS_ENABLED = savedEnv.SANDBOX_PAYMENTS_ENABLED;
  });

  it("enforces least-privilege RBAC for private documents and order management", () => {
    // ADMIN has full governance
    expect(hasPermission("ADMIN", "documents:admin")).toBe(true);
    expect(hasPermission("ADMIN", "documents:delete")).toBe(true);
    expect(hasPermission("ADMIN", "orders:cancel")).toBe(true);

    // EDITOR cannot access customer private documents or orders
    expect(hasPermission("EDITOR", "documents:review")).toBe(false);
    expect(hasPermission("EDITOR", "documents:download")).toBe(false);
    expect(hasPermission("EDITOR", "documents:admin")).toBe(false);
    expect(hasPermission("EDITOR", "documents:delete")).toBe(false);
    expect(hasPermission("EDITOR", "orders:manage")).toBe(false);
    expect(hasPermission("EDITOR", "orders:cancel")).toBe(false);

    // LEAD_MANAGER can review document statuses and manage order fulfillment,
    // but cannot download customer files, delete docs, bypass admin gate, or cancel orders
    expect(hasPermission("LEAD_MANAGER", "documents:review")).toBe(true);
    expect(hasPermission("LEAD_MANAGER", "documents:download")).toBe(false);
    expect(hasPermission("LEAD_MANAGER", "documents:admin")).toBe(false);
    expect(hasPermission("LEAD_MANAGER", "documents:delete")).toBe(false);
    expect(hasPermission("LEAD_MANAGER", "orders:manage")).toBe(true);
    expect(hasPermission("LEAD_MANAGER", "orders:cancel")).toBe(false);
  });

  it("fails closed in production when durable private storage (S3/SUPABASE) is unconfigured", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.PRIVATE_STORAGE_PROVIDER;
    delete process.env.ALLOW_EPHEMERAL_PRIVATE_STORAGE;

    expect(() => assertDurablePrivateStorageConfigured()).toThrow(
      StorageConfigurationError,
    );

    process.env.ALLOW_EPHEMERAL_PRIVATE_STORAGE = "true";
    expect(() => assertDurablePrivateStorageConfigured()).not.toThrow();
  });

  it("validates magic bytes, computes SHA-256, prevents path traversal, and hardens Content-Disposition", () => {
    const pngSig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect(verifyDocumentMagicBytes(pngSig, "image/png")).toBe("image/png");
    expect(verifyDocumentMagicBytes(Buffer.from("<html>bad</html>"), "image/png")).toBeNull();

    const digest = computeBufferSha256(Buffer.from("bcp-test"));
    expect(digest).toMatch(/^[a-f0-9]{64}$/);

    expect(() => resolveSafeStoragePath("../secret/key.pdf")).toThrow();
    expect(buildSafeAttachmentContentDisposition("DOC-2026-AB12\"..\r\n", "application/pdf")).toBe(
      'attachment; filename="DOC-2026-AB12_..__.pdf"',
    );
  });

  it("merges duplicate book checkout items BEFORE enforcing max-20 and max-50 quantity caps", () => {
    const merged = normalizeAndValidateBookItems([
      { bookId: "book-1", quantity: 10 },
      { bookId: "book-1", quantity: 10 },
      { bookId: "book-2", quantity: 5 },
    ]);
    expect(merged).toEqual([
      { bookId: "book-1", quantity: 20 },
      { bookId: "book-2", quantity: 5 },
    ]);

    // Splitting 12 + 12 across two array entries exceeds 20 per book after merge
    expect(() =>
      normalizeAndValidateBookItems([
        { bookId: "book-1", quantity: 12 },
        { bookId: "book-1", quantity: 12 },
      ]),
    ).toThrow(CommerceValidationError);

    // Total across 3 distinct books > 50 fails
    expect(() =>
      normalizeAndValidateBookItems([
        { bookId: "b1", quantity: 20 },
        { bookId: "b2", quantity: 20 },
        { bookId: "b3", quantity: 11 },
      ]),
    ).toThrow(CommerceValidationError);
  });

  it("preserves exact integer paisa arithmetic and deterministic idempotency hashes", () => {
    expect(toPaisa(1250.5)).toBe(125050);
    expect(fromPaisa(125050)).toBe(1250.5);
    expect(computeLineItemTotalPaisa(125050, 3)).toBe(375150);
    expect(formatBdtFromPaisa(125000, "en-US")).toBe("৳ 1,250");
    expect(formatBdtFromPaisa(125050, "en-US")).toBe("৳ 1,250.50");

    const h1 = hashIdempotencyPayload({ items: [{ bookId: "b1", quantity: 2 }] });
    const h2 = hashIdempotencyPayload({ items: [{ bookId: "b1", quantity: 2 }] });
    const h3 = hashIdempotencyPayload({ items: [{ bookId: "b1", quantity: 3 }] });
    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
  });

  it("requires both non-production env and SANDBOX_PAYMENTS_ENABLED=true for sandbox gateway", () => {
    process.env.NEXT_PUBLIC_APP_ENV = "staging";
    delete process.env.SANDBOX_PAYMENTS_ENABLED;
    expect(isSandboxGatewayEnabled()).toBe(false);

    process.env.SANDBOX_PAYMENTS_ENABLED = "true";
    expect(isSandboxGatewayEnabled()).toBe(true);

    process.env.NEXT_PUBLIC_APP_ENV = "production";
    expect(isSandboxGatewayEnabled()).toBe(false);
  });

  it("enforces order state machine transitions", () => {
    expect(canTransitionOrderStatus("CONFIRMED", "IN_FULFILLMENT")).toBe(true);
    expect(canTransitionOrderStatus("CONFIRMED", "CANCELLED")).toBe(true);
    expect(canTransitionOrderStatus("DELIVERED", "REFUNDED")).toBe(true);
    expect(canTransitionOrderStatus("CANCELLED", "CONFIRMED")).toBe(false);
    expect(canTransitionOrderStatus("REFUNDED", "DELIVERED")).toBe(false);
  });

  it("forces browser analytics calls to always record client_observed", () => {
    expect(getAnalyticsVerificationLevel()).toBe("client_observed");
    expect(
      sanitizeAnalyticsPayload({
        verificationLevel: "server_verified",
        email: "x@y.bd",
        slug: "tax-guide",
      }),
    ).toEqual({ slug: "tax-guide" });
  });

  it("clamps WebGL frame delta cleanly without THREE.Clock", () => {
    expect(clampFrameDelta(0.5)).toBe(0.08);
    const timer = createDeltaTimer(100, 0.08);
    expect(timer.step(116).delta).toBeCloseTo(0.016, 4);
  });
});
