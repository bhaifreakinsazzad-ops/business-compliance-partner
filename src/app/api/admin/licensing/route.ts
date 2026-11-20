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
  validateUpsertSchema,
} from "@/lib/services/admin-content";
import { licensingUpsertSchema } from "@/lib/validation/content";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession("content:read");
    requireDbConfigured();

    const { searchParams } = request.nextUrl;
    const filters = parseContentListFilters(searchParams);
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.LicensingEntryWhereInput = {};
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
        { authorityName: { contains: filters.q, mode: "insensitive" } },
      ];
    }

    const [entries, total] = await Promise.all([
      prisma.licensingEntry.findMany({
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
      prisma.licensingEntry.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: entries,
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
    const data = validateUpsertSchema(licensingUpsertSchema, body);
    assertCanTouchPublished(admin, data.contentStatus);

    await assertValidCategoryForPillar(data.categoryId, "LICENSING");

    const ipHash = getAuditIpHash(request);
    const isPublishing = data.contentStatus === "PUBLISHED";

    const created = await prisma.$transaction(async (tx) => {
      const entry = await tx.licensingEntry.create({
        data: {
          slug: data.slug,
          categoryId: data.categoryId,
          titleBn: data.titleBn,
          titleEn: emptyToNull(data.titleEn) ?? null,
          summaryBn: data.summaryBn,
          summaryEn: emptyToNull(data.summaryEn) ?? null,
          authorityName: data.authorityName,
          authorityType: data.authorityType,
          officialSourceLabel: data.officialSourceLabel,
          officialSourceUrl: emptyToNull(data.officialSourceUrl) ?? null,
          serviceScopeBn: data.serviceScopeBn,
          limitationsBn: data.limitationsBn,
          documentsSummary: data.documentsSummary,
          processSummaryBn: data.processSummaryBn,
          aliases: data.aliases,
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
        entityType: "LicensingEntry",
        entityId: entry.id,
        revisionAction: isPublishing ? "PUBLISH" : "CREATE",
        auditAction: isPublishing ? "PUBLISH_LICENSING" : "CREATE_LICENSING",
        snapshot: entry,
        summary: `${isPublishing ? "Published" : "Created"} licensing entry "${entry.slug}"`,
        metadata: {
          slug: entry.slug,
          contentStatus: entry.contentStatus,
          availabilityStatus: entry.availabilityStatus,
        },
        ipHash,
      });

      return entry;
    });

    revalidateContentPaths("LicensingEntry", [created.slug]);

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 },
    );
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}
