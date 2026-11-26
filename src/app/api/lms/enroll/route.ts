import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { recordServerVerifiedEvent } from "@/lib/analytics/server";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";

const enrollSchema = z.object({
  courseId: z.string().trim().min(1, "কোর্স আইডি প্রয়োজন।"),
});

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
        enrollmentModel: true,
        pricePaisa: true,
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

    if (
      course.enrollmentModel === "ENQUIRY_ONLY" ||
      course.enrollmentModel === "INVITATION_ONLY" ||
      course.enrollmentModel === "UNAVAILABLE"
    ) {
      return NextResponse.json(
        {
          error:
            "এই কোর্সে সরাসরি এনরোলমেন্টের পরিবর্তে অনুমোদন/অনুসন্ধান প্রয়োজন।",
          code: `COURSE_${course.enrollmentModel}`,
        },
        { status: 403 },
      );
    }

    const now = new Date();
    const activeEntitlement = await prisma.courseEntitlement.findFirst({
      where: {
        customerId: customer.id,
        courseId: course.id,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      },
      select: { id: true, sourceType: true },
    });

    if (course.enrollmentModel === "PAID" && !activeEntitlement) {
      return NextResponse.json(
        {
          error:
            "পেইড কোর্সে এনরোল করার আগে অনুমোদিত পেমেন্ট বা সক্রিয় এনটাইটেলমেন্ট প্রয়োজন।",
          code: "ENTITLEMENT_REQUIRED",
        },
        { status: 402 },
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

    const enrollment = await prisma.$transaction(async (tx) => {
      if (!activeEntitlement && course.enrollmentModel === "FREE") {
        await tx.courseEntitlement.create({
          data: {
            customerId: customer.id,
            courseId: course.id,
            sourceType: "FREE",
            status: "ACTIVE",
          },
        });
      }

      return tx.enrollment.create({
        data: {
          customerId: customer.id,
          courseId: course.id,
          progressPercentage: 0,
          status: "ACTIVE",
        },
      });
    });

    await recordServerVerifiedEvent({
      eventName: "enrollment_completed",
      customerId: customer.id,
      entityType: "Enrollment",
      entityId: enrollment.id,
      payload: { slug: course.slug, category: course.enrollmentModel },
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
