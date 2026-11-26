import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { canTransitionOrderStatus } from "@/lib/commerce/checkout-rules";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { assertPermission } from "@/lib/security/rbac";
import { requireAdminSession } from "@/lib/security/session";
import { getAuditIpHash, handleAdminApiError } from "@/lib/services/admin-content";

const adminOrderPatchSchema = z.object({
  status: z.enum([
    "CONFIRMED",
    "IN_FULFILLMENT",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
  reason: z.string().trim().max(400).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireAdminSession("orders:manage");
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "ডাটাবেজ কনফিগার করা নেই।" },
        { status: 503 },
      );
    }

    const { id } = await context.params;
    const raw = await request.json().catch(() => null);
    const parsed = adminOrderPatchSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "সঠিক অর্ডার স্ট্যাটাস দিন।" },
        { status: 400 },
      );
    }

    const nextStatus = parsed.data.status;
    if (nextStatus === "CANCELLED" || nextStatus === "REFUNDED") {
      assertPermission(admin.role, "orders:cancel");
    }

    const ipHash = getAuditIpHash(request);

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: { bookItems: true, invoices: true },
      });

      if (!existing) {
        return { kind: "NOT_FOUND" as const };
      }

      if (!canTransitionOrderStatus(existing.status, nextStatus)) {
        return {
          kind: "INVALID_TRANSITION" as const,
          from: existing.status,
          to: nextStatus,
        };
      }

      const wasRestorableState =
        existing.status !== "CANCELLED" && existing.status !== "REFUNDED";
      const isNowCancellingOrRefunding =
        nextStatus === "CANCELLED" || nextStatus === "REFUNDED";

      const updateCount = await tx.order.updateMany({
        where: { id: existing.id, status: existing.status },
        data: {
          status: nextStatus,
          ...(isNowCancellingOrRefunding
            ? {
                cancelledAt: existing.cancelledAt ?? new Date(),
                cancellationReason:
                  parsed.data.reason ??
                  existing.cancellationReason ??
                  `স্টাফ (${admin.email}) কর্তৃক ${nextStatus}`,
                ...(nextStatus === "REFUNDED"
                  ? { paymentStatus: "REFUNDED" }
                  : {}),
              }
            : {}),
          ...(parsed.data.notes !== undefined
            ? { notes: parsed.data.notes }
            : {}),
        },
      });

      if (updateCount.count === 0) {
        return { kind: "CONFLICT" as const };
      }

      if (wasRestorableState && isNowCancellingOrRefunding) {
        for (const item of existing.bookItems) {
          await tx.book.update({
            where: { id: item.bookId },
            data: { stockQuantity: { increment: item.quantity } },
          });
          await tx.bookInventoryMovement.create({
            data: {
              bookId: item.bookId,
              delta: item.quantity,
              reason:
                nextStatus === "REFUNDED"
                  ? "ADMIN_ORDER_REFUND_RESTORE"
                  : "ORDER_CANCELLED_RESTORE",
              reference: existing.publicReference,
            },
          });
        }

        await tx.invoice.updateMany({
          where: { orderId: existing.id, status: "DUE" },
          data: { status: "VOID" },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: admin.userId,
          actorEmail: admin.email,
          actorRole: admin.role,
          action: "UPDATE_ORDER_STATUS",
          entityType: "Order",
          entityId: existing.id,
          summary: `Order ${existing.publicReference}: ${existing.status} -> ${nextStatus}`,
          metadata: {
            publicReference: existing.publicReference,
            previousStatus: existing.status,
            nextStatus,
            reason: parsed.data.reason ?? null,
          },
          ipHash,
        },
      });

      const updated = await tx.order.findUnique({
        where: { id: existing.id },
        include: {
          customer: { select: { id: true, name: true, email: true } },
          bookItems: true,
          invoices: true,
        },
      });

      return { kind: "OK" as const, order: updated };
    });

    if (result.kind === "NOT_FOUND") {
      return NextResponse.json(
        { error: "অর্ডারটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }
    if (result.kind === "INVALID_TRANSITION") {
      return NextResponse.json(
        {
          error: `${result.from} থেকে ${result.to} অবস্থায় পরিবর্তন অনুমোদিত নয়।`,
        },
        { status: 409 },
      );
    }
    if (result.kind === "CONFLICT") {
      return NextResponse.json(
        { error: "অর্ডারের অবস্থা ইতোমধ্যে পরিবর্তিত হয়েছে।" },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true, order: result.order });
  } catch (error) {
    return handleAdminApiError(error);
  }
}
