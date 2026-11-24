import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { verifySandboxPayment } from "@/lib/commerce/payments";

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  try {
    const { orderId, amountBdt, transactionReference } = await req.json();
    if (!orderId || !amountBdt) {
      return NextResponse.json(
        { error: "অর্ডার আইডি ও টাকার পরিমাণ প্রয়োজন।" },
        { status: 400 }
      );
    }

    const txnRef = transactionReference || `TXN-SBX-${Date.now()}`;
    const verification = verifySandboxPayment(txnRef, orderId, amountBdt);

    if (isDatabaseConfigured()) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "IN_FULFILLMENT",
          payments: {
            create: {
              transactionReference: txnRef,
              method: "SANDBOX",
              amountBdt,
              status: "SUCCESSFUL",
            },
          },
        },
      });

      // Update associated invoice if found
      await prisma.invoice.updateMany({
        where: { orderId },
        data: { status: "PAID", paidAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      verification,
      message: "স্যান্ডবক্স পেমেন্ট সফলভাবে প্রক্রিয়া করা হয়েছে।",
    });
  } catch (err) {
    console.error("[payments/sandbox] Error:", err);
    return NextResponse.json(
      { error: "পেমেন্ট সম্পন্ন করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
