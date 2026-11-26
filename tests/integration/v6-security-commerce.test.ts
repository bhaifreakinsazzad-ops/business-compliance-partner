import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextRequest } from "next/server";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentCustomer } from "@/lib/customer/auth";

const state = vi.hoisted(() => ({
  dbConfigured: true,
  coreReady: true,
  customer: null as CurrentCustomer | null,
  admin: null as { userId: string } | null,
}));

const mockTx = vi.hoisted(() => ({
  order: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  quote: {
    findFirst: vi.fn(),
  },
  paymentRecord: {
    findUnique: vi.fn(),
  },
  invoice: {
    updateMany: vi.fn(),
  },
  enrollment: {
    findFirst: vi.fn(),
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
    create: vi.fn(),
    update: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
  courseEntitlement: {
    findFirst: vi.fn(),
    create: vi.fn(),
    upsert: vi.fn(),
  },
}));

const mockPrisma = vi.hoisted(() => ({
  course: {
    findUnique: vi.fn(),
  },
  courseEntitlement: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
  enrollment: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  order: {
    findFirst: vi.fn(),
  },
  complianceCase: {
    findFirst: vi.fn(),
  },
  serviceRequest: {
    findFirst: vi.fn(),
  },
  organizationMembership: {
    findFirst: vi.fn(),
  },
  auditLog: {
    create: vi.fn(async () => ({})),
  },
  document: {
    create: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  $transaction: vi.fn(
    async <T>(callback: (tx: typeof mockTx) => Promise<T>): Promise<T> =>
      callback(mockTx),
  ),
}));

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: vi.fn(() => state.dbConfigured),
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
}));

import { POST as postOrder } from "@/app/api/commerce/orders/route";
import { POST as postSandboxPayment } from "@/app/api/commerce/payments/sandbox/route";
import { POST as postEnroll } from "@/app/api/lms/enroll/route";
import { POST as postProgress } from "@/app/api/lms/progress/route";
import { POST as postDocument } from "@/app/api/documents/route";
import { GET as getDocumentByRef } from "@/app/api/documents/[ref]/route";
import { GET as verifyCertificate } from "@/app/api/lms/certificate/route";
import {
  resolveSafeStoragePath,
  verifyDocumentMagicBytes,
} from "@/lib/storage/private-documents";

const CUSTOMER_A: CurrentCustomer = {
  id: "cust-a",
  name: "Customer A",
  email: "a@business.bd",
  mobile: "01711111111",
  isVerified: true,
  organizations: [{ id: "org-a", name: "Org A Ltd", role: "OWNER" }],
};

const CUSTOMER_B: CurrentCustomer = {
  id: "cust-b",
  name: "Customer B",
  email: "b@business.bd",
  mobile: "01722222222",
  isVerified: true,
  organizations: [{ id: "org-b", name: "Org B Ltd", role: "OWNER" }],
};

const tempStorageDir = mkdtempSync(path.join(os.tmpdir(), "bcp-doc-test-"));

function jsonReq(url: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("V6 Security & Commerce Integrity Remediations (V6-001 to V6-004)", () => {
  const originalEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    PRIVATE_STORAGE_DIR: process.env.PRIVATE_STORAGE_DIR,
    SANDBOX_PAYMENTS_ENABLED: process.env.SANDBOX_PAYMENTS_ENABLED,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    state.dbConfigured = true;
    state.coreReady = true;
    state.customer = CUSTOMER_A;
    state.admin = null;
    process.env.PRIVATE_STORAGE_DIR = tempStorageDir;
    process.env.NEXT_PUBLIC_APP_ENV = "staging";
    process.env.SANDBOX_PAYMENTS_ENABLED = "true";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_APP_ENV = originalEnv.NEXT_PUBLIC_APP_ENV;
    process.env.PRIVATE_STORAGE_DIR = originalEnv.PRIVATE_STORAGE_DIR;
    process.env.SANDBOX_PAYMENTS_ENABLED = originalEnv.SANDBOX_PAYMENTS_ENABLED;
    rmSync(tempStorageDir, { recursive: true, force: true });
  });

  it("V6-001: fails closed with 503 when database/schema unavailable instead of returning mock orders", async () => {
    state.dbConfigured = false;
    const res = await postOrder(
      jsonReq("http://localhost/api/commerce/orders", { quoteId: "q-1" }),
    );
    expect(res.status).toBe(503);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("V6-001: creates order with server-authoritative paisa total and reuses existing order idempotently", async () => {
    mockTx.order.findFirst.mockResolvedValueOnce(null);
    mockTx.quote.findFirst.mockResolvedValueOnce({
      id: "q-1",
      customerId: "cust-a",
      status: "ACCEPTED",
      totalAmountBdt: 5000,
      validUntil: null,
      items: [
        { quantity: 2, unitPriceBdt: 1500 },
        { quantity: 1, unitPriceBdt: 2500 },
      ],
    });
    mockTx.order.create.mockResolvedValueOnce({
      id: "ord-1",
      publicReference: "ORD-2026-1234",
      totalBdt: 5500,
      invoices: [{ invoiceNumber: "INV-2026-1234", amountBdt: 5500 }],
    });

    const res = await postOrder(
      jsonReq("http://localhost/api/commerce/orders", {
        quoteId: "q-1",
        idempotencyKey: "idem-key-12345678",
      }),
    );
    expect(res.status).toBe(200);
    const createdCall = mockTx.order.create.mock.calls[0]?.[0] as {
      data: { totalBdt: number };
    };
    // Authoritative sum of items (2*1500 + 2500 = 5500) rather than tampered or stale field
    expect(createdCall.data.totalBdt).toBe(5500);

    // Replay returns idempotent existing order without inserting duplicate
    mockTx.order.findFirst.mockResolvedValueOnce({
      id: "ord-1",
      publicReference: "ORD-2026-1234",
      totalBdt: 5500,
    });
    const replayRes = await postOrder(
      jsonReq("http://localhost/api/commerce/orders", {
        quoteId: "q-1",
        idempotencyKey: "idem-key-12345678",
      }),
    );
    const replayJson = (await replayRes.json()) as { idempotent: boolean };
    expect(replayRes.status).toBe(200);
    expect(replayJson.idempotent).toBe(true);
    expect(mockTx.order.create).toHaveBeenCalledTimes(1);
  });

  it("V6-002: blocks sandbox payment in production and verifies ownership + amount match", async () => {
    process.env.NEXT_PUBLIC_APP_ENV = "production";
    const blockedRes = await postSandboxPayment(
      jsonReq("http://localhost/api/commerce/payments/sandbox", {
        orderId: "ord-1",
        amountBdt: 5500,
      }),
    );
    expect(blockedRes.status).toBe(403);

    // Non-prod checks
    process.env.NEXT_PUBLIC_APP_ENV = "staging";

    // Wrong owner -> 404
    mockTx.order.findFirst.mockResolvedValueOnce(null);
    const nonOwnerRes = await postSandboxPayment(
      jsonReq("http://localhost/api/commerce/payments/sandbox", {
        orderId: "ord-other",
        amountBdt: 5500,
      }),
    );
    expect(nonOwnerRes.status).toBe(404);

    // Tampered client amount -> 400
    mockTx.order.findFirst.mockResolvedValueOnce({
      id: "ord-1",
      customerId: "cust-a",
      totalBdt: 5500,
      paymentStatus: "UNPAID",
    });
    mockTx.paymentRecord.findUnique.mockResolvedValueOnce(null);
    const tamperedRes = await postSandboxPayment(
      jsonReq("http://localhost/api/commerce/payments/sandbox", {
        orderId: "ord-1",
        amountBdt: 1,
        transactionReference: "TXN-SBX-TAMPER",
      }),
    );
    expect(tamperedRes.status).toBe(400);
    expect(mockTx.order.update).not.toHaveBeenCalled();
  });

  it("V6-003: enforces course publication, active status, payment entitlement, and lesson ownership", async () => {
    // Paid course without paid order -> 402
    mockPrisma.course.findUnique.mockResolvedValueOnce({
      id: "course-paid",
      slug: "vat-pro-course",
      titleBn: "VAT Pro",
      contentStatus: "PUBLISHED",
      availabilityStatus: "ACTIVE",
      enrollmentModel: "PAID",
      pricePaisa: 500000,
    });
    mockPrisma.courseEntitlement.findFirst.mockResolvedValueOnce(null);
    mockPrisma.enrollment.findUnique.mockResolvedValueOnce(null);

    const unpaidEnrollRes = await postEnroll(
      jsonReq("http://localhost/api/lms/enroll", { courseId: "course-paid" }),
    );
    expect(unpaidEnrollRes.status).toBe(402);

    // Cross-course lesson update -> 403
    mockTx.enrollment.findFirst.mockResolvedValueOnce({
      id: "enr-1",
      customerId: "cust-a",
      courseId: "course-1",
      status: "ACTIVE",
      course: {
        id: "course-1",
        slug: "course-1",
        titleBn: "Course 1",
        enrollmentModel: "FREE",
      },
    });
    mockTx.lesson.findFirst.mockResolvedValueOnce(null);
    const wrongLessonRes = await postProgress(
      jsonReq("http://localhost/api/lms/progress", {
        enrollmentId: "enr-1",
        lessonId: "lesson-from-another-course",
        isCompleted: true,
      }),
    );
    expect(wrongLessonRes.status).toBe(403);
    expect(mockTx.lessonProgress.upsert).not.toHaveBeenCalled();

    // Certificate endpoint fails closed when DB offline (no demo certificate)
    state.dbConfigured = false;
    const certRes = await verifyCertificate(
      new NextRequest("http://localhost/api/lms/certificate?code=ANYCODE"),
    );
    expect(certRes.status).toBe(503);
  });

  it("V6-004: validates file magic bytes, rejects path traversal, enforces ownership on upload & download", async () => {
    // Reject spoofed PDF containing plain script text
    expect(
      verifyDocumentMagicBytes(Buffer.from("<script>alert(1)</script>"), "application/pdf"),
    ).toBeNull();

    // Accept real PDF signature
    const pdfBuffer = Buffer.from("%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF");
    expect(verifyDocumentMagicBytes(pdfBuffer, "application/pdf")).toBe("application/pdf");

    // Path traversal blocked
    expect(() => resolveSafeStoragePath("../../etc/passwd")).toThrow();

    // Non-owner caseId rejected before saving file
    mockPrisma.complianceCase.findFirst.mockResolvedValueOnce(null);
    const form = new FormData();
    form.append("title", "Trade License");
    form.append("caseId", "case-not-owned");
    form.append(
      "file",
      new File([pdfBuffer], "license.pdf", { type: "application/pdf" }),
    );
    const uploadBlockedRes = await postDocument(
      new NextRequest("http://localhost/api/documents", {
        method: "POST",
        body: form,
      }),
    );
    expect(uploadBlockedRes.status).toBe(403);

    // Valid upload by Customer A saves file & DB row, then Customer B gets 403 on download, Customer A gets 200 bytes
    mockPrisma.complianceCase.findFirst.mockResolvedValueOnce({ id: "case-owned" });
    mockTx.document.create.mockImplementationOnce(async ({ data }) => data);

    const validForm = new FormData();
    validForm.append("title", "TIN Certificate");
    validForm.append("caseId", "case-owned");
    validForm.append(
      "file",
      new File([pdfBuffer], "tin.pdf", { type: "application/pdf" }),
    );
    const uploadOk = await postDocument(
      new NextRequest("http://localhost/api/documents", {
        method: "POST",
        body: validForm,
      }),
    );
    expect(uploadOk.status).toBe(201);
    const { document } = (await uploadOk.json()) as {
      document: { publicReference: string; fileKey: string; mimeType: string };
    };

    // Customer B tries to download -> 403
    state.customer = CUSTOMER_B;
    mockPrisma.document.findUnique.mockResolvedValueOnce({
      ...document,
      customerId: CUSTOMER_A.id,
    });
    const forbiddenDownload = await getDocumentByRef(
      new NextRequest(`http://localhost/api/documents/${document.publicReference}`),
      { params: Promise.resolve({ ref: document.publicReference }) },
    );
    expect(forbiddenDownload.status).toBe(403);

    // Customer A downloads -> 200 with private cache headers & exact PDF bytes
    state.customer = CUSTOMER_A;
    mockPrisma.document.findUnique.mockResolvedValueOnce({
      ...document,
      customerId: CUSTOMER_A.id,
    });
    const allowedDownload = await getDocumentByRef(
      new NextRequest(`http://localhost/api/documents/${document.publicReference}`),
      { params: Promise.resolve({ ref: document.publicReference }) },
    );
    expect(allowedDownload.status).toBe(200);
    expect(allowedDownload.headers.get("Cache-Control")).toContain("private");
    expect(allowedDownload.headers.get("X-Content-Type-Options")).toBe("nosniff");
    const downloadedBytes = Buffer.from(await allowedDownload.arrayBuffer());
    expect(downloadedBytes.toString("utf8")).toContain("%PDF-1.7");
  });
});
