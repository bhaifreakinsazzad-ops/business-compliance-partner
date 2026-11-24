import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  try {
    const { quoteId } = await req.json();
    if (!quoteId) {
      return NextResponse.json(
        { error: "কোটেশন আইডি প্রয়োজন।" },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      const publicReference = `ORD-${Date.now()}`;
      return NextResponse.json({
        success: true,
        order: {
          publicReference,
          totalBdt: 5000,
          paymentStatus: "UNPAID",
          status: "CONFIRMED",
        },
      });
    }

    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, customerId: customer.id, status: "ACCEPTED" },
      include: { items: true },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "গৃহীত কোটেশনটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const orderRef = `ORD-${Date.now()}`;
    const invoiceNum = `INV-${Date.now()}`;

    const order = await prisma.order.create({
      data: {
        publicReference: orderRef,
        quoteId: quote.id,
        customerId: customer.id,
        totalBdt: quote.totalAmountBdt,
        paymentStatus: "UNPAID",
        status: "CONFIRMED",
        invoices: {
          create: {
            invoiceNumber: invoiceNum,
            customerId: customer.id,
            amountBdt: quote.totalAmountBdt,
            status: "DUE",
          },
        },
      },
      include: { invoices: true },
    });

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("[orders/create] Error:", err);
    return NextResponse.json(
      { error: "অর্ডার তৈরি করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
