import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  fromPaisa,
  toPaisa,
  verifySandboxPayment,
} from "@/lib/commerce/payments";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";

const sandboxPaymentSchema = z.object({
  orderId: z.string().trim().min(1, "অর্ডার আইডি প্রয়োজন।"),
  amountBdt: z.number().positive().optional(),
  transactionReference: z.string().trim().min(4).max(120).optional(),
});

export function isSandboxPaymentAllowed(): boolean {
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV?.toLowerCase();
  if (process.env.NODE_ENV === "production" || appEnv === "production") {
    return false;
  }
  return true;
}

export async function POST(req: NextRequest) {
  if (!isSandboxPaymentAllowed()) {
    return NextResponse.json(
      {
        error: "প্রোডাকশন পরিবেশে স্যান্ডবক্স পেমেন্ট নিষ্ক্রিয়। অনুমোদিত পেমেন্ট গেটওয়ে ব্যবহার করুন।",
        code: "SANDBOX_DISABLED_IN_PRODUCTION",
      },
      { status: 403 },
    );
  }

  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json(
      {
        error: "পেমেন্ট সেবা সাময়িকভাবে অনুপলভ্য।",
        code: "SERVICE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  let parsedBody: z.infer<typeof sandboxPaymentSchema>;
  try {
    const raw = await req.json();
    const parsed = sandboxPaymentSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "সঠিক পেমেন্ট তথ্য দিন।" },
        { status: 400 },
      );
    }
    parsedBody = parsed.data;
  } catch {
    return NextResponse.json({ error: "অবৈধ JSON রিকোয়েস্ট।" }, { status: 400 });
  }

  const txnRef =
    parsedBody.transactionReference || `TXN-SBX-${Date.now()}`;

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: parsedBody.orderId,
          customerId: customer.id,
        },
      });

      if (!order) {
        return { kind: "NOT_FOUND" as const };
      }

      const existingPayment = await tx.paymentRecord.findUnique({
        where: { transactionReference: txnRef },
      });
      if (existingPayment) {
        if (existingPayment.orderId !== order.id) {
          return { kind: "TXN_CONFLICT" as const };
        }
        return {
          kind: "IDEMPOTENT" as const,
          amountBdt: existingPayment.amountBdt,
          order,
        };
      }

      if (order.paymentStatus === "PAID") {
        return { kind: "ALREADY_PAID" as const };
      }

      const serverPaisa = toPaisa(order.totalBdt);
      if (
        parsedBody.amountBdt !== undefined &&
        toPaisa(parsedBody.amountBdt) !== serverPaisa
      ) {
        return {
          kind: "AMOUNT_MISMATCH" as const,
          expectedBdt: fromPaisa(serverPaisa),
        };
      }

      const authoritativeAmountBdt = fromPaisa(serverPaisa);

      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "PAID",
          status: "IN_FULFILLMENT",
          payments: {
            create: {
              transactionReference: txnRef,
              method: "SANDBOX",
              amountBdt: authoritativeAmountBdt,
              status: "SUCCESSFUL",
            },
          },
        },
      });

      await tx.invoice.updateMany({
        where: { orderId: order.id, customerId: customer.id },
        data: { status: "PAID", paidAt: new Date() },
      });

      return {
        kind: "PAID" as const,
        amountBdt: authoritativeAmountBdt,
        order: updatedOrder,
      };
    });

    if (outcome.kind === "NOT_FOUND") {
      return NextResponse.json(
        { error: "অর্ডারটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    if (outcome.kind === "TXN_CONFLICT") {
      return NextResponse.json(
        { error: "এই ট্রানজেকশন রেফারেন্সটি ইতিমধ্যে অন্য অর্ডারে ব্যবহৃত হয়েছে।" },
        { status: 409 },
      );
    }

    if (outcome.kind === "ALREADY_PAID") {
      return NextResponse.json(
        { error: "এই অর্ডারের পেমেন্ট ইতোমধ্যেই সম্পন্ন হয়েছে।" },
        { status: 409 },
      );
    }

    if (outcome.kind === "AMOUNT_MISMATCH") {
      return NextResponse.json(
        { error: "পেমেন্টের পরিমাণ অর্ডারের মোট মূল্যের সাথে সামঞ্জস্যপূর্ণ নয়।" },
        { status: 400 },
      );
    }

    const verification = verifySandboxPayment(
      txnRef,
      outcome.order.id,
      outcome.amountBdt,
    );

    return NextResponse.json({
      success: true,
      idempotent: outcome.kind === "IDEMPOTENT",
      verification,
      message: "স্যান্ডবক্স পেমেন্ট সফলভাবে প্রক্রিয়া করা হয়েছে।",
    });
  } catch (err) {
    console.error("[payments/sandbox] Error:", err);
    return NextResponse.json(
      { error: "পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
