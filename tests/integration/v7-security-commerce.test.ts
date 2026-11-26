import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentCustomer } from "@/lib/customer/auth";
import {
  assertPermission,
  AuthenticationError,
  type AdminPermission,
} from "@/lib/security/rbac";
import type { AuthenticatedAdmin } from "@/lib/security/session";

const state = vi.hoisted(() => ({
  dbConfigured: true,
  coreReady: true,
  customer: null as CurrentCustomer | null,
  admin: null as AuthenticatedAdmin | null,
}));

const mockTx = vi.hoisted(() => ({
  book: {
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  bookInventoryMovement: {
    create: vi.fn(),
  },
  order: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    findUnique: vi.fn(),
  },
  quote: {
    findFirst: vi.fn(),
    updateMany: vi.fn(),
  },
  paymentRecord: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  invoice: {
    updateMany: vi.fn(),
  },
  course: {
    findFirst: vi.fn(),
  },
  courseEntitlement: {
    upsert: vi.fn(),
    create: vi.fn(),
    findFirst: vi.fn(),
  },
  enrollment: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  lesson: {
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  lessonProgress: {
    upsert: vi.fn(),
    count: vi.fn(),
  },
  certificate: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  document: {
    update: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
}));

const mockPrisma = vi.hoisted(() => ({
  $queryRaw: vi.fn(async () => [{ "?column?": 1 }]),
  $transaction: vi.fn(
    async <T>(callback: (tx: typeof mockTx) => Promise<T>): Promise<T> =>
      callback(mockTx),
  ),
  document: {
    findUnique: vi.fn(),
  },
  organizationMembership: {
    findFirst: vi.fn(),
  },
  course: {
    findUnique: vi.fn(),
  },
  courseEntitlement: {
    findFirst: vi.fn(),
  },
  enrollment: {
    findUnique: vi.fn(),
  },
  analyticsServerEvent: {
    create: vi.fn(async () => ({})),
  },
  adminUser: {
    findUnique: vi.fn(),
  },
  auditLog: {
    create: vi.fn(async () => ({})),
  },
}));

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: vi.fn(() => state.dbConfigured),
  checkDatabaseHealth: vi.fn(async () => ({ status: "connected", latencyMs: 1 })),
  prisma: mockPrisma,
}));

vi.mock("@/lib/db/schema-ready", () => ({
  isCoreCommerceSchemaReady: vi.fn(async () => state.coreReady),
  isPublicSchemaReady: vi.fn(async () => state.coreReady),
  isBooksSchemaReady: vi.fn(async () => state.coreReady),
}));

vi.mock("@/lib/customer/auth", () => ({
  CUSTOMER_SESSION_COOKIE_NAME: "bcp_customer_session",
  getCurrentCustomer: vi.fn(async () => state.customer),
}));

vi.mock("@/lib/security/session", () => ({
  getCurrentAdminSession: vi.fn(async () => state.admin),
  requireAdminSession: vi.fn(async (permission?: AdminPermission) => {
    if (!state.admin) throw new AuthenticationError();
    if (permission) assertPermission(state.admin.role, permission);
    return state.admin;
  }),
}));

import { GET as getHealth } from "@/app/api/health/route";
import { PATCH as patchAdminDoc } from "@/app/api/admin/documents/[ref]/route";
import { POST as postBookCheckout } from "@/app/api/commerce/books/checkout/route";
import { POST as postCancelOrder } from "@/app/api/commerce/orders/[id]/cancel/route";
import { POST as postQuoteDecision } from "@/app/api/commerce/quotes/route";
import { POST as postSandboxPayment } from "@/app/api/commerce/payments/sandbox/route";
import { GET as getDocumentByRef } from "@/app/api/documents/[ref]/route";
import { POST as postLmsEnroll } from "@/app/api/lms/enroll/route";
import { POST as postLmsProgress } from "@/app/api/lms/progress/route";

const CUSTOMER_A: CurrentCustomer = {
  id: "cust-a",
  name: "Customer A",
  email: "a@business.bd",
  mobile: "01711111111",
  isVerified: true,
  organizations: [{ id: "org-a", name: "Org A Ltd", role: "OWNER" }],
};

const ADMIN_SESSION: AuthenticatedAdmin = {
  sessionId: "sess-admin-1",
  userId: "admin-1",
  email: "admin@bcp.bd",
  name: "Super Admin",
  role: "ADMIN",
};

const EDITOR_SESSION: AuthenticatedAdmin = {
  sessionId: "sess-editor-1",
  userId: "editor-1",
  email: "editor@bcp.bd",
  name: "Editor",
  role: "EDITOR",
};

function makeJsonRequest(
  url: string,
  method: "POST" | "PATCH",
  body: unknown,
): NextRequest {
  return new NextRequest(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("V7 Integration Verification (Health, Commerce, Storage RBAC & LMS Entitlements)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.dbConfigured = true;
    state.coreReady = true;
    state.customer = CUSTOMER_A;
    state.admin = null;
    process.env.NEXT_PUBLIC_APP_ENV = "staging";
    process.env.SANDBOX_PAYMENTS_ENABLED = "true";
    process.env.HEALTHCHECK_TOKEN = "test-secret-health-token-1234";
  });

  it("redacts health diagnostics publicly and reveals full diagnostics only with admin session or valid token", async () => {
    const publicRes = await getHealth(new NextRequest("http://localhost/api/health"));
    const publicJson = (await publicRes.json()) as Record<string, unknown>;
    expect(publicRes.status).toBe(200);
    expect(publicJson).toHaveProperty("ok", true);
    expect(publicJson).not.toHaveProperty("database");
    expect(publicJson).not.toHaveProperty("privateStorage");

    const tokenRes = await getHealth(
      new NextRequest("http://localhost/api/health", {
        headers: { Authorization: "Bearer test-secret-health-token-1234" },
      }),
    );
    const tokenJson = (await tokenRes.json()) as Record<string, unknown>;
    expect(tokenRes.status).toBe(200);
    expect(tokenJson).toHaveProperty("database");
    expect(tokenJson).toHaveProperty("privateStorage");
  });

  it("rejects split duplicate book items exceeding per-book quantity cap 20 and rejects conflicting idempotency payload hash", async () => {
    const splitRes = await postBookCheckout(
      makeJsonRequest("http://localhost/api/commerce/books/checkout", "POST", {
        items: [
          { bookId: "book-1", quantity: 12 },
          { bookId: "book-1", quantity: 12 },
        ],
        shippingName: "Rahman",
        shippingPhone: "01711111111",
        shippingAddress: "House 10, Road 4, Dhanmondi, Dhaka",
      }),
    );
    expect(splitRes.status).toBe(400);

    // Same idempotencyKey with a mismatched hash returns 409 IDEMPOTENCY_KEY_MISMATCH
    mockTx.order.findFirst.mockResolvedValueOnce({
      id: "ord-existing",
      publicReference: "ORD-BOOK-111",
      idempotencyHash: "different-hash-value",
      totalPaisa: 50000,
      totalBdt: 500,
      invoices: [],
    });

    const conflictRes = await postBookCheckout(
      makeJsonRequest("http://localhost/api/commerce/books/checkout", "POST", {
        items: [{ bookId: "book-1", quantity: 1 }],
        idempotencyKey: "client-key-12345678",
        shippingName: "Rahman",
        shippingPhone: "01711111111",
        shippingAddress: "House 10, Road 4, Dhanmondi, Dhaka",
      }),
    );
    const conflictJson = (await conflictRes.json()) as { code?: string };
    expect(conflictRes.status).toBe(409);
    expect(conflictJson.code).toBe("IDEMPOTENCY_KEY_MISMATCH");
  });

  it("blocks duplicate or expired quote acceptance atomically via updateMany", async () => {
    mockTx.quote.findFirst.mockResolvedValueOnce({
      id: "q-1",
      status: "SENT",
      validUntil: new Date(Date.now() + 60_000),
    });
    mockTx.quote.updateMany.mockResolvedValueOnce({ count: 0 });

    const raceRes = await postQuoteDecision(
      makeJsonRequest("http://localhost/api/commerce/quotes", "POST", {
        quoteId: "q-1",
        action: "ACCEPT",
      }),
    );
    expect(raceRes.status).toBe(409);
  });

  it("enforces atomic payment updateMany guard and cancels unpaid orders with stock restoration", async () => {
    // Concurrent payment attempt fails atomically if order already settled
    mockTx.order.findFirst.mockResolvedValueOnce({
      id: "ord-1",
      customerId: CUSTOMER_A.id,
      totalPaisa: 125000,
      totalBdt: 1250,
      paymentStatus: "UNPAID",
      status: "CONFIRMED",
      orderKind: "BOOK_STORE",
      quote: null,
    });
    mockTx.paymentRecord.findUnique.mockResolvedValueOnce(null);
    mockTx.order.updateMany.mockResolvedValueOnce({ count: 0 });

    const dupPayRes = await postSandboxPayment(
      makeJsonRequest("http://localhost/api/commerce/payments/sandbox", "POST", {
        orderId: "ord-1",
        transactionReference: "TXN-RACE-01",
      }),
    );
    expect(dupPayRes.status).toBe(409);

    // Customer cancellation restores book stock and voids DUE invoice
    mockTx.order.findFirst.mockResolvedValueOnce({
      id: "ord-2",
      publicReference: "ORD-BOOK-222",
      customerId: CUSTOMER_A.id,
      status: "CONFIRMED",
      paymentStatus: "UNPAID",
      bookItems: [{ id: "bi-1", bookId: "book-1", quantity: 3 }],
    });
    mockTx.order.updateMany.mockResolvedValueOnce({ count: 1 });
    mockTx.book.update.mockResolvedValueOnce({ id: "book-1" });
    mockTx.bookInventoryMovement.create.mockResolvedValueOnce({});
    mockTx.invoice.updateMany.mockResolvedValueOnce({ count: 1 });
    mockTx.auditLog.create.mockResolvedValueOnce({});
    mockTx.order.findUnique.mockResolvedValueOnce({
      id: "ord-2",
      publicReference: "ORD-BOOK-222",
      status: "CANCELLED",
      bookItems: [{ id: "bi-1", bookId: "book-1", quantity: 3 }],
      invoices: [],
    });

    const cancelRes = await postCancelOrder(
      makeJsonRequest("http://localhost/api/commerce/orders/ord-2/cancel", "POST", {
        reason: "Changed order",
      }),
      { params: Promise.resolve({ id: "ord-2" }) },
    );
    expect(cancelRes.status).toBe(200);
    expect(mockTx.book.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "book-1" },
        data: { stockQuantity: { increment: 3 } },
      }),
    );
    expect(mockTx.bookInventoryMovement.create).toHaveBeenCalledTimes(1);
  });

  it("blocks quarantined document download (423) and enforces staff RBAC on admin document review", async () => {
    // Customer cannot download quarantined document
    mockPrisma.document.findUnique.mockResolvedValueOnce({
      id: "doc-q",
      publicReference: "DOC-2026-QUAR",
      customerId: CUSTOMER_A.id,
      organizationId: null,
      quarantineStatus: "QUARANTINED",
      fileKey: "cust-a/doc.pdf",
      storageProvider: "LOCAL",
      deletedAt: null,
    });

    const quarantinedRes = await getDocumentByRef(
      new NextRequest("http://localhost/api/documents/DOC-2026-QUAR"),
      { params: Promise.resolve({ ref: "DOC-2026-QUAR" }) },
    );
    expect(quarantinedRes.status).toBe(423);

    // EDITOR cannot assign/quarantine documents
    state.customer = null;
    state.admin = EDITOR_SESSION;
    const editorRes = await patchAdminDoc(
      makeJsonRequest("http://localhost/api/admin/documents/DOC-2026-QUAR", "PATCH", {
        quarantineStatus: "CLEAR",
      }),
      { params: Promise.resolve({ ref: "DOC-2026-QUAR" }) },
    );
    expect(editorRes.status).toBe(403);

    // ADMIN can review & release quarantine
    state.admin = ADMIN_SESSION;
    mockPrisma.document.findUnique.mockResolvedValueOnce({
      id: "doc-q",
      publicReference: "DOC-2026-QUAR",
      deletedAt: null,
    });
    mockTx.document.update.mockResolvedValueOnce({
      id: "doc-q",
      publicReference: "DOC-2026-QUAR",
      quarantineStatus: "CLEAR",
      status: "VERIFIED",
    });
    const adminRes = await patchAdminDoc(
      makeJsonRequest("http://localhost/api/admin/documents/DOC-2026-QUAR", "PATCH", {
        quarantineStatus: "CLEAR",
        status: "VERIFIED",
      }),
      { params: Promise.resolve({ ref: "DOC-2026-QUAR" }) },
    );
    expect(adminRes.status).toBe(200);
  });

  it("enforces Course.enrollmentModel and revokes LMS progress when PAID CourseEntitlement is inactive", async () => {
    // ENQUIRY_ONLY course rejects direct LMS self-enrollment
    mockPrisma.course.findUnique.mockResolvedValueOnce({
      id: "course-enq",
      slug: "rjsc-practical",
      titleBn: "RJSC",
      contentStatus: "PUBLISHED",
      availabilityStatus: "ACTIVE",
      enrollmentModel: "ENQUIRY_ONLY",
      pricePaisa: null,
    });

    const enqRes = await postLmsEnroll(
      makeJsonRequest("http://localhost/api/lms/enroll", "POST", {
        courseId: "course-enq",
      }),
    );
    expect(enqRes.status).toBe(403);

    // PAID course progress check rejects if CourseEntitlement was revoked/expired
    mockTx.enrollment.findFirst.mockResolvedValueOnce({
      id: "enr-paid",
      customerId: CUSTOMER_A.id,
      courseId: "course-paid",
      status: "ACTIVE",
      course: {
        id: "course-paid",
        slug: "tax-pro",
        titleBn: "Tax Pro",
        enrollmentModel: "PAID",
      },
    });
    mockTx.courseEntitlement.findFirst.mockResolvedValueOnce(null);

    const revokedProgressRes = await postLmsProgress(
      makeJsonRequest("http://localhost/api/lms/progress", "POST", {
        enrollmentId: "enr-paid",
        lessonId: "les-1",
        isCompleted: true,
      }),
    );
    expect(revokedProgressRes.status).toBe(403);
    expect(mockTx.lessonProgress.upsert).not.toHaveBeenCalled();
  });
});
