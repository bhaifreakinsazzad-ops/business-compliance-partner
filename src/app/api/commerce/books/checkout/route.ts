import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fromPaisa } from "@/lib/commerce/payments";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import {
  isBooksSchemaReady,
  isCoreCommerceSchemaReady,
} from "@/lib/db/schema-ready";
import { generatePublicReference } from "@/lib/security/reference-id";

export const dynamic = "force-dynamic";

const bookCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        bookId: z.string().trim().min(1, "বইয়ের আইডি প্রয়োজন।"),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, "অন্তত একটি বই নির্বাচন করুন।")
    .max(10),
  shippingAddress: z
    .string()
    .trim()
    .min(8, "সঠিক ডেলিভারি ঠিকানা লিখুন।")
    .max(400),
  notes: z.string().trim().max(500).optional(),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});

class CheckoutDomainError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

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

  // Merge duplicate bookId entries deterministically
  const quantityByBook = new Map<string, number>();
  for (const item of parsedBody.items) {
    quantityByBook.set(
      item.bookId,
      (quantityByBook.get(item.bookId) ?? 0) + item.quantity,
    );
  }
  const requestedItems = Array.from(quantityByBook.entries()).map(
    ([bookId, quantity]) => ({ bookId, quantity }),
  );

  const effectiveIdempotencyKey =
    parsedBody.idempotencyKey ||
    `books:${customer.id}:${requestedItems.map((i) => `${i.bookId}x${i.quantity}`).join(",")}`;

  try {
    const result = await prisma.$transaction(async (tx) => {
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
        return { kind: "EXISTING" as const, order: existing };
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
          throw new CheckoutDomainError(
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
          throw new CheckoutDomainError(
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
          throw new CheckoutDomainError(
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

        const lineTotalPaisa = book.pricePaisa * reqItem.quantity;
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
          orderKind: "BOOKSTORE",
          customerId: customer.id,
          totalBdt,
          paymentStatus: "UNPAID",
          status: "CONFIRMED",
          shippingAddress: parsedBody.shippingAddress,
          notes: parsedBody.notes || null,
          bookItems: {
            create: lineItems,
          },
          invoices: {
            create: {
              invoiceNumber: invoiceNum,
              customerId: customer.id,
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
    if (err instanceof CheckoutDomainError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode },
      );
    }
    console.error("[commerce/books/checkout] Error:", err);
    return NextResponse.json(
      { error: "বই অর্ডার তৈরি করতে সমস্যা হয়েছে।", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }
}
