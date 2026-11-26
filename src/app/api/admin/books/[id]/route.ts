import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/security/session";
import {
  assertCanTouchPublished,
  assertNoForbiddenContent,
  assertValidBookCategory,
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
  UnprocessableEntityError,
  validatePatchSchema,
} from "@/lib/services/admin-content";
import { bookUpsertSchema } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

const bookPatchSchema = bookUpsertSchema.innerType().partial();

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession("content:read");
    requireDbConfigured();

    const { id } = await context.params;
    const book = await prisma.book.findUnique({
      where: { id },
      include: {
        category: true,
        inventoryMovements: {
          orderBy: { createdAt: "desc" },
          take: 15,
        },
      },
    });
    if (!book) {
      throw new NotFoundError();
    }

    return NextResponse.json({ success: true, data: book });
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
    const data = validatePatchSchema(bookPatchSchema, body);

    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError();
    }

    const nextContentStatus = data.contentStatus ?? existing.contentStatus;
    const nextAvailabilityStatus =
      data.availabilityStatus ?? existing.availabilityStatus;
    const nextPricePaisa =
      data.pricePaisa !== undefined ? data.pricePaisa : existing.pricePaisa;

    if (
      nextContentStatus === "PUBLISHED" &&
      nextAvailabilityStatus === "ACTIVE" &&
      (nextPricePaisa === null ||
        nextPricePaisa === undefined ||
        nextPricePaisa <= 0)
    ) {
      throw new UnprocessableEntityError(
        "প্রকাশিত ও সক্রিয় বইয়ের জন্য বৈধ ধনাত্মক মূল্য (পয়সা হিসেবে) দিতে হবে।",
        "VALIDATION_ERROR",
        { fieldErrors: { pricePaisa: ["Positive pricePaisa required."] } },
      );
    }

    assertCanTouchPublished(admin, data.contentStatus, existing.contentStatus);

    if (data.categoryId !== undefined) {
      await assertValidBookCategory(data.categoryId);
    }

    const ipHash = getAuditIpHash(request);
    const isPublishingTransition =
      data.contentStatus === "PUBLISHED" &&
      existing.contentStatus !== "PUBLISHED";

    const updated = await prisma.$transaction(async (tx) => {
      const book = await tx.book.update({
        where: { id },
        data: {
          slug: data.slug,
          sku: data.sku !== undefined ? emptyToNull(data.sku) ?? null : undefined,
          isbn:
            data.isbn !== undefined ? emptyToNull(data.isbn) ?? null : undefined,
          categoryId: data.categoryId,
          titleBn: data.titleBn,
          titleEn: data.titleEn,
          subtitleBn: data.subtitleBn,
          summaryBn: data.summaryBn,
          audienceBn: data.audienceBn,
          topicsBn: data.topicsBn,
          editionLabel:
            data.editionLabel !== undefined
              ? emptyToNull(data.editionLabel) ?? null
              : undefined,
          editionNoteBn: data.editionNoteBn,
          pagesCount: data.pagesCount,
          languageBnEn:
            data.languageBnEn !== undefined
              ? emptyToNull(data.languageBnEn) ?? null
              : undefined,
          deliveryMode:
            data.deliveryMode !== undefined
              ? emptyToNull(data.deliveryMode) ?? null
              : undefined,
          pricePaisa: data.pricePaisa,
          stockQuantity: data.stockQuantity,
          contentStatus: data.contentStatus,
          availabilityStatus: data.availabilityStatus,
          featured: data.featured,
          sortOrder: data.sortOrder,
          coverPalette:
            data.coverPalette !== undefined
              ? toJsonValue(data.coverPalette)
              : undefined,
          relatedCourseCategorySlug:
            data.relatedCourseCategorySlug !== undefined
              ? emptyToNull(data.relatedCourseCategorySlug) ?? null
              : undefined,
          relatedServiceCategorySlug:
            data.relatedServiceCategorySlug !== undefined
              ? emptyToNull(data.relatedServiceCategorySlug) ?? null
              : undefined,
          relatedLicensingCategorySlug:
            data.relatedLicensingCategorySlug !== undefined
              ? emptyToNull(data.relatedLicensingCategorySlug) ?? null
              : undefined,
          seoTitle:
            data.seoTitle !== undefined
              ? emptyToNull(data.seoTitle) ?? null
              : undefined,
          seoDescription:
            data.seoDescription !== undefined
              ? emptyToNull(data.seoDescription) ?? null
              : undefined,
          verifiedBy:
            data.verifiedBy !== undefined
              ? emptyToNull(data.verifiedBy) ?? null
              : undefined,
          lastVerifiedAt: parseOptionalDate(data.lastVerifiedAt),
        },
      });

      if (
        data.stockQuantity !== undefined &&
        data.stockQuantity !== existing.stockQuantity
      ) {
        await tx.bookInventoryMovement.create({
          data: {
            bookId: book.id,
            delta: data.stockQuantity - existing.stockQuantity,
            reason: "ADMIN_STOCK_ADJUSTMENT",
            reference: admin.email,
          },
        });
      }

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "Book",
        entityId: book.id,
        revisionAction: isPublishingTransition ? "PUBLISH" : "UPDATE",
        auditAction: isPublishingTransition ? "PUBLISH_BOOK" : "UPDATE_BOOK",
        snapshot: book,
        summary: `${isPublishingTransition ? "Published" : "Updated"} book "${book.slug}"`,
        metadata: {
          slug: book.slug,
          previousSlug: existing.slug,
          contentStatus: book.contentStatus,
          availabilityStatus: book.availabilityStatus,
          pricePaisa: book.pricePaisa,
          stockQuantity: book.stockQuantity,
        },
        ipHash,
      });

      return book;
    });

    revalidateContentPaths("Book", [existing.slug, updated.slug]);

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
    const admin = await requireAdminSession("content:publish");
    requireDbConfigured();

    const { id } = await context.params;
    const existing = await prisma.book.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError();
    }

    const ipHash = getAuditIpHash(request);

    await prisma.$transaction(async (tx) => {
      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "Book",
        entityId: existing.id,
        revisionAction: "DELETE",
        auditAction: "DELETE_BOOK",
        snapshot: existing,
        summary: `Deleted book "${existing.slug}"`,
        metadata: { slug: existing.slug },
        ipHash,
      });

      await tx.book.delete({ where: { id } });
    });

    revalidateContentPaths("Book", [existing.slug]);

    return NextResponse.json({ success: true, deletedId: existing.id });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}
