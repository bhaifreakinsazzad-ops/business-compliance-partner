import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";
import { hashClientIp } from "@/lib/security/password";

const cancelSchema = z.object({
  reason: z.string().trim().max(300).optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json(
      { error: "অর্ডার সেবা সাময়িকভাবে অনুপলভ্য।" },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json({ error: "অবৈধ অর্ডার আইডি।" }, { status: 400 });
  }

  const rawBody = await req.json().catch(() => ({}));
  const parsed = cancelSchema.safeParse(rawBody);
  const reason =
    parsed.success && parsed.data.reason
      ? parsed.data.reason
      : "কাস্টমার কর্তৃক বাতিলকৃত";

  const rawIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;
  const ipHash = rawIp ? hashClientIp(rawIp) : null;

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findFirst({
        where: { id, customerId: customer.id },
        include: { bookItems: true },
      });

      if (!existing) {
        return { kind: "NOT_FOUND" as const };
      }

      if (existing.paymentStatus === "PAID") {
        return { kind: "PAID_CANNOT_SELF_CANCEL" as const };
      }

      const updatedCount = await tx.order.updateMany({
        where: {
          id: existing.id,
          customerId: customer.id,
          paymentStatus: "UNPAID",
          status: {
            notIn: ["CANCELLED", "SHIPPED", "DELIVERED", "REFUNDED"],
          },
        },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
          cancellationReason: reason,
        },
      });

      if (updatedCount.count === 0) {
        return { kind: "CONFLICT" as const };
      }

      for (const item of existing.bookItems) {
        await tx.book.update({
          where: { id: item.bookId },
          data: {
            stockQuantity: { increment: item.quantity },
          },
        });
        await tx.bookInventoryMovement.create({
          data: {
            bookId: item.bookId,
            delta: item.quantity,
            reason: "ORDER_CANCELLED_RESTORE",
            reference: existing.publicReference,
          },
        });
      }

      await tx.invoice.updateMany({
        where: { orderId: existing.id, status: "DUE" },
        data: { status: "VOID" },
      });

      await tx.auditLog.create({
        data: {
          actorEmail: customer.email,
          action: "CANCEL_CUSTOMER_ORDER",
          entityType: "Order",
          entityId: existing.id,
          summary: `Customer cancelled unpaid order ${existing.publicReference} and restored inventory`,
          metadata: {
            publicReference: existing.publicReference,
            reason,
            restoredBookLines: existing.bookItems.length,
          },
          ipHash,
        },
      });

      const refreshed = await tx.order.findUnique({
        where: { id: existing.id },
        include: { bookItems: true, invoices: true },
      });

      return { kind: "CANCELLED" as const, order: refreshed };
    });

    if (outcome.kind === "NOT_FOUND") {
      return NextResponse.json(
        { error: "অর্ডারটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }
    if (outcome.kind === "PAID_CANNOT_SELF_CANCEL") {
      return NextResponse.json(
        {
          error:
            "পরিশোধিত অর্ডার বাতিল ও রিফান্ডের জন্য অনুগ্রহ করে সাপোর্ট টিমের সাথে যোগাযোগ করুন।",
          code: "PAID_ORDER_REQUIRES_ADMIN",
        },
        { status: 409 },
      );
    }
    if (outcome.kind === "CONFLICT") {
      return NextResponse.json(
        { error: "এই অর্ডারটি বর্তমান অবস্থায় বাতিল করা সম্ভব নয়।" },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      order: outcome.order,
    });
  } catch (err) {
    console.error("[commerce/orders/cancel] Error:", err);
    return NextResponse.json(
      { error: "অর্ডার বাতিল করতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
