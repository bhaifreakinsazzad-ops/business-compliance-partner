import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";
import { requireAdminSession } from "@/lib/security/session";
import { handleAdminApiError, parsePagination } from "@/lib/services/admin-content";

export const dynamic = "force-dynamic";

const filterSchema = z.object({
  status: z.string().trim().optional(),
  paymentStatus: z.string().trim().optional(),
  orderKind: z.string().trim().optional(),
  q: z.string().trim().optional(),
});

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession("orders:manage");
    if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: { page: 1, limit: 25, total: 0, totalPages: 0 },
      });
    }

    const { searchParams } = request.nextUrl;
    const { page, limit, skip } = parsePagination(searchParams);
    const parsed = filterSchema.parse({
      status: searchParams.get("status") || undefined,
      paymentStatus: searchParams.get("paymentStatus") || undefined,
      orderKind: searchParams.get("orderKind") || undefined,
      q: searchParams.get("q") || undefined,
    });

    const where = {
      ...(parsed.status ? { status: parsed.status } : {}),
      ...(parsed.paymentStatus ? { paymentStatus: parsed.paymentStatus } : {}),
      ...(parsed.orderKind ? { orderKind: parsed.orderKind } : {}),
      ...(parsed.q
        ? {
            OR: [
              { publicReference: { contains: parsed.q, mode: "insensitive" as const } },
              { shippingAddress: { contains: parsed.q, mode: "insensitive" as const } },
              {
                customer: {
                  email: { contains: parsed.q, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true, mobile: true } },
          bookItems: true,
          invoices: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: orders,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleAdminApiError(error);
  }
}
