import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/security/session";
import {
  assertCanTouchPublished,
  assertNoForbiddenContent,
  emptyToNull,
  getAuditIpHash,
  handleAdminApiError,
  NotFoundError,
  parseJsonBody,
  parseOptionalDate,
  recordRevisionAndAudit,
  requireDbConfigured,
  revalidateFaqPaths,
  validatePatchSchema,
} from "@/lib/services/admin-content";
import { faqUpsertSchema } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

const faqPatchSchema = faqUpsertSchema.partial();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession("faqs:manage");
    requireDbConfigured();

    const { id } = await context.params;
    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) {
      throw new NotFoundError("FAQ খুঁজে পাওয়া যায়নি।");
    }

    const revisions = await prisma.contentRevision.findMany({
      where: { entityType: "Faq", entityId: id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: { ...faq, revisions },
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
    const admin = await requireAdminSession("faqs:manage");
    requireDbConfigured();

    const { id } = await context.params;
    const body = await parseJsonBody(request);
    assertNoForbiddenContent(body);
    const data = validatePatchSchema(faqPatchSchema, body);

    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("FAQ খুঁজে পাওয়া যায়নি।");
    }

    assertCanTouchPublished(admin, data.contentStatus, existing.contentStatus);

    const updateData: Prisma.FaqUpdateInput = {};
    if (data.questionBn !== undefined) updateData.questionBn = data.questionBn;
    if (data.answerBn !== undefined) updateData.answerBn = data.answerBn;
    if (data.pillar !== undefined) updateData.pillar = data.pillar ?? null;
    if (data.isRegulatory !== undefined) updateData.isRegulatory = data.isRegulatory;
    if (data.contentStatus !== undefined) updateData.contentStatus = data.contentStatus;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.verifiedBy !== undefined) {
      updateData.verifiedBy = emptyToNull(data.verifiedBy) ?? null;
    }
    if (data.lastVerifiedAt !== undefined) {
      updateData.lastVerifiedAt = parseOptionalDate(data.lastVerifiedAt) ?? null;
    }

    const isPublishingTransition =
      data.contentStatus === "PUBLISHED" && existing.contentStatus !== "PUBLISHED";
    const ipHash = getAuditIpHash(request);

    const updated = await prisma.$transaction(async (tx) => {
      const faq = await tx.faq.update({
        where: { id },
        data: updateData,
      });

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "Faq",
        entityId: faq.id,
        revisionAction: isPublishingTransition ? "PUBLISH" : "UPDATE",
        auditAction: isPublishingTransition ? "PUBLISH_FAQ" : "UPDATE_FAQ",
        snapshot: faq,
        summary: `${isPublishingTransition ? "Published" : "Updated"} FAQ "${faq.questionBn.slice(0, 60)}"`,
        metadata: {
          changedFields: Object.keys(data),
          previousStatus: existing.contentStatus,
          newStatus: faq.contentStatus,
        },
        ipHash,
      });

      return faq;
    });

    revalidateFaqPaths();
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
    const admin = await requireAdminSession("faqs:manage");
    requireDbConfigured();

    const { id } = await context.params;
    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("FAQ খুঁজে পাওয়া যায়নি।");
    }

    assertCanTouchPublished(admin, undefined, existing.contentStatus);
    const ipHash = getAuditIpHash(request);

    await prisma.$transaction(async (tx) => {
      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "Faq",
        entityId: existing.id,
        revisionAction: "DELETE",
        auditAction: "DELETE_FAQ",
        snapshot: existing,
        summary: `Deleted FAQ "${existing.questionBn.slice(0, 60)}"`,
        ipHash,
      });

      await tx.faq.delete({ where: { id } });
    });

    revalidateFaqPaths();
    return NextResponse.json({ success: true, data: { id } });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}
