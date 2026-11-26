import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/security/session";
import {
  assertCanTouchPublished,
  assertNoForbiddenContent,
  assertValidBookCategory,
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
import { bookCoverPaletteSchema, bookUpsertSchema } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession("content:read");
    requireDbConfigured();

    const { searchParams } = request.nextUrl;
    const filters = parseContentListFilters(searchParams);
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.BookWhereInput = {};
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
        { sku: { contains: filters.q, mode: "insensitive" } },
      ];
    }

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
        skip,
        take: limit,
        include: {
          category: {
            select: { id: true, slug: true, nameBn: true, nameEn: true },
          },
        },
      }),
      prisma.book.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: books,
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
    const data = validateUpsertSchema(bookUpsertSchema, body);
    assertCanTouchPublished(admin, data.contentStatus);

    await assertValidBookCategory(data.categoryId);

    const ipHash = getAuditIpHash(request);
    const isPublishing = data.contentStatus === "PUBLISHED";
    const coverPalette = data.coverPalette ?? bookCoverPaletteSchema.parse({});

    const created = await prisma.$transaction(async (tx) => {
      const book = await tx.book.create({
        data: {
          slug: data.slug,
          sku: emptyToNull(data.sku) ?? null,
          isbn: emptyToNull(data.isbn) ?? null,
          categoryId: data.categoryId,
          titleBn: data.titleBn,
          titleEn: data.titleEn,
          subtitleBn: data.subtitleBn,
          summaryBn: data.summaryBn,
          audienceBn: data.audienceBn,
          topicsBn: data.topicsBn,
          editionLabel: emptyToNull(data.editionLabel) ?? null,
          editionNoteBn: data.editionNoteBn,
          pagesCount: data.pagesCount ?? null,
          languageBnEn: emptyToNull(data.languageBnEn) ?? "বাংলা ও ইংরেজি রেফারেন্স",
          deliveryMode: emptyToNull(data.deliveryMode) ?? "PRINT",
          pricePaisa: data.pricePaisa ?? null,
          stockQuantity: data.stockQuantity,
          contentStatus: data.contentStatus,
          availabilityStatus: data.availabilityStatus,
          featured: data.featured,
          sortOrder: data.sortOrder,
          coverPalette: toJsonValue(coverPalette),
          relatedCourseCategorySlug:
            emptyToNull(data.relatedCourseCategorySlug) ?? null,
          relatedServiceCategorySlug:
            emptyToNull(data.relatedServiceCategorySlug) ?? null,
          relatedLicensingCategorySlug:
            emptyToNull(data.relatedLicensingCategorySlug) ?? null,
          seoTitle: emptyToNull(data.seoTitle) ?? null,
          seoDescription: emptyToNull(data.seoDescription) ?? null,
          verifiedBy: emptyToNull(data.verifiedBy) ?? null,
          lastVerifiedAt: parseOptionalDate(data.lastVerifiedAt) ?? null,
        },
      });

      if (book.stockQuantity > 0) {
        await tx.bookInventoryMovement.create({
          data: {
            bookId: book.id,
            delta: book.stockQuantity,
            reason: "INITIAL_STOCK_ADMIN",
            reference: admin.email,
          },
        });
      }

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "Book",
        entityId: book.id,
        revisionAction: isPublishing ? "PUBLISH" : "CREATE",
        auditAction: isPublishing ? "PUBLISH_BOOK" : "CREATE_BOOK",
        snapshot: book,
        summary: `${isPublishing ? "Published" : "Created"} book "${book.slug}"`,
        metadata: {
          slug: book.slug,
          contentStatus: book.contentStatus,
          availabilityStatus: book.availabilityStatus,
          pricePaisa: book.pricePaisa,
          stockQuantity: book.stockQuantity,
        },
        ipHash,
      });

      return book;
    });

    revalidateContentPaths("Book", [created.slug]);

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 },
    );
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}
