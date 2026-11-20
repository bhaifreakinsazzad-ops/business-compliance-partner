import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/security/session";
import { assertPermission } from "@/lib/security/rbac";
import { toCsv } from "@/lib/security/csv";
import { hashClientIp } from "@/lib/security/password";
import { LEAD_STATUS_ENUM } from "@/lib/validation/content";
import { PILLAR_ENUM } from "@/lib/validation/lead";

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdminSession("leads:view");

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: "ডাটাবেজ কনফিগার করা নেই।" },
        { status: 503 },
      );
    }

    const { searchParams } = request.nextUrl;
    const format = searchParams.get("format");

    const rawStatus = searchParams.get("status")?.trim();
    let validStatus: Prisma.EnumLeadStatusFilter["equals"] | undefined;
    if (rawStatus && rawStatus !== "ALL") {
      const parsedStatus = LEAD_STATUS_ENUM.safeParse(rawStatus);
      if (!parsedStatus.success) {
        return NextResponse.json(
          { success: false, error: "অবৈধ স্ট্যাটাস ফিল্টার।" },
          { status: 422 },
        );
      }
      validStatus = parsedStatus.data;
    }

    const rawPillar = searchParams.get("pillar")?.trim();
    let validPillar: Prisma.EnumPillarTypeFilter["equals"] | undefined;
    if (rawPillar && rawPillar !== "ALL") {
      const parsedPillar = PILLAR_ENUM.safeParse(rawPillar);
      if (!parsedPillar.success) {
        return NextResponse.json(
          { success: false, error: "অবৈধ পিলার ফিল্টার।" },
          { status: 422 },
        );
      }
      validPillar = parsedPillar.data;
    }

    const parsedPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const page = Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

    const parsedLimit = Number.parseInt(searchParams.get("limit") ?? "25", 10);
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(100, Math.max(1, parsedLimit))
      : 25;

    const search = searchParams.get("q")?.trim();

    const where: Prisma.LeadWhereInput = {};
    if (validStatus) {
      where.status = validStatus;
    }
    if (validPillar) {
      where.pillar = validPillar;
    }
    if (search) {
      where.OR = [
        { publicReference: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { mobile: { contains: search } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (format === "csv") {
      assertPermission(admin.role, "leads:export");

      const rawIp =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        null;
      const ipHash = rawIp ? hashClientIp(rawIp) : null;

      const allLeads = await prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 1000,
      });

      await prisma.auditLog.create({
        data: {
          actorId: admin.userId,
          actorEmail: admin.email,
          actorRole: admin.role,
          action: "EXPORT_LEADS_CSV",
          entityType: "Lead",
          summary: `Exported ${allLeads.length} leads to CSV`,
          metadata: {
            count: allLeads.length,
            filters: {
              status: validStatus ?? null,
              pillar: validPillar ?? null,
              search: search || null,
            },
          },
          ipHash,
        },
      });

      const headers = [
        "Public Reference",
        "Created At",
        "Name",
        "Mobile",
        "Email",
        "Pillar",
        "Target Slug",
        "Status",
        "Address Area",
      ];

      const rows = allLeads.map((lead) => [
        lead.publicReference,
        lead.createdAt.toISOString(),
        lead.name,
        lead.mobile,
        lead.email ?? "",
        lead.pillar,
        lead.targetSlug ?? "",
        lead.status,
        lead.addressArea,
      ]);

      const csvContent = toCsv(headers, rows);

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="paperwork_squad_leads_${Date.now()}.csv"`,
          "Cache-Control": "no-store, private",
        },
      });
    }

    const [leads, totalCount] = await Promise.all([
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: leads,
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      const err = error as { statusCode: number; message: string };
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.statusCode },
      );
    }

    console.error("[Admin Leads Error]", error);
    return NextResponse.json(
      { success: false, error: "সার্ভারে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
