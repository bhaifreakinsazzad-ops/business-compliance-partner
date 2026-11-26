import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";

const quoteActionSchema = z.object({
  quoteId: z.string().trim().min(1, "উদ্ধৃতি আইডি প্রয়োজন।"),
  action: z.enum(["ACCEPT", "REJECT"]),
});

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json({ quotes: [] });
  }

  try {
    const quotes = await prisma.quote.findMany({
      where: { customerId: customer.id },
      include: { items: true, request: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ quotes });
  } catch {
    return NextResponse.json({ quotes: [] });
  }
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json(
      { error: "কোটেশন সেবা সাময়িকভাবে অনুপলভ্য।" },
      { status: 503 },
    );
  }

  let body: z.infer<typeof quoteActionSchema>;
  try {
    const raw = await req.json();
    const parsed = quoteActionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "উদ্ধৃতি আইডি এবং সঠিক একশন নির্বাচন করুন।" },
        { status: 400 },
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "অবৈধ JSON রিকোয়েস্ট।" }, { status: 400 });
  }

  try {
    const quote = await prisma.quote.findFirst({
      where: { id: body.quoteId, customerId: customer.id },
    });

    if (!quote) {
      return NextResponse.json(
        { error: "কোটেশনটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    const updated = await prisma.quote.update({
      where: { id: quote.id },
      data: { status: body.action === "ACCEPT" ? "ACCEPTED" : "REJECTED" },
    });

    return NextResponse.json({ success: true, quote: updated });
  } catch (err) {
    console.error("[quotes/action] Error:", err);
    return NextResponse.json(
      { error: "কোটেশন প্রক্রিয়াকরণে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
