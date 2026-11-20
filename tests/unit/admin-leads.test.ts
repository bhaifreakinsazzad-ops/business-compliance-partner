import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { sanitizeAdminRedirectPath } from "@/components/admin/admin-redirect";
import * as rbac from "@/lib/security/rbac";
import { AuthenticationError, AuthorizationError } from "@/lib/security/rbac";

const mockState = vi.hoisted(() => {
  const lead = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };
  const auditLog = {
    create: vi.fn(),
  };
  const prisma = {
    lead,
    auditLog,
    $transaction: vi.fn(
      async (callback: (tx: { lead: typeof lead; auditLog: typeof auditLog }) => Promise<unknown>) =>
        callback({ lead, auditLog }),
    ),
  };

  return {
    isDatabaseConfigured: vi.fn(() => true),
    requireAdminSession: vi.fn(),
    prisma,
  };
});

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: mockState.isDatabaseConfigured,
  prisma: mockState.prisma,
}));

vi.mock("@/lib/security/session", () => ({
  requireAdminSession: mockState.requireAdminSession,
}));

import { GET } from "@/app/api/admin/leads/route";
import { PATCH } from "@/app/api/admin/leads/[id]/route";

const ADMIN_SESSION = {
  sessionId: "sess-1",
  userId: "user-admin-1",
  email: "admin@paperworksquad.com",
  name: "Super Admin",
  role: "ADMIN" as const,
};

const LEAD_MANAGER_SESSION = {
  sessionId: "sess-2",
  userId: "user-lm-1",
  email: "leads@paperworksquad.com",
  name: "Lead Manager",
  role: "LEAD_MANAGER" as const,
};

describe("GET /api/admin/leads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    mockState.isDatabaseConfigured.mockReturnValue(true);
    mockState.requireAdminSession.mockResolvedValue(LEAD_MANAGER_SESSION);
    mockState.prisma.lead.findMany.mockResolvedValue([]);
    mockState.prisma.lead.count.mockResolvedValue(0);
    mockState.prisma.auditLog.create.mockResolvedValue({ id: "audit-1" });
  });

  it("returns 401 when unauthenticated", async () => {
    mockState.requireAdminSession.mockRejectedValue(new AuthenticationError());
    const req = new NextRequest("http://localhost:3000/api/admin/leads");
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it("returns 403 when role lacks leads:view", async () => {
    mockState.requireAdminSession.mockRejectedValue(new AuthorizationError());
    const req = new NextRequest("http://localhost:3000/api/admin/leads");
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it("returns 503 when database is not configured", async () => {
    mockState.isDatabaseConfigured.mockReturnValue(false);
    const req = new NextRequest("http://localhost:3000/api/admin/leads");
    const res = await GET(req);
    expect(res.status).toBe(503);
  });

  it("returns 422 on invalid status or pillar filter", async () => {
    const badStatus = new NextRequest(
      "http://localhost:3000/api/admin/leads?status=IN_PROGRESS",
    );
    const resStatus = await GET(badStatus);
    expect(resStatus.status).toBe(422);

    const badPillar = new NextRequest(
      "http://localhost:3000/api/admin/leads?pillar=UNKNOWN",
    );
    const resPillar = await GET(badPillar);
    expect(resPillar.status).toBe(422);
    expect(mockState.prisma.lead.findMany).not.toHaveBeenCalled();
  });

  it("handles status=ALL, pillar=ALL, and valid enum/search filters", async () => {
    const allReq = new NextRequest(
      "http://localhost:3000/api/admin/leads?status=ALL&pillar=ALL",
    );
    const allRes = await GET(allReq);
    expect(allRes.status).toBe(200);
    expect(mockState.prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 0,
        take: 25,
      }),
    );

    vi.clearAllMocks();
    mockState.isDatabaseConfigured.mockReturnValue(true);
    mockState.requireAdminSession.mockResolvedValue(LEAD_MANAGER_SESSION);
    mockState.prisma.lead.findMany.mockResolvedValue([]);
    mockState.prisma.lead.count.mockResolvedValue(0);

    const filteredReq = new NextRequest(
      "http://localhost:3000/api/admin/leads?status=QUALIFIED&pillar=LICENSING&q=tax",
    );
    const filteredRes = await GET(filteredReq);
    expect(filteredRes.status).toBe(200);
    expect(mockState.prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "QUALIFIED",
          pillar: "LICENSING",
          OR: expect.any(Array),
        }),
      }),
    );
  });

  it("guards NaN and out-of-range pagination values", async () => {
    const nanReq = new NextRequest(
      "http://localhost:3000/api/admin/leads?page=abc&limit=xyz",
    );
    const nanRes = await GET(nanReq);
    expect(nanRes.status).toBe(200);
    expect(mockState.prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 25 }),
    );

    vi.clearAllMocks();
    mockState.isDatabaseConfigured.mockReturnValue(true);
    mockState.requireAdminSession.mockResolvedValue(LEAD_MANAGER_SESSION);
    mockState.prisma.lead.findMany.mockResolvedValue([]);
    mockState.prisma.lead.count.mockResolvedValue(0);

    const boundsReq = new NextRequest(
      "http://localhost:3000/api/admin/leads?page=-2&limit=999",
    );
    const boundsRes = await GET(boundsReq);
    expect(boundsRes.status).toBe(200);
    expect(mockState.prisma.lead.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 100 }),
    );
  });

  it("enforces leads:export permission on format=csv", async () => {
    mockState.requireAdminSession.mockResolvedValue({
      ...LEAD_MANAGER_SESSION,
      role: "EDITOR" as const,
    });

    const req = new NextRequest(
      "http://localhost:3000/api/admin/leads?format=csv",
    );
    const res = await GET(req);
    expect(res.status).toBe(403);
    expect(mockState.prisma.lead.findMany).not.toHaveBeenCalled();
    expect(mockState.prisma.auditLog.create).not.toHaveBeenCalled();
  });

  it("exports UTF-8 BOM CSV via toCsv without double-quoting and neutralizes formulas", async () => {
    mockState.requireAdminSession.mockResolvedValue(ADMIN_SESSION);
    mockState.prisma.lead.findMany.mockResolvedValue([
      {
        id: "lead-1",
        publicReference: "PS-2026-AB12CD34",
        createdAt: new Date("2026-11-01T10:00:00.000Z"),
        name: 'Rahim, "Corp"',
        mobile: "+8801712345678",
        email: "@SUM(A1)",
        pillar: "CONSULTANCY",
        targetSlug: "=CMD('calc')",
        status: "NEW",
        addressArea: "Dhaka, Gulshan",
      },
    ]);

    const req = new NextRequest(
      "http://localhost:3000/api/admin/leads?format=csv&pillar=CONSULTANCY",
      { headers: { "x-forwarded-for": "203.0.113.10" } },
    );
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");
    expect(res.headers.get("Cache-Control")).toBe("no-store, private");

    const rawBytes = new Uint8Array(await res.arrayBuffer());
    expect(Array.from(rawBytes.slice(0, 3))).toEqual([0xef, 0xbb, 0xbf]);
    const body = new TextDecoder("utf-8", { ignoreBOM: true }).decode(rawBytes);
    expect(body.startsWith("\uFEFF")).toBe(true);
    // Verify proper RFC 4180 single-layer quoting (not triple-quoted)
    expect(body).toContain('"Rahim, ""Corp"""');
    expect(body).not.toContain('"""Rahim');
    // Formula neutralization
    expect(body).toContain("'+8801712345678");
    expect(body).toContain("'@SUM(A1)");
    expect(body).toContain("'=CMD('calc')");

    expect(mockState.prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "EXPORT_LEADS_CSV",
        entityType: "Lead",
        ipHash: expect.any(String),
        metadata: expect.objectContaining({
          count: 1,
          filters: { status: null, pillar: "CONSULTANCY", search: null },
        }),
      }),
    });
  });
});

describe("PATCH /api/admin/leads/[id]", () => {
  const existingLead = {
    id: "lead-1",
    publicReference: "PS-2026-AB12CD34",
    status: "NEW",
    assignedToId: null,
    contactedAt: null,
    closedAt: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    mockState.isDatabaseConfigured.mockReturnValue(true);
    mockState.requireAdminSession.mockResolvedValue(LEAD_MANAGER_SESSION);
    mockState.prisma.lead.findUnique.mockResolvedValue(existingLead);
    mockState.prisma.lead.update.mockResolvedValue({
      ...existingLead,
      status: "REVIEWED",
      assignedTo: null,
    });
    mockState.prisma.auditLog.create.mockResolvedValue({ id: "audit-1" });
  });

  const makeContext = (id = "lead-1") => ({
    params: Promise.resolve({ id }),
  });

  it("returns 401 when unauthenticated and 403 when lacking leads:update", async () => {
    mockState.requireAdminSession.mockRejectedValueOnce(new AuthenticationError());
    const unauthReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      { method: "PATCH", body: JSON.stringify({ status: "REVIEWED" }) },
    );
    expect((await PATCH(unauthReq, makeContext())).status).toBe(401);

    mockState.requireAdminSession.mockRejectedValueOnce(new AuthorizationError());
    const forbiddenReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      { method: "PATCH", body: JSON.stringify({ status: "REVIEWED" }) },
    );
    expect((await PATCH(forbiddenReq, makeContext())).status).toBe(403);
  });

  it("returns 503 when database is not configured", async () => {
    mockState.isDatabaseConfigured.mockReturnValue(false);
    const req = new NextRequest("http://localhost:3000/api/admin/leads/lead-1", {
      method: "PATCH",
      body: JSON.stringify({ status: "REVIEWED" }),
    });
    expect((await PATCH(req, makeContext())).status).toBe(503);
  });

  it("returns 400 on malformed JSON or empty id", async () => {
    const emptyIdReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/ ",
      { method: "PATCH", body: JSON.stringify({ status: "REVIEWED" }) },
    );
    expect((await PATCH(emptyIdReq, makeContext("  "))).status).toBe(400);

    const badJsonReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      { method: "PATCH", body: "{bad json" },
    );
    expect((await PATCH(badJsonReq, makeContext())).status).toBe(400);
  });

  it("returns 422 on invalid status, oversized notes, or forbidden content", async () => {
    const invalidStatusReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      { method: "PATCH", body: JSON.stringify({ status: "IN_PROGRESS" }) },
    );
    expect((await PATCH(invalidStatusReq, makeContext())).status).toBe(422);

    const longNotesReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      {
        method: "PATCH",
        body: JSON.stringify({ status: "REVIEWED", internalNotes: "a".repeat(4001) }),
      },
    );
    expect((await PATCH(longNotesReq, makeContext())).status).toBe(422);

    const forbiddenReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "REVIEWED",
          internalNotes: "Legacy note PS-DEMO-123 from FIXXER",
        }),
      },
    );
    const forbiddenRes = await PATCH(forbiddenReq, makeContext());
    expect(forbiddenRes.status).toBe(422);
    const forbiddenBody = (await forbiddenRes.json()) as { code?: string };
    expect(forbiddenBody.code).toBe("FORBIDDEN_CONTENT");
  });

  it("returns 404 when lead is missing or P2025 is thrown, and 400 on P2003", async () => {
    mockState.prisma.lead.findUnique.mockResolvedValueOnce(null);
    const missingReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/missing",
      { method: "PATCH", body: JSON.stringify({ status: "REVIEWED" }) },
    );
    expect((await PATCH(missingReq, makeContext("missing"))).status).toBe(404);

    mockState.prisma.lead.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: "P2025",
        clientVersion: "6.0.0",
      }),
    );
    const p2025Req = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      { method: "PATCH", body: JSON.stringify({ status: "REVIEWED" }) },
    );
    expect((await PATCH(p2025Req, makeContext())).status).toBe(404);

    mockState.prisma.lead.update.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("Foreign key failed", {
        code: "P2003",
        clientVersion: "6.0.0",
      }),
    );
    const p2003Req = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      {
        method: "PATCH",
        body: JSON.stringify({
          status: "REVIEWED",
          assignedToId: "non-existent-admin",
        }),
      },
    );
    expect((await PATCH(p2003Req, makeContext())).status).toBe(400);
  });

  it("enforces conditional leads:assign only when assignedToId changes", async () => {
    const assertSpy = vi
      .spyOn(rbac, "assertPermission")
      .mockImplementation((_role, perm) => {
        if (perm === "leads:assign") {
          throw new AuthorizationError();
        }
      });

    // Status update without assignedToId succeeds without leads:assign
    const noAssignReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      {
        method: "PATCH",
        body: JSON.stringify({ status: "REVIEWED", internalNotes: "Verified" }),
      },
    );
    const okRes = await PATCH(noAssignReq, makeContext());
    expect(okRes.status).toBe(200);
    expect(assertSpy).not.toHaveBeenCalled();

    // Changing assignedToId triggers leads:assign -> 403
    const assignReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      {
        method: "PATCH",
        body: JSON.stringify({ status: "REVIEWED", assignedToId: "user-2" }),
      },
    );
    const forbiddenRes = await PATCH(assignReq, makeContext());
    expect(forbiddenRes.status).toBe(403);
    expect(assertSpy).toHaveBeenCalledWith("LEAD_MANAGER", "leads:assign");

    // Succeeds when leads:assign is allowed
    assertSpy.mockRestore();
    const validAssignReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      {
        method: "PATCH",
        body: JSON.stringify({ status: "REVIEWED", assignedToId: "user-2" }),
      },
    );
    expect((await PATCH(validAssignReq, makeContext())).status).toBe(200);
  });

  it("manages contactedAt/closedAt timestamps and records transactional AuditLog", async () => {
    // Transition to CONTACTED sets contactedAt
    const contactedReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      { method: "PATCH", body: JSON.stringify({ status: "CONTACTED" }) },
      );
    await PATCH(contactedReq, makeContext());
    expect(mockState.prisma.lead.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "CONTACTED",
          contactedAt: expect.any(Date),
        }),
      }),
    );

    // Transition to CLOSED sets closedAt and creates AuditLog
    vi.clearAllMocks();
    mockState.isDatabaseConfigured.mockReturnValue(true);
    mockState.requireAdminSession.mockResolvedValue(ADMIN_SESSION);
    mockState.prisma.lead.findUnique.mockResolvedValue(existingLead);
    mockState.prisma.lead.update.mockResolvedValue({
      ...existingLead,
      status: "CLOSED",
      assignedTo: null,
    });
    mockState.prisma.auditLog.create.mockResolvedValue({ id: "audit-2" });

    const closeReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      {
        method: "PATCH",
        headers: { "x-real-ip": "198.51.100.5" },
        body: JSON.stringify({ status: "CLOSED", internalNotes: "Resolved" }),
      },
    );
    const closeRes = await PATCH(closeReq, makeContext());
    expect(closeRes.status).toBe(200);
    expect(mockState.prisma.lead.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "CLOSED",
          closedAt: expect.any(Date),
          internalNotes: "Resolved",
        }),
      }),
    );
    expect(mockState.prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: ADMIN_SESSION.userId,
        actorEmail: ADMIN_SESSION.email,
        actorRole: ADMIN_SESSION.role,
        action: "UPDATE_LEAD_STATUS",
        entityType: "Lead",
        entityId: "lead-1",
        ipHash: expect.any(String),
        metadata: expect.objectContaining({
          publicReference: "PS-2026-AB12CD34",
          previousStatus: "NEW",
          nextStatus: "CLOSED",
          notesUpdated: true,
        }),
      }),
    });

    // Reopening from CLOSED to QUALIFIED clears closedAt
    vi.clearAllMocks();
    mockState.isDatabaseConfigured.mockReturnValue(true);
    mockState.requireAdminSession.mockResolvedValue(ADMIN_SESSION);
    mockState.prisma.lead.findUnique.mockResolvedValue({
      ...existingLead,
      status: "CLOSED",
      closedAt: new Date("2026-11-01T12:00:00.000Z"),
    });
    mockState.prisma.lead.update.mockResolvedValue({
      ...existingLead,
      status: "QUALIFIED",
      closedAt: null,
      assignedTo: null,
    });

    const reopenReq = new NextRequest(
      "http://localhost:3000/api/admin/leads/lead-1",
      { method: "PATCH", body: JSON.stringify({ status: "QUALIFIED" }) },
    );
    await PATCH(reopenReq, makeContext());
    expect(mockState.prisma.lead.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: "QUALIFIED",
          closedAt: null,
        }),
      }),
    );
  });
});

describe("sanitizeAdminRedirectPath", () => {
  it("preserves safe internal /admin paths and query strings", () => {
    expect(sanitizeAdminRedirectPath("/admin")).toBe("/admin");
    expect(sanitizeAdminRedirectPath("/admin/dashboard")).toBe(
      "/admin/dashboard",
    );
    expect(sanitizeAdminRedirectPath("/admin/leads?status=NEW&q=tax")).toBe(
      "/admin/leads?status=NEW&q=tax",
    );
    expect(sanitizeAdminRedirectPath("/admin/leads#row-1")).toBe(
      "/admin/leads#row-1",
    );
  });

  it("blocks open redirects, traversal, login loops, non-admin routes, and control chars", () => {
    expect(sanitizeAdminRedirectPath(null)).toBe("/admin/dashboard");
    expect(sanitizeAdminRedirectPath(undefined)).toBe("/admin/dashboard");
    expect(sanitizeAdminRedirectPath("")).toBe("/admin/dashboard");
    expect(sanitizeAdminRedirectPath("https://evil.com/admin")).toBe(
      "/admin/dashboard",
    );
    expect(sanitizeAdminRedirectPath("//evil.com/admin")).toBe(
      "/admin/dashboard",
    );
    expect(sanitizeAdminRedirectPath("/\\evil.com")).toBe("/admin/dashboard");
    expect(sanitizeAdminRedirectPath("/admin-evil")).toBe("/admin/dashboard");
    expect(sanitizeAdminRedirectPath("/admin/../courses")).toBe(
      "/admin/dashboard",
    );
    expect(sanitizeAdminRedirectPath("/courses")).toBe("/admin/dashboard");
    expect(sanitizeAdminRedirectPath("/api/admin/leads")).toBe(
      "/admin/dashboard",
    );
    expect(sanitizeAdminRedirectPath("javascript:alert(1)")).toBe(
      "/admin/dashboard",
    );
    expect(sanitizeAdminRedirectPath("/admin/login")).toBe("/admin/dashboard");
    expect(sanitizeAdminRedirectPath("/admin/login?next=/admin/leads")).toBe(
      "/admin/dashboard",
    );
    expect(
      sanitizeAdminRedirectPath("/admin\nLocation: https://evil.com"),
    ).toBe("/admin/dashboard");
  });
});
