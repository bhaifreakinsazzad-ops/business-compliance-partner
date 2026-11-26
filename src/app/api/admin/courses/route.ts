import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/security/session";
import {
  assertCanTouchPublished,
  assertNoForbiddenContent,
  assertValidCategoryForPillar,
  emptyToNull,
  getAuditIpHash,
  handleAdminApiError,
  parseContentListFilters,
  parseJsonBody,
  parseOptionalDate,
  parsePagination,
  recordRevisionAndAudit,
  requireDbConfigured,
  revalidateContentPaths,
  toJsonValue,
  validateUpsertSchema,
} from "@/lib/services/admin-content";
import { courseUpsertSchema } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession("content:read");
    requireDbConfigured();

    const { searchParams } = request.nextUrl;
    const filters = parseContentListFilters(searchParams);
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.CourseWhereInput = {};
    if (filters.status) {
      where.contentStatus = filters.status;
    }
    if (filters.availability) {
      where.availabilityStatus = filters.availability;
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.q) {
      where.OR = [
        { slug: { contains: filters.q, mode: "insensitive" } },
        { titleBn: { contains: filters.q, mode: "insensitive" } },
        { titleEn: { contains: filters.q, mode: "insensitive" } },
        { summaryBn: { contains: filters.q, mode: "insensitive" } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, slug: true, nameBn: true, nameEn: true },
          },
          instructor: {
            select: { id: true, nameBn: true, nameEn: true, isVerified: true },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: courses,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdminSession("content:write");
    requireDbConfigured();

    const body = await parseJsonBody(request);
    assertNoForbiddenContent(body);
    const data = validateUpsertSchema(courseUpsertSchema, body);
    assertCanTouchPublished(admin, data.contentStatus);

    await assertValidCategoryForPillar(data.categoryId, "COURSES");

    const ipHash = getAuditIpHash(request);
    const isPublishing = data.contentStatus === "PUBLISHED";

    const created = await prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          slug: data.slug,
          categoryId: data.categoryId,
          titleBn: data.titleBn,
          titleEn: emptyToNull(data.titleEn) ?? null,
          summaryBn: data.summaryBn,
          summaryEn: emptyToNull(data.summaryEn) ?? null,
          audienceBn: data.audienceBn,
          outcomes: data.outcomes,
          syllabus: toJsonValue(data.syllabus),
          aliases: data.aliases,
          deliveryMode: emptyToNull(data.deliveryMode) ?? null,
          duration: emptyToNull(data.duration) ?? null,
          feeDisplay: emptyToNull(data.feeDisplay) ?? null,
          enrollmentModel: data.enrollmentModel,
          pricePaisa: data.pricePaisa ?? null,
          instructorId: emptyToNull(data.instructorId) ?? null,
          contentStatus: data.contentStatus,
          availabilityStatus: data.availabilityStatus,
          featured: data.featured,
          sortOrder: data.sortOrder,
          seoTitle: emptyToNull(data.seoTitle) ?? null,
          seoDescription: emptyToNull(data.seoDescription) ?? null,
          verifiedBy: emptyToNull(data.verifiedBy) ?? null,
          lastVerifiedAt: parseOptionalDate(data.lastVerifiedAt) ?? null,
        },
      });

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "Course",
        entityId: course.id,
        revisionAction: isPublishing ? "PUBLISH" : "CREATE",
        auditAction: isPublishing ? "PUBLISH_COURSE" : "CREATE_COURSE",
        snapshot: course,
        summary: `${isPublishing ? "Published" : "Created"} course "${course.slug}"`,
        metadata: {
          slug: course.slug,
          contentStatus: course.contentStatus,
          availabilityStatus: course.availabilityStatus,
        },
        ipHash,
      });

      return course;
    });

    revalidateContentPaths("Course", [created.slug]);

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 },
    );
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}
