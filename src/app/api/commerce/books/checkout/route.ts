import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordServerVerifiedEvent } from "@/lib/analytics/server";
import {
  CommerceValidationError,
  hashIdempotencyPayload,
  normalizeAndValidateBookItems,
} from "@/lib/commerce/checkout-rules";
import {
  computeLineItemTotalPaisa,
  fromPaisa,
} from "@/lib/commerce/payments";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import {
  isBooksSchemaReady,
  isCoreCommerceSchemaReady,
} from "@/lib/db/schema-ready";
import { generatePublicReference } from "@/lib/security/reference-id";

export const dynamic = "force-dynamic";

const BOOK_RESERVATION_WINDOW_MS = 30 * 60 * 1000;

const bookCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        bookId: z.string().trim().min(1, "বইয়ের আইডি প্রয়োজন।"),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "অন্তত একটি বই নির্বাচন করুন।")
    .max(20),
  shippingAddress: z
    .string()
    .trim()
    .min(8, "সঠিক ডেলিভারি ঠিকানা লিখুন।")
    .max(400),
  notes: z.string().trim().max(500).optional(),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (
    !isDatabaseConfigured() ||
    !(await isBooksSchemaReady()) ||
    !(await isCoreCommerceSchemaReady())
  ) {
    return NextResponse.json(
      {
        error: "বই অর্ডার সেবা সাময়িকভাবে অনুপলভ্য। অনুগ্রহ করে পরে চেষ্টা করুন।",
        code: "SERVICE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  let parsedBody: z.infer<typeof bookCheckoutSchema>;
  try {
    const raw = await req.json();
    const parsed = bookCheckoutSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.errors[0]?.message || "সঠিক অর্ডার তথ্য দিন।",
          code: "VALIDATION_ERROR",
        },
        { status: 400 },
      );
    }
    parsedBody = parsed.data;
  } catch {
    return NextResponse.json(
      { error: "অবৈধ JSON রিকোয়েস্ট।", code: "INVALID_JSON" },
      { status: 400 },
    );
  }

  let requestedItems;
  try {
    requestedItems = normalizeAndValidateBookItems(parsedBody.items);
  } catch (err) {
    if (err instanceof CommerceValidationError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode },
      );
    }
    throw err;
  }

  const clientSuppliedKey = parsedBody.idempotencyKey?.trim();
  const effectiveIdempotencyKey =
    clientSuppliedKey || `bko-req-${randomUUID()}`;
  const payloadHash = hashIdempotencyPayload({
    customerId: customer.id,
    items: requestedItems,
    shippingAddress: parsedBody.shippingAddress,
    notes: parsedBody.notes || null,
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (clientSuppliedKey) {
        const existing = await tx.order.findFirst({
          where: {
            customerId: customer.id,
            idempotencyKey: effectiveIdempotencyKey,
          },
          include: {
            invoices: true,
            bookItems: true,
          },
        });

        if (existing) {
          if (existing.idempotencyHash && existing.idempotencyHash !== payloadHash) {
            throw new CommerceValidationError(
              409,
              "IDEMPOTENCY_KEY_MISMATCH",
              "একই ইডেমপোটেন্সি কী ভিন্ন অর্ডারের তথ্যের সাথে পুনঃব্যবহার করা যাবে না।",
            );
          }
          return { kind: "EXISTING" as const, order: existing };
        }
      }

      const books = await tx.book.findMany({
        where: {
          id: { in: requestedItems.map((i) => i.bookId) },
        },
      });
      const bookById = new Map(books.map((b) => [b.id, b]));

      let totalPaisa = 0;
      const lineItems: Array<{
        bookId: string;
        titleSnapshot: string;
        quantity: number;
        unitPricePaisa: number;
        lineTotalPaisa: number;
      }> = [];

      const orderRef = generatePublicReference().replace(/^BCP-/, "BKO-");
      const invoiceNum = generatePublicReference().replace(/^BCP-/, "INV-");

      for (const reqItem of requestedItems) {
        const book = bookById.get(reqItem.bookId);
        if (!book) {
          throw new CommerceValidationError(
            404,
            "BOOK_NOT_FOUND",
            "নির্বাচিত বইটি পাওয়া যায়নি।",
          );
        }

        if (
          book.contentStatus !== "PUBLISHED" ||
          book.availabilityStatus !== "ACTIVE" ||
          book.pricePaisa === null ||
          book.pricePaisa <= 0
        ) {
          throw new CommerceValidationError(
            422,
            "BOOK_NOT_ORDERABLE",
            "এই বইটির মূল্য ও প্রকাশনা এখনও চূড়ান্ত অনুমোদিত নয়। অনুগ্রহ করে আগ্রহ নিবন্ধন করুন।",
          );
        }

        const updatedStock = await tx.book.updateMany({
          where: {
            id: book.id,
            stockQuantity: { gte: reqItem.quantity },
          },
          data: {
            stockQuantity: { decrement: reqItem.quantity },
          },
        });

        if (updatedStock.count === 0) {
          throw new CommerceValidationError(
            409,
            "INSUFFICIENT_STOCK",
            `দুঃখিত, "${book.titleBn}" বইটির পর্যাপ্ত স্টক বর্তমানে নেই।`,
          );
        }

        await tx.bookInventoryMovement.create({
          data: {
            bookId: book.id,
            delta: -reqItem.quantity,
            reason: "CUSTOMER_CHECKOUT",
            reference: orderRef,
          },
        });

        const lineTotalPaisa = computeLineItemTotalPaisa(
          book.pricePaisa,
          reqItem.quantity,
        );
        totalPaisa += lineTotalPaisa;
        lineItems.push({
          bookId: book.id,
          titleSnapshot: book.titleBn,
          quantity: reqItem.quantity,
          unitPricePaisa: book.pricePaisa,
          lineTotalPaisa,
        });
      }

      const totalBdt = fromPaisa(totalPaisa);

      const order = await tx.order.create({
        data: {
          publicReference: orderRef,
          idempotencyKey: effectiveIdempotencyKey,
          idempotencyHash: payloadHash,
          orderKind: "BOOKSTORE",
          customerId: customer.id,
          currency: "BDT",
          subtotalPaisa: totalPaisa,
          shippingPaisa: 0,
          discountPaisa: 0,
          totalPaisa,
          totalBdt,
          paymentStatus: "UNPAID",
          status: "CONFIRMED",
          reservedUntil: new Date(Date.now() + BOOK_RESERVATION_WINDOW_MS),
          shippingAddress: parsedBody.shippingAddress,
          notes: parsedBody.notes || null,
          bookItems: {
            create: lineItems,
          },
          invoices: {
            create: {
              invoiceNumber: invoiceNum,
              customerId: customer.id,
              currency: "BDT",
              amountPaisa: totalPaisa,
              amountBdt: totalBdt,
              status: "DUE",
            },
          },
        },
        include: {
          invoices: true,
          bookItems: true,
        },
      });

      return { kind: "CREATED" as const, order };
    });

    if (result.kind === "CREATED") {
      const totalCopies = result.order.bookItems.reduce(
        (acc, item) => acc + item.quantity,
        0,
      );
      await recordServerVerifiedEvent({
        eventName: "order_created",
        customerId: customer.id,
        entityType: "Order",
        entityId: result.order.id,
        payload: {
          orderKind: "BOOKSTORE",
          quantity: totalCopies,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        idempotent: result.kind === "EXISTING",
        order: result.order,
        invoice: result.order.invoices[0] ?? null,
      },
      { status: result.kind === "EXISTING" ? 200 : 201 },
    );
  } catch (err) {
    if (err instanceof CommerceValidationError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode },
      );
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002" &&
      clientSuppliedKey
    ) {
      const raced = await prisma.order.findFirst({
        where: {
          customerId: customer.id,
          idempotencyKey: effectiveIdempotencyKey,
        },
        include: { invoices: true, bookItems: true },
      });
      if (raced) {
        if (raced.idempotencyHash && raced.idempotencyHash !== payloadHash) {
          return NextResponse.json(
            {
              error:
                "একই ইডেমপোটেন্সি কী ভিন্ন অর্ডারের তথ্যের সাথে পুনঃব্যবহার করা যাবে না।",
              code: "IDEMPOTENCY_KEY_MISMATCH",
            },
            { status: 409 },
          );
        }
        return NextResponse.json(
          {
            success: true,
            idempotent: true,
            order: raced,
            invoice: raced.invoices[0] ?? null,
          },
          { status: 200 },
        );
      }
    }

    console.error("[commerce/books/checkout] Error:", err);
    return NextResponse.json(
      { error: "বই অর্ডার তৈরি করতে সমস্যা হয়েছে।", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
