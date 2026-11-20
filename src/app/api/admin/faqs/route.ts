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
  parseJsonBody,
  parseOptionalDate,
  parsePagination,
  recordRevisionAndAudit,
  requireDbConfigured,
  revalidateFaqPaths,
  UnprocessableEntityError,
  validateUpsertSchema,
} from "@/lib/services/admin-content";
import { CONTENT_STATUS_ENUM, faqUpsertSchema } from "@/lib/validation/content";
import { PILLAR_ENUM } from "@/lib/validation/lead";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession("faqs:manage");
    requireDbConfigured();

    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);

    const where: Prisma.FaqWhereInput = {};
    const rawStatus = searchParams.get("status")?.trim();
    if (rawStatus && rawStatus !== "ALL") {
      const parsed = CONTENT_STATUS_ENUM.safeParse(rawStatus);
      if (!parsed.success) {
        throw new UnprocessableEntityError("অবৈধ স্ট্যাটাস ফিল্টার।");
      }
      where.contentStatus = parsed.data;
    }

    const rawPillar = searchParams.get("pillar")?.trim();
    if (rawPillar && rawPillar !== "ALL") {
      const parsed = PILLAR_ENUM.safeParse(rawPillar);
      if (!parsed.success) {
        throw new UnprocessableEntityError("অবৈধ পিলার ফিল্টার।");
      }
      where.pillar = parsed.data;
    }

    const q = searchParams.get("q")?.trim();
    if (q) {
      where.OR = [
        { questionBn: { contains: q, mode: "insensitive" } },
        { answerBn: { contains: q, mode: "insensitive" } },
      ];
    }

    const [faqs, total] = await Promise.all([
      prisma.faq.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.faq.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: faqs,
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
    const admin = await requireAdminSession("faqs:manage");
    requireDbConfigured();

    const body = await parseJsonBody(request);
    assertNoForbiddenContent(body);
    const data = validateUpsertSchema(faqUpsertSchema, body);
    assertCanTouchPublished(admin, data.contentStatus);

    const ipHash = getAuditIpHash(request);
    const isPublishing = data.contentStatus === "PUBLISHED";

    const created = await prisma.$transaction(async (tx) => {
      const faq = await tx.faq.create({
        data: {
          questionBn: data.questionBn,
          answerBn: data.answerBn,
          pillar: data.pillar ?? null,
          isRegulatory: data.isRegulatory,
          contentStatus: data.contentStatus,
          sortOrder: data.sortOrder,
          verifiedBy: emptyToNull(data.verifiedBy) ?? null,
          lastVerifiedAt: parseOptionalDate(data.lastVerifiedAt) ?? null,
        },
      });

      await recordRevisionAndAudit(tx, {
        admin,
        entityType: "Faq",
        entityId: faq.id,
        revisionAction: isPublishing ? "PUBLISH" : "CREATE",
        auditAction: isPublishing ? "PUBLISH_FAQ" : "CREATE_FAQ",
        snapshot: faq,
        summary: `Created FAQ "${faq.questionBn.slice(0, 60)}" (${faq.contentStatus})`,
        metadata: {
          pillar: faq.pillar,
          isRegulatory: faq.isRegulatory,
          contentStatus: faq.contentStatus,
        },
        ipHash,
      });

      return faq;
    });

    revalidateFaqPaths();
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}
