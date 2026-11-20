import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/security/session";
import {
  handleAdminApiError,
  parsePagination,
  requireDbConfigured,
} from "@/lib/services/admin-content";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession("audit:view");
    requireDbConfigured();

    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const entityType = searchParams.get("entityType")?.trim() || undefined;
    const action = searchParams.get("action")?.trim() || undefined;

    const auditWhere: Prisma.AuditLogWhereInput = {};
    if (entityType && entityType !== "ALL") {
      auditWhere.entityType = entityType;
    }
    if (action) {
      auditWhere.action = { contains: action, mode: "insensitive" };
    }

    const revisionWhere: Prisma.ContentRevisionWhereInput = {};
    if (entityType && entityType !== "ALL") {
      revisionWhere.entityType = entityType;
    }

    const [auditLogs, auditTotal, revisions] = await Promise.all([
      prisma.auditLog.findMany({
        where: auditWhere,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where: auditWhere }),
      prisma.contentRevision.findMany({
        where: revisionWhere,
        orderBy: { createdAt: "desc" },
        take: 25,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        auditLogs,
        revisions,
      },
      meta: {
        page,
        limit,
        total: auditTotal,
        totalPages: Math.ceil(auditTotal / limit),
      },
    });
  } catch (error: unknown) {
    return handleAdminApiError(error);
  }
}
