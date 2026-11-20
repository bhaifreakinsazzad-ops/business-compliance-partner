import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PUBLIC_SITE_CONFIG } from "@/lib/config/site";
import * as rbac from "@/lib/security/rbac";
import type { AuthenticatedAdmin } from "@/lib/security/session";

const mockState = vi.hoisted(() => ({
  dbConfigured: true,
  admin: null as AuthenticatedAdmin | null,
}));

const mockTx = vi.hoisted(() => ({
  course: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  service: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  licensingEntry: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  siteSetting: {
    upsert: vi.fn(),
  },
  contentRevision: {
    create: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
}));

const mockPrisma = vi.hoisted(() => ({
  category: {
    findUnique: vi.fn(),
  },
  course: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
  },
  service: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
  },
  licensingEntry: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
  },
  siteSetting: {
    findUnique: vi.fn(),
  },
  contentRevision: {
    findMany: vi.fn(),
  },
  $transaction: vi.fn(
    async <T>(callback: (tx: typeof mockTx) => Promise<T>): Promise<T> =>
      callback(mockTx),
  ),
}));

const mockRevalidatePath = vi.hoisted(() => vi.fn());

vi.mock("@/lib/db/prisma", () => ({
  isDatabaseConfigured: vi.fn(() => mockState.dbConfigured),
  prisma: mockPrisma,
}));

vi.mock("@/lib/security/session", () => ({
  requireAdminSession: vi.fn(async (permission?: rbac.AdminPermission) => {
    if (!mockState.admin) {
      throw new rbac.AuthenticationError();
    }
    if (permission) {
      rbac.assertPermission(mockState.admin.role, permission);
    }
    return mockState.admin;
  }),
  getCurrentAdminSession: vi.fn(async () => mockState.admin),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

import {
  GET as getCourses,
  POST as postCourse,
} from "@/app/api/admin/courses/route";
import {
  DELETE as deleteCourse,
  GET as getCourseById,
  PATCH as patchCourse,
} from "@/app/api/admin/courses/[id]/route";
import {
  GET as getServices,
  POST as postService,
} from "@/app/api/admin/services/route";
import {
  DELETE as deleteService,
  GET as getServiceById,
  PATCH as patchService,
} from "@/app/api/admin/services/[id]/route";
import {
  GET as getLicensing,
  POST as postLicensing,
} from "@/app/api/admin/licensing/route";
import {
  DELETE as deleteLicensing,
  GET as getLicensingById,
  PATCH as patchLicensing,
} from "@/app/api/admin/licensing/[id]/route";
import {
  GET as getSettings,
  PATCH as patchSettings,
} from "@/app/api/admin/settings/route";

const ADMIN_USER: AuthenticatedAdmin = {
  sessionId: "sess-admin-1",
  userId: "user-admin-1",
  email: "admin@paperworksquad.local",
  name: "Super Admin",
  role: "ADMIN",
};

const EDITOR_USER: AuthenticatedAdmin = {
  sessionId: "sess-editor-1",
  userId: "user-editor-1",
  email: "editor@paperworksquad.local",
  name: "Content Editor",
  role: "EDITOR",
};

const LEAD_MANAGER_USER: AuthenticatedAdmin = {
  sessionId: "sess-lm-1",
  userId: "user-lm-1",
  email: "leads@paperworksquad.local",
  name: "Lead Manager",
  role: "LEAD_MANAGER",
};

function makeJsonRequest(
  url: string,
  method: string,
  body?: unknown,
  headers?: Record<string, string>,
): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": "203.0.113.10",
      ...(headers ?? {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

function makeRawRequest(url: string, method: string, rawBody: string): NextRequest {
  return new NextRequest(url, {
    method,
    headers: {
      "content-type": "application/json",
    },
    body: rawBody,
  });
}

function idContext(id: string): { params: Promise<{ id: string }> } {
  return { params: Promise.resolve({ id }) };
}

function validCoursePayload(overrides?: Record<string, unknown>) {
  return {
    slug: "income-tax-return-course",
    categoryId: "cat-courses-1",
    titleBn: "ব্যক্তিগত আয়কর রিটার্ন প্রশিক্ষণ",
    titleEn: "Personal Income Tax Return Training",
    summaryBn: "ব্যক্তিগত আয়কর রিটার্ন প্রস্তুতি ও দাখিল সংক্রান্ত ব্যবহারিক কোর্স।",
    audienceBn: "উদ্যোক্তা, চাকরিজীবী এবং হিসাবরক্ষণ আগ্রহী শিক্ষার্থী।",
    outcomes: ["আয়কর হিসাব ও রিটার্ন কাঠামো বোঝা"],
    syllabus: [
      {
        titleBn: "মডিউল ১: আয়কর মৌলিক ধারণা",
        topicsBn: ["করযোগ্য আয় নির্ধারণ", "ফর্ম পূরণের ধাপ"],
      },
    ],
    aliases: ["income tax"],
    instructorId: "",
    contentStatus: "DRAFT",
    availabilityStatus: "INTEREST_ONLY",
    featured: false,
    sortOrder: 1,
    lastVerifiedAt: "2026-11-19T12:00:00.000Z",
    ...(overrides ?? {}),
  };
}

function validServicePayload(overrides?: Record<string, unknown>) {
  return {
    slug: "vat-return-assistance",
    categoryId: "cat-services-1",
    titleBn: "ভ্যাট রিটার্ন প্রস্তুতি সহায়তা",
    summaryBn: "ব্যবসায়িক প্রতিষ্ঠানের মাসিক ভ্যাট রিটার্ন প্রস্তুতিতে পেশাদার সহায়তা।",
    whoNeedsItBn: "নিবন্ধিত ব্যবসায়িক প্রতিষ্ঠান ও এসএমই উদ্যোক্তা।",
    assistanceScopeBn: "প্রয়োজনীয় হিসাবপত্র যাচাই ও রিটার্ন প্রস্তুতিতে সহায়তা।",
    limitationsBn: "সরকারি পোর্টালের চূড়ান্ত অনুমোদন ও কর পরিশোধ ক্লায়েন্টের দায়িত্ব।",
    documentsSummary: ["বিআইএন সনদ", "বিক্রয় ও ক্রয় খতিয়ান"],
    processSteps: [
      {
        stepNumber: 1,
        titleBn: "নথি পর্যালোচনা",
        descriptionBn: "প্রাথমিক ব্যবসায়িক নথি ও লেনদেনের তথ্য যাচাই।",
      },
    ],
    officialSourceUrl: "",
    requiresSpecialist: true,
    contentStatus: "DRAFT",
    availabilityStatus: "INTEREST_ONLY",
    sortOrder: 2,
    lastVerifiedAt: "2026-11-19T12:00:00.000Z",
    ...(overrides ?? {}),
  };
}

function validLicensingPayload(overrides?: Record<string, unknown>) {
  return {
    slug: "trade-license-dhaka-guide",
    categoryId: "cat-licensing-1",
    titleBn: "ট্রেড লাইসেন্স আবেদন সহায়তা",
    summaryBn: "সিটি কর্পোরেশন ট্রেড লাইসেন্সের জন্য নথি ও ধাপ সংক্রান্ত পূর্ণাঙ্গ নির্দেশনা।",
    authorityName: "ঢাকা উত্তর সিটি কর্পোরেশন",
    authorityType: "সিটি কর্পোরেশন",
    officialSourceLabel: "DNCC অফিসিয়াল পোর্টাল",
    officialSourceUrl: "",
    serviceScopeBn: "আবেদনপত্র প্রস্তুতি ও প্রয়োজনীয় নথিপত্রের তালিকা যাচাই সহায়তা।",
    limitationsBn: "লাইসেন্স ইস্যু ও পরিদর্শন সম্পূর্ণভাবে সিটি কর্পোরেশনের এখতিয়ারভুক্ত।",
    documentsSummary: ["ভাড়ার চুক্তিপত্র", "জাতীয় পরিচয়পত্রের কপি"],
    processSummaryBn: "অনলাইন আবেদন দাখিল, নথি যাচাই এবং নির্ধারিত সরকারি ফি পরিশোধ।",
    contentStatus: "DRAFT",
    availabilityStatus: "INTEREST_ONLY",
    sortOrder: 3,
    lastVerifiedAt: "2026-11-19T12:00:00.000Z",
    ...(overrides ?? {}),
  };
}

function makePrismaKnownError(code: string): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError(`Prisma error ${code}`, {
    code,
    clientVersion: "6.16.0",
  });
}

describe("Admin Content & Settings API routes (/api/admin/{courses,services,licensing,settings})", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    mockState.dbConfigured = true;
    mockState.admin = EDITOR_USER;

    mockPrisma.category.findUnique.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        if (where.id.startsWith("cat-courses")) {
          return { id: where.id, pillar: "COURSES" };
        }
        if (where.id.startsWith("cat-services")) {
          return { id: where.id, pillar: "SERVICES" };
        }
        if (where.id.startsWith("cat-licensing")) {
          return { id: where.id, pillar: "LICENSING" };
        }
        return null;
      },
    );

    mockPrisma.course.findMany.mockResolvedValue([]);
    mockPrisma.course.count.mockResolvedValue(0);
    mockPrisma.service.findMany.mockResolvedValue([]);
    mockPrisma.service.count.mockResolvedValue(0);
    mockPrisma.licensingEntry.findMany.mockResolvedValue([]);
    mockPrisma.licensingEntry.count.mockResolvedValue(0);
    mockPrisma.contentRevision.findMany.mockResolvedValue([]);
  });

  describe("Authentication (401) and RBAC (403)", () => {
    it("returns 401 when unauthenticated across all endpoints", async () => {
      mockState.admin = null;

      const responses = await Promise.all([
        getCourses(makeJsonRequest("http://localhost/api/admin/courses", "GET")),
        postCourse(
          makeJsonRequest(
            "http://localhost/api/admin/courses",
            "POST",
            validCoursePayload(),
          ),
        ),
        getCourseById(
          makeJsonRequest("http://localhost/api/admin/courses/c1", "GET"),
          idContext("c1"),
        ),
        patchCourse(
          makeJsonRequest("http://localhost/api/admin/courses/c1", "PATCH", {
            titleBn: "নতুন শিরোনাম",
          }),
          idContext("c1"),
        ),
        deleteCourse(
          makeJsonRequest("http://localhost/api/admin/courses/c1", "DELETE"),
          idContext("c1"),
        ),
        getServices(makeJsonRequest("http://localhost/api/admin/services", "GET")),
        postService(
          makeJsonRequest(
            "http://localhost/api/admin/services",
            "POST",
            validServicePayload(),
          ),
        ),
        getServiceById(
          makeJsonRequest("http://localhost/api/admin/services/s1", "GET"),
          idContext("s1"),
        ),
        patchService(
          makeJsonRequest("http://localhost/api/admin/services/s1", "PATCH", {
            titleBn: "নতুন সেবা",
          }),
          idContext("s1"),
        ),
        deleteService(
          makeJsonRequest("http://localhost/api/admin/services/s1", "DELETE"),
          idContext("s1"),
        ),
        getLicensing(
          makeJsonRequest("http://localhost/api/admin/licensing", "GET"),
        ),
        postLicensing(
          makeJsonRequest(
            "http://localhost/api/admin/licensing",
            "POST",
            validLicensingPayload(),
          ),
        ),
        getLicensingById(
          makeJsonRequest("http://localhost/api/admin/licensing/l1", "GET"),
          idContext("l1"),
        ),
        patchLicensing(
          makeJsonRequest("http://localhost/api/admin/licensing/l1", "PATCH", {
            titleBn: "নতুন লাইসেন্স",
          }),
          idContext("l1"),
        ),
        deleteLicensing(
          makeJsonRequest("http://localhost/api/admin/licensing/l1", "DELETE"),
          idContext("l1"),
        ),
        getSettings(),
        patchSettings(
          makeJsonRequest("http://localhost/api/admin/settings", "PATCH", {
            brandName: "Paperwork Squad",
          }),
        ),
      ]);

      for (const res of responses) {
        expect(res.status).toBe(401);
        const json = (await res.json()) as { success: boolean; code: string };
        expect(json.success).toBe(false);
        expect(json.code).toBe("UNAUTHENTICATED");
      }

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("returns 403 for LEAD_MANAGER across all content and settings endpoints", async () => {
      mockState.admin = LEAD_MANAGER_USER;

      const responses = await Promise.all([
        getCourses(makeJsonRequest("http://localhost/api/admin/courses", "GET")),
        postCourse(
          makeJsonRequest(
            "http://localhost/api/admin/courses",
            "POST",
            validCoursePayload(),
          ),
        ),
        getCourseById(
          makeJsonRequest("http://localhost/api/admin/courses/c1", "GET"),
          idContext("c1"),
        ),
        patchCourse(
          makeJsonRequest("http://localhost/api/admin/courses/c1", "PATCH", {
            titleBn: "নতুন শিরোনাম",
          }),
          idContext("c1"),
        ),
        deleteCourse(
          makeJsonRequest("http://localhost/api/admin/courses/c1", "DELETE"),
          idContext("c1"),
        ),
        getServices(makeJsonRequest("http://localhost/api/admin/services", "GET")),
        postService(
          makeJsonRequest(
            "http://localhost/api/admin/services",
            "POST",
            validServicePayload(),
          ),
        ),
        getServiceById(
          makeJsonRequest("http://localhost/api/admin/services/s1", "GET"),
          idContext("s1"),
        ),
        patchService(
          makeJsonRequest("http://localhost/api/admin/services/s1", "PATCH", {
            titleBn: "নতুন সেবা",
          }),
          idContext("s1"),
        ),
        deleteService(
          makeJsonRequest("http://localhost/api/admin/services/s1", "DELETE"),
          idContext("s1"),
        ),
        getLicensing(
          makeJsonRequest("http://localhost/api/admin/licensing", "GET"),
        ),
        postLicensing(
          makeJsonRequest(
            "http://localhost/api/admin/licensing",
            "POST",
            validLicensingPayload(),
          ),
        ),
        getLicensingById(
          makeJsonRequest("http://localhost/api/admin/licensing/l1", "GET"),
          idContext("l1"),
        ),
        patchLicensing(
          makeJsonRequest("http://localhost/api/admin/licensing/l1", "PATCH", {
            titleBn: "নতুন লাইসেন্স",
          }),
          idContext("l1"),
        ),
        deleteLicensing(
          makeJsonRequest("http://localhost/api/admin/licensing/l1", "DELETE"),
          idContext("l1"),
        ),
        getSettings(),
        patchSettings(
          makeJsonRequest("http://localhost/api/admin/settings", "PATCH", {
            brandName: "Paperwork Squad",
          }),
        ),
      ]);

      for (const res of responses) {
        expect(res.status).toBe(403);
        const json = (await res.json()) as { success: boolean; code: string };
        expect(json.success).toBe(false);
        expect(json.code).toBe("FORBIDDEN");
      }

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("returns 403 when EDITOR accesses GET or PATCH /api/admin/settings", async () => {
      mockState.admin = EDITOR_USER;

      const getRes = await getSettings();
      const patchRes = await patchSettings(
        makeJsonRequest("http://localhost/api/admin/settings", "PATCH", {
          brandName: "Paperwork Squad",
        }),
      );

      expect(getRes.status).toBe(403);
      expect(patchRes.status).toBe(403);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("enforces content:publish permission when creating, updating, or deleting PUBLISHED content", async () => {
      mockState.admin = EDITOR_USER;
      const assertSpy = vi.spyOn(rbac, "assertPermission");

      // Creating a DRAFT does not require content:publish
      mockTx.course.create.mockResolvedValueOnce({
        id: "c-draft",
        slug: "income-tax-return-course",
        contentStatus: "DRAFT",
        availabilityStatus: "INTEREST_ONLY",
      });
      const draftRes = await postCourse(
        makeJsonRequest(
          "http://localhost/api/admin/courses",
          "POST",
          validCoursePayload({ contentStatus: "DRAFT" }),
        ),
      );
      expect(draftRes.status).toBe(201);
      expect(assertSpy).not.toHaveBeenCalledWith("EDITOR", "content:publish");

      // Creating PUBLISHED checks content:publish and fails with 403 if permission denied
      assertSpy.mockImplementation((role, perm) => {
        if (perm === "content:publish") {
          throw new rbac.AuthorizationError();
        }
        if (!rbac.hasPermission(role, perm)) {
          throw new rbac.AuthorizationError();
        }
      });

      const pubCreateCourse = await postCourse(
        makeJsonRequest(
          "http://localhost/api/admin/courses",
          "POST",
          validCoursePayload({ contentStatus: "PUBLISHED" }),
        ),
      );
      expect(pubCreateCourse.status).toBe(403);
      expect(assertSpy).toHaveBeenCalledWith("EDITOR", "content:publish");

      const pubCreateService = await postService(
        makeJsonRequest(
          "http://localhost/api/admin/services",
          "POST",
          validServicePayload({ contentStatus: "PUBLISHED" }),
        ),
      );
      expect(pubCreateService.status).toBe(403);

      const pubCreateLicensing = await postLicensing(
        makeJsonRequest(
          "http://localhost/api/admin/licensing",
          "POST",
          validLicensingPayload({ contentStatus: "PUBLISHED" }),
        ),
      );
      expect(pubCreateLicensing.status).toBe(403);

      // Transitioning DRAFT -> PUBLISHED without content:publish returns 403
      mockPrisma.course.findUnique.mockResolvedValueOnce({
        id: "c-draft-to-pub",
        slug: "draft-to-pub",
        contentStatus: "DRAFT",
      });
      const draftToPubPatch = await patchCourse(
        makeJsonRequest(
          "http://localhost/api/admin/courses/c-draft-to-pub",
          "PATCH",
          { contentStatus: "PUBLISHED" },
        ),
        idContext("c-draft-to-pub"),
      );
      expect(draftToPubPatch.status).toBe(403);

      // Updating existing PUBLISHED course without content:publish returns 403
      mockPrisma.course.findUnique.mockResolvedValueOnce({
        id: "c-pub",
        slug: "existing-pub",
        contentStatus: "PUBLISHED",
      });
      const pubPatchCourse = await patchCourse(
        makeJsonRequest("http://localhost/api/admin/courses/c-pub", "PATCH", {
          titleBn: "আপডেটেড শিরোনাম",
        }),
        idContext("c-pub"),
      );
      expect(pubPatchCourse.status).toBe(403);

      // Deleting existing PUBLISHED service without content:publish returns 403
      mockPrisma.service.findUnique.mockResolvedValueOnce({
        id: "s-pub",
        slug: "existing-pub-service",
        contentStatus: "PUBLISHED",
      });
      const pubDeleteService = await deleteService(
        makeJsonRequest("http://localhost/api/admin/services/s-pub", "DELETE"),
        idContext("s-pub"),
      );
      expect(pubDeleteService.status).toBe(403);

      // Deleting DRAFT licensing entry succeeds even without content:publish
      mockPrisma.licensingEntry.findUnique.mockResolvedValueOnce({
        id: "l-draft",
        slug: "draft-license",
        contentStatus: "DRAFT",
      });
      mockTx.licensingEntry.delete.mockResolvedValueOnce({ id: "l-draft" });
      const draftDeleteLicensing = await deleteLicensing(
        makeJsonRequest(
          "http://localhost/api/admin/licensing/l-draft",
          "DELETE",
        ),
        idContext("l-draft"),
      );
      expect(draftDeleteLicensing.status).toBe(200);
    });
  });

  describe("Content Governance (findForbiddenContentMatch)", () => {
    it("rejects forbidden strings in top-level and nested arrays/objects across all 4 endpoints", async () => {
      mockState.admin = ADMIN_USER;

      const badCourse = await postCourse(
        makeJsonRequest(
          "http://localhost/api/admin/courses",
          "POST",
          validCoursePayload({
            syllabus: [
              {
                titleBn: "মডিউল ১",
                topicsBn: ["Fixxer Academy legacy syllabus"],
              },
            ],
          }),
        ),
      );
      expect(badCourse.status).toBe(422);
      expect(((await badCourse.json()) as { code: string }).code).toBe(
        "FORBIDDEN_CONTENT",
      );

      const badService = await postService(
        makeJsonRequest(
          "http://localhost/api/admin/services",
          "POST",
          validServicePayload({
            processSteps: [
              {
                stepNumber: 1,
                titleBn: "ধাপ ১",
                descriptionBn: "Send via LeadConnector webhook",
              },
            ],
          }),
        ),
      );
      expect(badService.status).toBe(422);
      expect(((await badService.json()) as { code: string }).code).toBe(
        "FORBIDDEN_CONTENT",
      );

      const badLicensing = await patchLicensing(
        makeJsonRequest("http://localhost/api/admin/licensing/l1", "PATCH", {
          documentsSummary: ["PS-DEMO-99 sample document"],
        }),
        idContext("l1"),
      );
      expect(badLicensing.status).toBe(422);
      expect(((await badLicensing.json()) as { code: string }).code).toBe(
        "FORBIDDEN_CONTENT",
      );

      const badSettings = await patchSettings(
        makeJsonRequest("http://localhost/api/admin/settings", "PATCH", {
          verifiedEmail: "contact@example.com",
        }),
      );
      expect(badSettings.status).toBe(422);
      expect(((await badSettings.json()) as { code: string }).code).toBe(
        "FORBIDDEN_CONTENT",
      );

      const badSettingsPhone = await patchSettings(
        makeJsonRequest("http://localhost/api/admin/settings", "PATCH", {
          verifiedPhone: "01XXX-XXXXXX",
        }),
      );
      expect(badSettingsPhone.status).toBe(422);
      expect(((await badSettingsPhone.json()) as { code: string }).code).toBe(
        "FORBIDDEN_CONTENT",
      );

      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("Validation (422) and Malformed JSON (400)", () => {
    it("returns 400 INVALID_JSON for malformed JSON bodies", async () => {
      mockState.admin = ADMIN_USER;

      const responses = await Promise.all([
        postCourse(
          makeRawRequest("http://localhost/api/admin/courses", "POST", "{bad"),
        ),
        patchCourse(
          makeRawRequest(
            "http://localhost/api/admin/courses/c1",
            "PATCH",
            "{bad",
          ),
          idContext("c1"),
        ),
        postService(
          makeRawRequest("http://localhost/api/admin/services", "POST", "{bad"),
        ),
        postLicensing(
          makeRawRequest(
            "http://localhost/api/admin/licensing",
            "POST",
            "{bad",
          ),
        ),
        patchSettings(
          makeRawRequest(
            "http://localhost/api/admin/settings",
            "PATCH",
            "{bad",
          ),
        ),
      ]);

      for (const res of responses) {
        expect(res.status).toBe(400);
        const json = (await res.json()) as { success: boolean; code: string };
        expect(json.success).toBe(false);
        expect(json.code).toBe("INVALID_JSON");
      }
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it("returns 422 VALIDATION_ERROR with flatten details on invalid Zod payloads and empty PATCH", async () => {
      mockState.admin = ADMIN_USER;

      const badCourse = await postCourse(
        makeJsonRequest(
          "http://localhost/api/admin/courses",
          "POST",
          validCoursePayload({
            slug: "Invalid Slug With Spaces!",
            outcomes: [],
          }),
        ),
      );
      expect(badCourse.status).toBe(422);
      const courseJson = (await badCourse.json()) as {
        code: string;
        details: { fieldErrors: Record<string, string[]> };
      };
      expect(courseJson.code).toBe("VALIDATION_ERROR");
      expect(courseJson.details.fieldErrors.slug).toBeDefined();
      expect(courseJson.details.fieldErrors.outcomes).toBeDefined();

      const badService = await postService(
        makeJsonRequest(
          "http://localhost/api/admin/services",
          "POST",
          validServicePayload({
            officialSourceUrl: "not-a-url",
            processSteps: [],
          }),
        ),
      );
      expect(badService.status).toBe(422);

      const badLicensing = await postLicensing(
        makeJsonRequest(
          "http://localhost/api/admin/licensing",
          "POST",
          validLicensingPayload({
            titleBn: "ক",
            documentsSummary: [],
          }),
        ),
      );
      expect(badLicensing.status).toBe(422);

      const badSettings = await patchSettings(
        makeJsonRequest("http://localhost/api/admin/settings", "PATCH", {
          verifiedEmail: "not-an-email",
          leadRetentionDays: 5,
        }),
      );
      expect(badSettings.status).toBe(422);

      const emptyPatch = await patchCourse(
        makeJsonRequest("http://localhost/api/admin/courses/c1", "PATCH", {}),
        idContext("c1"),
      );
      expect(emptyPatch.status).toBe(422);

      const emptySettingsPatch = await patchSettings(
        makeJsonRequest("http://localhost/api/admin/settings", "PATCH", {}),
      );
      expect(emptySettingsPatch.status).toBe(422);
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });
  });

  describe("Database Unavailable (503) & Settings Default Fallback", () => {
    it("returns 503 on content endpoints and settings PATCH when DB is unconfigured, while GET settings falls back to defaults", async () => {
      mockState.admin = ADMIN_USER;
      mockState.dbConfigured = false;

      const unavailable = await Promise.all([
        getCourses(makeJsonRequest("http://localhost/api/admin/courses", "GET")),
        postCourse(
          makeJsonRequest(
            "http://localhost/api/admin/courses",
            "POST",
            validCoursePayload(),
          ),
        ),
        getServices(makeJsonRequest("http://localhost/api/admin/services", "GET")),
        postLicensing(
          makeJsonRequest(
            "http://localhost/api/admin/licensing",
            "POST",
            validLicensingPayload(),
          ),
        ),
        patchSettings(
          makeJsonRequest("http://localhost/api/admin/settings", "PATCH", {
            brandName: "Paperwork Squad",
          }),
        ),
      ]);

      for (const res of unavailable) {
        expect(res.status).toBe(503);
        const json = (await res.json()) as { code: string };
        expect(json.code).toBe("DATABASE_UNAVAILABLE");
      }

      const settingsRes = await getSettings();
      expect(settingsRes.status).toBe(200);
      const settingsJson = (await settingsRes.json()) as {
        success: boolean;
        data: Record<string, unknown>;
        meta: { source: string; databaseConnected: boolean };
      };
      expect(settingsJson.success).toBe(true);
      expect(settingsJson.data.brandName).toBe(
        DEFAULT_PUBLIC_SITE_CONFIG.brandName,
      );
      expect(settingsJson.data.leadRetentionDays).toBe(365);
      expect(settingsJson.meta).toEqual({
        source: "default",
        databaseConnected: false,
      });
    });
  });

  describe("CRUD, Transactional Revisions/Audit, Revalidation & Normalization", () => {
    it("orders GET /api/admin/courses by featured desc and sortOrder asc (never orderIndex)", async () => {
      mockState.admin = EDITOR_USER;
      mockPrisma.course.findMany.mockResolvedValueOnce([
        { id: "c1", slug: "course-1", sortOrder: 1 },
      ]);
      mockPrisma.course.count.mockResolvedValueOnce(1);

      const res = await getCourses(
        makeJsonRequest(
          "http://localhost/api/admin/courses?status=PUBLISHED&availability=ACTIVE&categoryId=cat-courses-1&q=tax&page=abc&limit=500",
          "GET",
        ),
      );
      expect(res.status).toBe(200);
      const json = (await res.json()) as {
        success: boolean;
        data: unknown[];
        meta: { page: number; limit: number; total: number; totalPages: number };
      };
      expect(json.success).toBe(true);
      expect(json.meta).toEqual({ page: 1, limit: 100, total: 1, totalPages: 1 });

      const findManyArgs = mockPrisma.course.findMany.mock.calls[0]?.[0] as {
        orderBy: Array<Record<string, string>>;
      };
      expect(findManyArgs.orderBy).toEqual([
        { featured: "desc" },
        { sortOrder: "asc" },
      ]);
      expect(JSON.stringify(findManyArgs)).not.toContain("orderIndex");
    });

    it("creates Course in transaction with normalized null/Date, ContentRevision, AuditLog, and revalidatePath", async () => {
      mockState.admin = EDITOR_USER;
      const createdRow = {
        id: "course-new-1",
        ...validCoursePayload(),
        instructorId: null,
        contentStatus: "PUBLISHED",
        lastVerifiedAt: new Date("2026-11-19T12:00:00.000Z"),
      };
      mockTx.course.create.mockResolvedValueOnce(createdRow);

      const res = await postCourse(
        makeJsonRequest(
          "http://localhost/api/admin/courses",
          "POST",
          validCoursePayload({ contentStatus: "PUBLISHED", instructorId: "" }),
        ),
      );

      expect(res.status).toBe(201);
      expect(mockPrisma.$transaction).toHaveBeenCalledTimes(1);

      const createArg = mockTx.course.create.mock.calls[0]?.[0] as {
        data: { instructorId: unknown; lastVerifiedAt: unknown };
      };
      expect(createArg.data.instructorId).toBeNull();
      expect(createArg.data.lastVerifiedAt).toBeInstanceOf(Date);

      expect(mockTx.contentRevision.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          entityType: "Course",
          entityId: "course-new-1",
          action: "PUBLISH",
          actorId: EDITOR_USER.userId,
        }),
      });
      expect(mockTx.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          actorId: EDITOR_USER.userId,
          actorEmail: EDITOR_USER.email,
          actorRole: EDITOR_USER.role,
          action: "PUBLISH_COURSE",
          entityType: "Course",
          entityId: "course-new-1",
        }),
      });

      expect(mockRevalidatePath).toHaveBeenCalledWith("/");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/courses");
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/courses/income-tax-return-course",
      );
      expect(mockRevalidatePath).toHaveBeenCalledWith("/sitemap.xml");
    });

    it("creates, updates (old + new slug revalidation), and deletes Service with empty-string -> null and ContentRevision + AuditLog", async () => {
      mockState.admin = ADMIN_USER;

      const createdService = {
        id: "svc-1",
        ...validServicePayload(),
        officialSourceUrl: null,
        lastVerifiedAt: new Date("2026-11-19T12:00:00.000Z"),
      };
      mockTx.service.create.mockResolvedValueOnce(createdService);

      const createRes = await postService(
        makeJsonRequest(
          "http://localhost/api/admin/services",
          "POST",
          validServicePayload(),
        ),
      );
      expect(createRes.status).toBe(201);
      const svcCreateArg = mockTx.service.create.mock.calls[0]?.[0] as {
        data: { officialSourceUrl: unknown; lastVerifiedAt: unknown };
      };
      expect(svcCreateArg.data.officialSourceUrl).toBeNull();
      expect(svcCreateArg.data.lastVerifiedAt).toBeInstanceOf(Date);

      mockPrisma.service.findUnique.mockResolvedValueOnce(createdService);
      const updatedService = {
        ...createdService,
        slug: "vat-return-pro-assistance",
        contentStatus: "PUBLISHED",
      };
      mockTx.service.update.mockResolvedValueOnce(updatedService);

      const patchRes = await patchService(
        makeJsonRequest("http://localhost/api/admin/services/svc-1", "PATCH", {
          slug: "vat-return-pro-assistance",
          contentStatus: "PUBLISHED",
        }),
        idContext("svc-1"),
      );
      expect(patchRes.status).toBe(200);
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/services/vat-return-assistance",
      );
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/services/vat-return-pro-assistance",
      );

      mockPrisma.service.findUnique.mockResolvedValueOnce(updatedService);
      mockTx.service.delete.mockResolvedValueOnce(updatedService);
      const delRes = await deleteService(
        makeJsonRequest("http://localhost/api/admin/services/svc-1", "DELETE"),
        idContext("svc-1"),
      );
      expect(delRes.status).toBe(200);
      expect(mockTx.contentRevision.create).toHaveBeenLastCalledWith({
        data: expect.objectContaining({
          entityType: "Service",
          entityId: "svc-1",
          action: "DELETE",
        }),
      });
    });

    it("supports Licensing CRUD, GET [id] with revisions, and transactional Settings PATCH", async () => {
      mockState.admin = ADMIN_USER;

      const createdEntry = {
        id: "lic-1",
        ...validLicensingPayload(),
        officialSourceUrl: null,
        lastVerifiedAt: new Date("2026-11-19T12:00:00.000Z"),
      };
      mockTx.licensingEntry.create.mockResolvedValueOnce(createdEntry);

      const createRes = await postLicensing(
        makeJsonRequest(
          "http://localhost/api/admin/licensing",
          "POST",
          validLicensingPayload(),
        ),
      );
      expect(createRes.status).toBe(201);
      expect(mockRevalidatePath).toHaveBeenCalledWith("/licensing");
      expect(mockRevalidatePath).toHaveBeenCalledWith(
        "/licensing/trade-license-dhaka-guide",
      );

      mockPrisma.licensingEntry.findUnique.mockResolvedValueOnce(createdEntry);
      mockPrisma.contentRevision.findMany.mockResolvedValueOnce([
        { id: "rev-1", action: "CREATE" },
      ]);
      const getByIdRes = await getLicensingById(
        makeJsonRequest("http://localhost/api/admin/licensing/lic-1", "GET"),
        idContext("lic-1"),
      );
      expect(getByIdRes.status).toBe(200);
      const getByIdJson = (await getByIdRes.json()) as {
        success: boolean;
        data: { id: string; revisions: unknown[] };
      };
      expect(getByIdJson.data.id).toBe("lic-1");
      expect(getByIdJson.data.revisions).toHaveLength(1);

      const updatedSettings = {
        id: "default",
        ...DEFAULT_PUBLIC_SITE_CONFIG,
        verifiedEmail: null,
        facebookUrl: null,
        updatedBy: ADMIN_USER.email,
      };
      mockTx.siteSetting.upsert.mockResolvedValueOnce(updatedSettings);

      const patchSettingsRes = await patchSettings(
        makeJsonRequest("http://localhost/api/admin/settings", "PATCH", {
          verifiedEmail: "",
          facebookUrl: "",
          leadRetentionDays: 180,
        }),
      );
      expect(patchSettingsRes.status).toBe(200);
      const upsertArg = mockTx.siteSetting.upsert.mock.calls[0]?.[0] as {
        update: { verifiedEmail: unknown; facebookUrl: unknown };
      };
      expect(upsertArg.update.verifiedEmail).toBeNull();
      expect(upsertArg.update.facebookUrl).toBeNull();
      expect(mockTx.auditLog.create).toHaveBeenLastCalledWith({
        data: expect.objectContaining({
          action: "UPDATE_SITE_SETTINGS",
          entityType: "SiteSetting",
          entityId: "default",
        }),
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith("/", "layout");
    });
  });

  describe("Prisma Error Edge Cases (404, 409, 400)", () => {
    it("returns 404 for missing records and Prisma P2025, 409 for P2002, and 400 for P2003 / wrong pillar category", async () => {
      mockState.admin = ADMIN_USER;

      mockPrisma.course.findUnique.mockResolvedValueOnce(null);
      const missingCourseRes = await getCourseById(
        makeJsonRequest("http://localhost/api/admin/courses/missing", "GET"),
        idContext("missing"),
      );
      expect(missingCourseRes.status).toBe(404);

      mockPrisma.service.findUnique.mockResolvedValueOnce(null);
      const missingServiceDelete = await deleteService(
        makeJsonRequest("http://localhost/api/admin/services/missing", "DELETE"),
        idContext("missing"),
      );
      expect(missingServiceDelete.status).toBe(404);

      // P2025 inside transaction
      mockPrisma.licensingEntry.findUnique.mockResolvedValueOnce({
        id: "lic-gone",
        slug: "gone",
        contentStatus: "DRAFT",
      });
      mockTx.licensingEntry.update.mockRejectedValueOnce(
        makePrismaKnownError("P2025"),
      );
      const p2025Res = await patchLicensing(
        makeJsonRequest("http://localhost/api/admin/licensing/lic-gone", "PATCH", {
          titleBn: "নতুন শিরোনাম",
        }),
        idContext("lic-gone"),
      );
      expect(p2025Res.status).toBe(404);

      // P2002 duplicate slug -> 409
      mockTx.course.create.mockRejectedValueOnce(makePrismaKnownError("P2002"));
      const duplicateSlugRes = await postCourse(
        makeJsonRequest(
          "http://localhost/api/admin/courses",
          "POST",
          validCoursePayload(),
        ),
      );
      expect(duplicateSlugRes.status).toBe(409);
      expect(((await duplicateSlugRes.json()) as { code: string }).code).toBe(
        "CONFLICT",
      );

      // P2003 invalid FK -> 400
      mockTx.course.create.mockRejectedValueOnce(makePrismaKnownError("P2003"));
      const fkRes = await postCourse(
        makeJsonRequest(
          "http://localhost/api/admin/courses",
          "POST",
          validCoursePayload({ instructorId: "missing-instructor" }),
        ),
      );
      expect(fkRes.status).toBe(400);
      expect(((await fkRes.json()) as { code: string }).code).toBe(
        "INVALID_REFERENCE",
      );

      // Category belonging to wrong pillar -> 400
      const wrongPillarRes = await postCourse(
        makeJsonRequest(
          "http://localhost/api/admin/courses",
          "POST",
          validCoursePayload({ categoryId: "cat-services-1" }),
        ),
      );
      expect(wrongPillarRes.status).toBe(400);
      expect(((await wrongPillarRes.json()) as { code: string }).code).toBe(
        "INVALID_REFERENCE",
      );
    });
  });
});
