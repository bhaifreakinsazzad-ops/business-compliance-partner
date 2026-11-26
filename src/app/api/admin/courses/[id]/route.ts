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
  NotFoundError,
  parseJsonBody,
  parseOptionalDate,
  recordRevisionAndAudit,
  requireDbConfigured,
  revalidateContentPaths,
  toJsonValue,
  validatePatchSchema,
} from "@/lib/services/admin-content";
import { courseUpsertSchema } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

const coursePatchSchema = courseUpsertSchema.partial();

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession("content:read");
    requireDbConfigured();

    const { id } = await context.params;
    const includeRevisions =
      request.nextUrl.searchParams.get("includeRevisions") !== "false";

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, slug: true, nameBn: true, nameEn: true },
        },
        instructor: {
          select: { id: true, nameBn: true, nameEn: true, isVerified: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundError("কোর্সটি খুঁজে পাওয়া যায়নি।");
    }

    const revisions = includeRevisions
      ? await prisma.contentRevision.findMany({
          where: { entityType: "Course", entityId: id },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [];

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        revisions,
      },
    });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminSession("content:write");
    requireDbConfigured();

    const { id } = await context.params;
    const body = await parseJsonBody(request);
    assertNoForbiddenContent(body);
    const data = validatePatchSchema(coursePatchSchema, body);

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("কোর্সটি খুঁজে পাওয়া যায়নি।");
    }

    assertCanTouchPublished(admin, data.contentStatus, existing.contentStatus);

    if (data.categoryId !== undefined) {
      await assertValidCategoryForPillar(data.categoryId, "COURSES");
    }

    const updateData: Prisma.CourseUncheckedUpdateInput = {};
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.titleBn !== undefined) updateData.titleBn = data.titleBn;
    if (data.titleEn !== undefined) updateData.titleEn = emptyToNull(data.titleEn);
    if (data.summaryBn !== undefined) updateData.summaryBn = data.summaryBn;
    if (data.summaryEn !== undefined) {
      updateData.summaryEn = emptyToNull(data.summaryEn);
    }
    if (data.audienceBn !== undefined) updateData.audienceBn = data.audienceBn;
    if (data.outcomes !== undefined) updateData.outcomes = data.outcomes;
    if (data.syllabus !== undefined) {
      updateData.syllabus = toJsonValue(data.syllabus);
    }
    if (data.aliases !== undefined) updateData.aliases = data.aliases;
    if (data.deliveryMode !== undefined) {
      updateData.deliveryMode = emptyToNull(data.deliveryMode);
    }
    if (data.duration !== undefined) {
      updateData.duration = emptyToNull(data.duration);
    }
    if (data.feeDisplay !== undefined) {
      updateData.feeDisplay = emptyToNull(data.feeDisplay);
    }
    if (data.enrollmentModel !== undefined) {
      updateData.enrollmentModel = data.enrollmentModel;
    }
    if (data.pricePaisa !== undefined) {
      updateData.pricePaisa = data.pricePaisa;
    }
    if (data.instructorId !== undefined) {
      updateData.instructorId = emptyToNull(data.instructorId);
    }
    if (data.contentStatus !== undefined) {
      updateData.contentStatus = data.contentStatus;
    }
    if (data.availabilityStatus !== undefined) {
      updateData.availabilityStatus = data.availabilityStatus;
    }
    if (data.featured !== undefined) updateData.featured = data.featured;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.seoTitle !== undefined) {
      updateData.seoTitle = emptyToNull(data.seoTitle);
    }
    if (data.seoDescription !== undefined) {
      updateData.seoDescription = emptyToNull(data.seoDescription);
    }
    if (data.verifiedBy !== undefined) {
      updateData.verifiedBy = emptyToNull(data.verifiedBy);
    }
    if (data.lastVerifiedAt !== undefined) {
      updateData.lastVerifiedAt = parseOptionalDate(data.lastVerifiedAt);
    }

    const ipHash = getAuditIpHash(request);

    const updated = await prisma.$transaction(async (tx) => {
      const course = await tx.course.update({
        where: { id },
        data: updateData,
      });

      const isPublishing =
        course.contentStatus === "PUBLISHED" &&
        existing.contentStatus !== "PUBLISHED";

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "Course",
        entityId: course.id,
        revisionAction: isPublishing ? "PUBLISH" : "UPDATE",
        auditAction: isPublishing ? "PUBLISH_COURSE" : "UPDATE_COURSE",
        snapshot: course,
        summary: `${isPublishing ? "Published" : "Updated"} course "${course.slug}"`,
        metadata: {
          slug: course.slug,
          updatedFields: Object.keys(updateData),
          contentStatus: course.contentStatus,
        },
        ipHash,
      });

      return course;
    });

    revalidateContentPaths("Course", [existing.slug, updated.slug]);

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminSession("content:write");
    requireDbConfigured();

    const { id } = await context.params;
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("কোর্সটি খুঁজে পাওয়া যায়নি।");
    }

    assertCanTouchPublished(admin, undefined, existing.contentStatus);

    const ipHash = getAuditIpHash(request);

    await prisma.$transaction(async (tx) => {
      await tx.course.delete({ where: { id } });

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "Course",
        entityId: id,
        revisionAction: "DELETE",
        auditAction: "DELETE_COURSE",
        snapshot: existing,
        summary: `Deleted course "${existing.slug}"`,
        metadata: {
          slug: existing.slug,
          contentStatus: existing.contentStatus,
        },
        ipHash,
      });
    });

    revalidateContentPaths("Course", [existing.slug]);

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}
