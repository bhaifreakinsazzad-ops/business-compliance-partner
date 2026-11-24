import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ quotes: [] });
  }

  const quotes = await prisma.quote.findMany({
    where: { customerId: customer.id },
    include: { items: true, request: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ quotes });
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  try {
    const { quoteId, action } = await req.json();
    if (!quoteId || !["ACCEPT", "REJECT"].includes(action)) {
      return NextResponse.json(
        { error: "উদ্ধৃতি আইডি এবং সঠিক একশন নির্বাচন করুন।" },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        success: true,
        status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED",
      });
    }

    const quote = await prisma.quote.findFirst({
      where: { id: quoteId, customerId: customer.id },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "কোটেশনটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 }
      );
    }

    const updated = await prisma.quote.update({
      where: { id: quoteId },
      data: { status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED" },
    });

    return NextResponse.json({ success: true, quote: updated });
  } catch (err) {
    console.error("[quotes/action] Error:", err);
    return NextResponse.json(
      { error: "কোটেশন প্রক্রিয়াকরণে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
