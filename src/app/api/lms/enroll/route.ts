import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";

const enrollSchema = z.object({
  courseId: z.string().trim().min(1, "কোর্স আইডি প্রয়োজন।"),
});

const BN_DIGIT_MAP: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

function toAsciiDigits(input: string): string {
  return input.replace(/[০-৯]/g, (digit) => BN_DIGIT_MAP[digit] ?? digit);
}

function isCourseFeeRequired(feeDisplay: string | null | undefined): boolean {
  if (!feeDisplay) return false;
  const trimmed = toAsciiDigits(feeDisplay.trim()).toLowerCase();
  if (!trimmed || trimmed === "free" || trimmed === "ফ্রি" || trimmed === "0") {
    return false;
  }
  const numericMatch = trimmed.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!numericMatch) return false;
  return Number.parseFloat(numericMatch[0]) > 0;
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json(
      {
        error: "কোর্স এনরোলমেন্ট সেবা সাময়িকভাবে অনুপলভ্য।",
        code: "SERVICE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  let courseId: string;
  try {
    const raw = await req.json();
    const parsed = enrollSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "কোর্স আইডি প্রয়োজন।" },
        { status: 400 },
      );
    }
    courseId = parsed.data.courseId;
  } catch {
    return NextResponse.json({ error: "অবৈধ JSON রিকোয়েস্ট।" }, { status: 400 });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        slug: true,
        titleBn: true,
        contentStatus: true,
        availabilityStatus: true,
        feeDisplay: true,
      },
    });

    if (!course || course.contentStatus !== "PUBLISHED") {
      return NextResponse.json(
        { error: "প্রকাশিত কোর্সটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    if (course.availabilityStatus !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "এই কোর্সটি বর্তমানে সরাসরি এনরোলমেন্টের জন্য উন্মুক্ত নয়। আগ্রহ জানাতে পরামর্শ বা অনুসন্ধান ফর্ম ব্যবহার করুন।",
          code: "COURSE_NOT_ACTIVE_FOR_ENROLLMENT",
        },
        { status: 403 },
      );
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        customerId_courseId: {
          customerId: customer.id,
          courseId: course.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        enrollment: existing,
        message: "আপনি ইতোমধ্যে এই কোর্সে নিবন্ধিত আছেন।",
      });
    }

    if (isCourseFeeRequired(course.feeDisplay)) {
      const paidEntitlement = await prisma.order.findFirst({
        where: {
          customerId: customer.id,
          paymentStatus: "PAID",
          OR: [
            { notes: { contains: course.slug } },
            { quote: { request: { serviceSlug: course.slug } } },
          ],
        },
        select: { id: true },
      });

      if (!paidEntitlement) {
        return NextResponse.json(
          {
            error: "পেইড কোর্সে এনরোল করার আগে অনুগ্রহ করে পেমেন্ট সম্পন্ন করুন।",
            code: "PAYMENT_REQUIRED",
          },
          { status: 402 },
        );
      }
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        customerId: customer.id,
        courseId: course.id,
        progressPercentage: 0,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (err) {
    console.error("[lms/enroll] Error:", err);
    return NextResponse.json(
      { error: "কোর্স এনরোলমেন্টে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
