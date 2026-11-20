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
  validatePatchSchema,
} from "@/lib/services/admin-content";
import { licensingUpsertSchema } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

const licensingPatchSchema = licensingUpsertSchema.partial();

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

    const entry = await prisma.licensingEntry.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, slug: true, nameBn: true, nameEn: true },
        },
      },
    });

    if (!entry) {
      throw new NotFoundError("লাইসেন্সিং তথ্যটি খুঁজে পাওয়া যায়নি।");
    }

    const revisions = includeRevisions
      ? await prisma.contentRevision.findMany({
          where: { entityType: "LicensingEntry", entityId: id },
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : [];

    return NextResponse.json({
      success: true,
      data: {
        ...entry,
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
    const data = validatePatchSchema(licensingPatchSchema, body);

    const existing = await prisma.licensingEntry.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("লাইসেন্সিং তথ্যটি খুঁজে পাওয়া যায়নি।");
    }

    assertCanTouchPublished(admin, data.contentStatus, existing.contentStatus);

    if (data.categoryId !== undefined) {
      await assertValidCategoryForPillar(data.categoryId, "LICENSING");
    }

    const updateData: Prisma.LicensingEntryUncheckedUpdateInput = {};
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.titleBn !== undefined) updateData.titleBn = data.titleBn;
    if (data.titleEn !== undefined) updateData.titleEn = emptyToNull(data.titleEn);
    if (data.summaryBn !== undefined) updateData.summaryBn = data.summaryBn;
    if (data.summaryEn !== undefined) {
      updateData.summaryEn = emptyToNull(data.summaryEn);
    }
    if (data.authorityName !== undefined) {
      updateData.authorityName = data.authorityName;
    }
    if (data.authorityType !== undefined) {
      updateData.authorityType = data.authorityType;
    }
    if (data.officialSourceLabel !== undefined) {
      updateData.officialSourceLabel = data.officialSourceLabel;
    }
    if (data.officialSourceUrl !== undefined) {
      updateData.officialSourceUrl = emptyToNull(data.officialSourceUrl);
    }
    if (data.serviceScopeBn !== undefined) {
      updateData.serviceScopeBn = data.serviceScopeBn;
    }
    if (data.limitationsBn !== undefined) {
      updateData.limitationsBn = data.limitationsBn;
    }
    if (data.documentsSummary !== undefined) {
      updateData.documentsSummary = data.documentsSummary;
    }
    if (data.processSummaryBn !== undefined) {
      updateData.processSummaryBn = data.processSummaryBn;
    }
    if (data.aliases !== undefined) updateData.aliases = data.aliases;
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
      const entry = await tx.licensingEntry.update({
        where: { id },
        data: updateData,
      });

      const isPublishing =
        entry.contentStatus === "PUBLISHED" &&
        existing.contentStatus !== "PUBLISHED";

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "LicensingEntry",
        entityId: entry.id,
        revisionAction: isPublishing ? "PUBLISH" : "UPDATE",
        auditAction: isPublishing ? "PUBLISH_LICENSING" : "UPDATE_LICENSING",
        snapshot: entry,
        summary: `${isPublishing ? "Published" : "Updated"} licensing entry "${entry.slug}"`,
        metadata: {
          slug: entry.slug,
          updatedFields: Object.keys(updateData),
          contentStatus: entry.contentStatus,
        },
        ipHash,
      });

      return entry;
    });

    revalidateContentPaths("LicensingEntry", [existing.slug, updated.slug]);

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
    const existing = await prisma.licensingEntry.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("লাইসেন্সিং তথ্যটি খুঁজে পাওয়া যায়নি।");
    }

    assertCanTouchPublished(admin, undefined, existing.contentStatus);

    const ipHash = getAuditIpHash(request);

    await prisma.$transaction(async (tx) => {
      await tx.licensingEntry.delete({ where: { id } });

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "LicensingEntry",
        entityId: id,
        revisionAction: "DELETE",
        auditAction: "DELETE_LICENSING",
        snapshot: existing,
        summary: `Deleted licensing entry "${existing.slug}"`,
        metadata: {
          slug: existing.slug,
          contentStatus: existing.contentStatus,
        },
        ipHash,
      });
    });

    revalidateContentPaths("LicensingEntry", [existing.slug]);

    return NextResponse.json({
      success: true,
      data: { id },
    });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}
