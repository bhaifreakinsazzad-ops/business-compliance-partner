import { NextResponse, type NextRequest } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/security/session";
import { sanitizeCsvCell } from "@/lib/security/csv";
import type { LeadStatus } from "@prisma/client";

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
    const status = searchParams.get("status") as LeadStatus | null;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const search = searchParams.get("q")?.trim();

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
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
      const allLeads = await prisma.lead.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 1000,
      });

      // Record export in audit log
      await prisma.auditLog.create({
        data: {
          actorId: admin.userId,
          actorEmail: admin.email,
          actorRole: admin.role,
          action: "EXPORT_LEADS_CSV",
          entityType: "Lead",
          summary: `Exported ${allLeads.length} leads to CSV`,
          metadata: { count: allLeads.length, filters: { status, search } },
        },
      });

      const header = [
        "Public Reference",
        "Created At",
        "Name",
        "Mobile",
        "Email",
        "Pillar",
        "Target Slug",
        "Status",
        "Address Area",
      ].join(",");

      const rows = allLeads.map((lead) => {
        return [
          sanitizeCsvCell(lead.publicReference),
          lead.createdAt.toISOString(),
          sanitizeCsvCell(lead.name),
          sanitizeCsvCell(lead.mobile),
          sanitizeCsvCell(lead.email || ""),
          lead.pillar,
          sanitizeCsvCell(lead.targetSlug || ""),
          lead.status,
          sanitizeCsvCell(lead.addressArea),
        ]
          .map((val) => `"${String(val).replace(/"/g, '""')}"`)
          .join(",");
      });

      const csvContent = "\uFEFF" + [header, ...rows].join("\r\n");

      return new NextResponse(csvContent, {
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
