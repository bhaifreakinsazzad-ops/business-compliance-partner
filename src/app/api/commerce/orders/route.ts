import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fromPaisa, toPaisa } from "@/lib/commerce/payments";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";
import { generatePublicReference } from "@/lib/security/reference-id";

const createOrderSchema = z.object({
  quoteId: z.string().trim().min(1, "কোটেশন আইডি প্রয়োজন।"),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json(
      {
        error: "অর্ডার সেবা সাময়িকভাবে অনুপলভ্য। অনুগ্রহ করে পরে চেষ্টা করুন।",
        code: "SERVICE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  let parsedBody: z.infer<typeof createOrderSchema>;
  try {
    const raw = await req.json();
    const parsed = createOrderSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "সঠিক অর্ডার তথ্য দিন।" },
        { status: 400 },
      );
    }
    parsedBody = parsed.data;
  } catch {
    return NextResponse.json({ error: "অবৈধ JSON রিকোয়েস্ট।" }, { status: 400 });
  }

  const effectiveIdempotencyKey =
    parsedBody.idempotencyKey || `quote:${customer.id}:${parsedBody.quoteId}`;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingByKey = await tx.order.findFirst({
        where: {
          customerId: customer.id,
          OR: [
            { idempotencyKey: effectiveIdempotencyKey },
            { quoteId: parsedBody.quoteId },
          ],
        },
        include: { invoices: true },
      });

      if (existingByKey) {
        return { kind: "EXISTING" as const, order: existingByKey };
      }

      const quote = await tx.quote.findFirst({
        where: {
          id: parsedBody.quoteId,
          customerId: customer.id,
        },
        include: { items: true },
      });

      if (!quote) {
        return { kind: "NOT_FOUND" as const };
      }

      if (quote.status !== "ACCEPTED") {
        return { kind: "NOT_ACCEPTED" as const };
      }

      if (quote.validUntil && quote.validUntil.getTime() < Date.now()) {
        return { kind: "EXPIRED" as const };
      }

      // Compute server-authoritative total in integer paisa
      const itemsTotalPaisa = quote.items.reduce(
        (sum, item) => sum + toPaisa(item.unitPriceBdt) * Math.max(1, item.quantity),
        0,
      );
      const quoteTotalPaisa =
        itemsTotalPaisa > 0 ? itemsTotalPaisa : toPaisa(quote.totalAmountBdt);

      if (quoteTotalPaisa <= 0) {
        return { kind: "INVALID_AMOUNT" as const };
      }

      const authoritativeTotalBdt = fromPaisa(quoteTotalPaisa);
      const orderRef = generatePublicReference().replace(/^BCP-/, "ORD-");
      const invoiceNum = generatePublicReference().replace(/^BCP-/, "INV-");

      const order = await tx.order.create({
        data: {
          publicReference: orderRef,
          idempotencyKey: effectiveIdempotencyKey,
          orderKind: "SERVICE_QUOTE",
          quoteId: quote.id,
          customerId: customer.id,
          totalBdt: authoritativeTotalBdt,
          paymentStatus: "UNPAID",
          status: "CONFIRMED",
          notes: parsedBody.notes || null,
          invoices: {
            create: {
              invoiceNumber: invoiceNum,
              customerId: customer.id,
              amountBdt: authoritativeTotalBdt,
              status: "DUE",
            },
          },
        },
        include: { invoices: true },
      });

      return { kind: "CREATED" as const, order };
    });

    if (result.kind === "NOT_FOUND") {
      return NextResponse.json(
        { error: "গৃহীত কোটেশনটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    if (result.kind === "NOT_ACCEPTED") {
      return NextResponse.json(
        { error: "অর্ডার তৈরি করার আগে কোটেশনটি গ্রহণ করতে হবে।" },
        { status: 409 },
      );
    }

    if (result.kind === "EXPIRED") {
      return NextResponse.json(
        { error: "কোটেশনটির মেয়াদ শেষ হয়েছে। নতুন কোটেশনের অনুরোধ করুন।" },
        { status: 410 },
      );
    }

    if (result.kind === "INVALID_AMOUNT") {
      return NextResponse.json(
        { error: "কোটেশনে বৈধ মূল্য নির্ধারিত নেই।" },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      idempotent: result.kind === "EXISTING",
      order: result.order,
    });
  } catch (err) {
    console.error("[orders/create] Error:", err);
    return NextResponse.json(
      { error: "অর্ডার তৈরি করতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
