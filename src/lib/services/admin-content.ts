import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma, type ContentStatus, type PillarType } from "@prisma/client";
import type { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { hashClientIp } from "@/lib/security/password";
import { readJsonBody, RequestBodyError } from "@/lib/security/request-body";
import {
  assertPermission,
  AuthenticationError,
  AuthorizationError,
} from "@/lib/security/rbac";
import type { AuthenticatedAdmin } from "@/lib/security/session";
import {
  AVAILABILITY_STATUS_ENUM,
  CONTENT_STATUS_ENUM,
  findForbiddenContentMatch,
} from "@/lib/validation/content";

export type ContentEntityType = "Course" | "Service" | "LicensingEntry";
export type AuditableEntityType = ContentEntityType | "Faq" | "SiteSetting";
export type RevisionAction = "CREATE" | "UPDATE" | "PUBLISH" | "DELETE";

export class AdminApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "AdminApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class BadRequestError extends AdminApiError {
  constructor(message = "অবৈধ রিকোয়েস্ট।", code = "BAD_REQUEST") {
    super(400, code, message);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends AdminApiError {
  constructor(message = "তথ্যটি খুঁজে পাওয়া যায়নি।", code = "NOT_FOUND") {
    super(404, code, message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AdminApiError {
  constructor(
    message = "এই স্লাগ (slug) ইতিমধ্যে ব্যবহৃত হয়েছে।",
    code = "CONFLICT",
  ) {
    super(409, code, message);
    this.name = "ConflictError";
  }
}

export class UnprocessableEntityError extends AdminApiError {
  constructor(
    message = "তথ্য যাচাইকরণে ত্রুটি রয়েছে।",
    code = "VALIDATION_ERROR",
    details?: unknown,
  ) {
    super(422, code, message, details);
    this.name = "UnprocessableEntityError";
  }
}

export class ServiceUnavailableError extends AdminApiError {
  constructor(
    message = "ডাটাবেজ সংযুক্ত নেই।",
    code = "DATABASE_UNAVAILABLE",
  ) {
    super(503, code, message);
    this.name = "ServiceUnavailableError";
  }
}

export function requireDbConfigured(): void {
  if (!isDatabaseConfigured()) {
    throw new ServiceUnavailableError();
  }
}

export async function parseJsonBody(request: NextRequest): Promise<unknown> {
  try {
    return await readJsonBody(request, 256 * 1024);
  } catch (error) {
    if (error instanceof RequestBodyError && error.code === "BODY_TOO_LARGE") {
      throw new AdminApiError(413, "BODY_TOO_LARGE", "রিকোয়েস্টের তথ্য অতিরিক্ত বড়।");
    }
    throw new BadRequestError("অবৈধ JSON রিকোয়েস্ট।", "INVALID_JSON");
  }
}

export function assertNoForbiddenContent(payload: unknown): void {
  const match = findForbiddenContentMatch(payload);
  if (match) {
    throw new UnprocessableEntityError(
      `অগ্রহণযোগ্য শব্দ পাওয়া গেছে: "${match}"। নীতিমালা অনুযায়ী পরিবর্তন করুন।`,
      "FORBIDDEN_CONTENT",
      { match },
    );
  }
}

export function validateUpsertSchema<T>(
  schema: z.ZodType<T>,
  payload: unknown,
): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new UnprocessableEntityError(
      "তথ্য যাচাইকরণে ত্রুটি রয়েছে।",
      "VALIDATION_ERROR",
      parsed.error.flatten(),
    );
  }
  return parsed.data;
}

export function validatePatchSchema<T extends Record<string, unknown>>(
  schema: z.ZodType<T>,
  payload: unknown,
): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new UnprocessableEntityError(
      "তথ্য যাচাইকরণে ত্রুটি রয়েছে।",
      "VALIDATION_ERROR",
      parsed.error.flatten(),
    );
  }
  if (Object.keys(parsed.data).length === 0) {
    throw new UnprocessableEntityError(
      "অন্তত একটি ফিল্ড আপডেট করতে হবে।",
      "VALIDATION_ERROR",
      {
        formErrors: ["অন্তত একটি ফিল্ড আপডেট করতে হবে।"],
        fieldErrors: {},
      },
    );
  }
  return parsed.data;
}

export function emptyToNull(
  value: string | null | undefined,
): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  return value;
}

export function parseOptionalDate(
  value: string | null | undefined,
): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(value);
}

export function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  const parsedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "25", 10);
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(100, Math.max(1, parsedLimit))
    : 25;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

export interface ContentListFilterParams {
  status?: z.infer<typeof CONTENT_STATUS_ENUM>;
  availability?: z.infer<typeof AVAILABILITY_STATUS_ENUM>;
  categoryId?: string;
  q?: string;
}

export function parseContentListFilters(
  searchParams: URLSearchParams,
): ContentListFilterParams {
  const rawStatus = searchParams.get("status")?.trim();
  let status: z.infer<typeof CONTENT_STATUS_ENUM> | undefined;
  if (rawStatus && rawStatus !== "ALL") {
    const parsed = CONTENT_STATUS_ENUM.safeParse(rawStatus);
    if (!parsed.success) {
      throw new UnprocessableEntityError(
        "অবৈধ কন্টেন্ট স্ট্যাটাস ফিল্টার।",
        "VALIDATION_ERROR",
      );
    }
    status = parsed.data;
  }

  const rawAvailability = searchParams.get("availability")?.trim();
  let availability: z.infer<typeof AVAILABILITY_STATUS_ENUM> | undefined;
  if (rawAvailability && rawAvailability !== "ALL") {
    const parsed = AVAILABILITY_STATUS_ENUM.safeParse(rawAvailability);
    if (!parsed.success) {
      throw new UnprocessableEntityError(
        "অবৈধ অ্যাভেইলেবিলিটি স্ট্যাটাস ফিল্টার।",
        "VALIDATION_ERROR",
      );
    }
    availability = parsed.data;
  }

  const categoryId = searchParams.get("categoryId")?.trim() || undefined;
  const q = searchParams.get("q")?.trim() || undefined;

  return {
    status,
    availability,
    categoryId,
    q,
  };
}

export function extractClientIp(request: NextRequest): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    null
  );
}

export function getAuditIpHash(request: NextRequest): string | null {
  const ip = extractClientIp(request);
  return ip ? hashClientIp(ip) : null;
}

export function assertCanTouchPublished(
  admin: AuthenticatedAdmin,
  nextStatus?: ContentStatus | string | null,
  existingStatus?: ContentStatus | string | null,
): void {
  if (nextStatus === "PUBLISHED" || existingStatus === "PUBLISHED") {
    assertPermission(admin.role, "content:publish");
  }
}

export async function assertValidCategoryForPillar(
  categoryId: string,
  expectedPillar: PillarType,
): Promise<void> {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { id: true, pillar: true },
  });
  if (!category || category.pillar !== expectedPillar) {
    throw new BadRequestError(
      "নির্বাচিত ক্যাটাগরি বা রেফারেন্স সঠিক নয়।",
      "INVALID_REFERENCE",
    );
  }
}

export interface RecordRevisionAndAuditParams {
  admin: AuthenticatedAdmin;
  entityType: AuditableEntityType;
  entityId: string;
  revisionAction: RevisionAction;
  auditAction: string;
  snapshot: unknown;
  summary: string;
  metadata?: Record<string, unknown>;
  ipHash?: string | null;
}

export async function recordRevisionAndAudit(
  tx: Prisma.TransactionClient,
  params: RecordRevisionAndAuditParams,
): Promise<void> {
  await tx.contentRevision.create({
    data: {
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.revisionAction,
      snapshot: toJsonValue(params.snapshot),
      actorId: params.admin.userId,
    },
  });

  await tx.auditLog.create({
    data: {
      actorId: params.admin.userId,
      actorEmail: params.admin.email,
      actorRole: params.admin.role,
      action: params.auditAction,
      entityType: params.entityType,
      entityId: params.entityId,
      summary: params.summary,
      metadata: params.metadata ? toJsonValue(params.metadata) : undefined,
      ipHash: params.ipHash ?? null,
    },
  });
}

function safeRevalidate(path: string, type?: "layout" | "page"): void {
  try {
    if (type) {
      revalidatePath(path, type);
    } else {
      revalidatePath(path);
    }
  } catch {
    // Revalidation throws outside Next.js request/static generation store (e.g., Vitest).
  }
}

const ENTITY_BASE_PATH: Record<ContentEntityType, string> = {
  Course: "/courses",
  Service: "/services",
  LicensingEntry: "/licensing",
};

export function revalidateContentPaths(
  entityType: ContentEntityType,
  slugs: Array<string | null | undefined>,
): void {
  const basePath = ENTITY_BASE_PATH[entityType];
  safeRevalidate("/");
  safeRevalidate(basePath);
  safeRevalidate("/sitemap.xml");

  const uniqueSlugs = new Set(
    slugs
      .map((slug) => slug?.trim())
      .filter((slug): slug is string => Boolean(slug)),
  );
  for (const slug of uniqueSlugs) {
    safeRevalidate(`${basePath}/${slug}`);
  }
}

export function revalidateSettingsPaths(): void {
  safeRevalidate("/", "layout");
  safeRevalidate("/sitemap.xml");
}

export function revalidateFaqPaths(): void {
  safeRevalidate("/faq");
  safeRevalidate("/");
}

export function handleAdminApiError(error: unknown): NextResponse {
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: "UNAUTHENTICATED",
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: "FORBIDDEN",
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof AdminApiError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
        ...(error.details !== undefined ? { details: error.details } : {}),
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          error: "এই স্লাগ (slug) ইতিমধ্যে ব্যবহৃত হয়েছে।",
          code: "CONFLICT",
        },
        { status: 409 },
      );
    }

    if (error.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          error: "নির্বাচিত ক্যাটাগরি বা রেফারেন্স সঠিক নয়।",
          code: "INVALID_REFERENCE",
        },
        { status: 400 },
      );
    }

    if (error.code === "P2025") {
      return NextResponse.json(
        {
          success: false,
          error: "তথ্যটি খুঁজে পাওয়া যায়নি।",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }
  }

  console.error("[Admin Content API Error]", error);
  return NextResponse.json(
    {
      success: false,
      error: "সার্ভারে সমস্যা হয়েছে।",
      code: "INTERNAL_ERROR",
    },
    { status: 500 },
  );
}
