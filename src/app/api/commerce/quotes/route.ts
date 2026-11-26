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
    const now = new Date();
    const nextStatus = body.action === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    const outcome = await prisma.$transaction(async (tx) => {
      const transition = await tx.quote.updateMany({
        where: {
          id: body.quoteId,
          customerId: customer.id,
          status: "SENT",
          OR: [{ validUntil: null }, { validUntil: { gt: now } }],
        },
        data: { status: nextStatus },
      });

      if (transition.count === 0) {
        const current = await tx.quote.findFirst({
          where: { id: body.quoteId, customerId: customer.id },
        });
        if (!current) {
          return { kind: "NOT_FOUND" as const };
        }
        if (current.validUntil && current.validUntil.getTime() <= now.getTime()) {
          return { kind: "EXPIRED" as const };
        }
        return { kind: "INVALID_STATE" as const, status: current.status };
      }

      const updated = await tx.quote.findUnique({
        where: { id: body.quoteId },
        include: { items: true, request: true },
      });

      return { kind: "UPDATED" as const, quote: updated };
    });

    if (outcome.kind === "NOT_FOUND") {
      return NextResponse.json(
        { error: "কোটেশনটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }
    if (outcome.kind === "EXPIRED") {
      return NextResponse.json(
        { error: "কোটেশনটির মেয়াদ শেষ হয়ে গেছে।" },
        { status: 410 },
      );
    }
    if (outcome.kind === "INVALID_STATE") {
      return NextResponse.json(
        {
          error: `এই কোটেশনটি ইতোমধ্যেই "${outcome.status}" অবস্থায় রয়েছে এবং পরিবর্তন করা যাবে না।`,
          code: "QUOTE_ALREADY_PROCESSED",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true, quote: outcome.quote });
  } catch (err) {
    console.error("[quotes/action] Error:", err);
    return NextResponse.json(
      { error: "কোটেশন প্রক্রিয়াকরণে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
