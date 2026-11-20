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
import { serviceUpsertSchema } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

const servicePatchSchema = serviceUpsertSchema.partial();

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

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, slug: true, nameBn: true, nameEn: true },
        },
      },
    });

    if (!service) {
      throw new NotFoundError("সেবাটি খুঁজে পাওয়া যায়নি।");
    }

    const revisions = includeRevisions
      ? await prisma.contentRevision.findMany({
          where: { entityType: "Service", entityId: id },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [];

    return NextResponse.json({
      success: true,
      data: {
        ...service,
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
    const data = validatePatchSchema(servicePatchSchema, body);

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("সেবাটি খুঁজে পাওয়া যায়নি।");
    }

    assertCanTouchPublished(admin, data.contentStatus, existing.contentStatus);

    if (data.categoryId !== undefined) {
      await assertValidCategoryForPillar(data.categoryId, "SERVICES");
    }

    const updateData: Prisma.ServiceUncheckedUpdateInput = {};
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.titleBn !== undefined) updateData.titleBn = data.titleBn;
    if (data.titleEn !== undefined) updateData.titleEn = emptyToNull(data.titleEn);
    if (data.summaryBn !== undefined) updateData.summaryBn = data.summaryBn;
    if (data.summaryEn !== undefined) {
      updateData.summaryEn = emptyToNull(data.summaryEn);
    }
    if (data.whoNeedsItBn !== undefined) {
      updateData.whoNeedsItBn = data.whoNeedsItBn;
    }
    if (data.assistanceScopeBn !== undefined) {
      updateData.assistanceScopeBn = data.assistanceScopeBn;
    }
    if (data.limitationsBn !== undefined) {
      updateData.limitationsBn = data.limitationsBn;
    }
    if (data.documentsSummary !== undefined) {
      updateData.documentsSummary = data.documentsSummary;
    }
    if (data.processSteps !== undefined) {
      updateData.processSteps = toJsonValue(data.processSteps);
    }
    if (data.authorityName !== undefined) {
      updateData.authorityName = emptyToNull(data.authorityName);
    }
    if (data.officialSourceLabel !== undefined) {
      updateData.officialSourceLabel = emptyToNull(data.officialSourceLabel);
    }
    if (data.officialSourceUrl !== undefined) {
      updateData.officialSourceUrl = emptyToNull(data.officialSourceUrl);
    }
    if (data.requiresSpecialist !== undefined) {
      updateData.requiresSpecialist = data.requiresSpecialist;
    }
    if (data.aliases !== undefined) updateData.aliases = data.aliases;
    if (data.serviceFeeNoteBn !== undefined) {
      updateData.serviceFeeNoteBn = emptyToNull(data.serviceFeeNoteBn);
    }
    if (data.govtFeeNoteBn !== undefined) {
      updateData.govtFeeNoteBn = emptyToNull(data.govtFeeNoteBn);
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
      const service = await tx.service.update({
        where: { id },
        data: updateData,
      });

      const isPublishing =
        service.contentStatus === "PUBLISHED" &&
        existing.contentStatus !== "PUBLISHED";

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "Service",
        entityId: service.id,
        revisionAction: isPublishing ? "PUBLISH" : "UPDATE",
        auditAction: isPublishing ? "PUBLISH_SERVICE" : "UPDATE_SERVICE",
        snapshot: service,
        summary: `${isPublishing ? "Published" : "Updated"} service "${service.slug}"`,
        metadata: {
          slug: service.slug,
          updatedFields: Object.keys(updateData),
          contentStatus: service.contentStatus,
        },
        ipHash,
      });

      return service;
    });

    revalidateContentPaths("Service", [existing.slug, updated.slug]);

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
    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("সেবাটি খুঁজে পাওয়া যায়নি।");
    }

    assertCanTouchPublished(admin, undefined, existing.contentStatus);

    const ipHash = getAuditIpHash(request);

    await prisma.$transaction(async (tx) => {
      await tx.service.delete({ where: { id } });

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "Service",
        entityId: id,
        revisionAction: "DELETE",
        auditAction: "DELETE_SERVICE",
        snapshot: existing,
        summary: `Deleted service "${existing.slug}"`,
        metadata: {
          slug: existing.slug,
          contentStatus: existing.contentStatus,
        },
        ipHash,
      });
    });

    revalidateContentPaths("Service", [existing.slug]);

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}
