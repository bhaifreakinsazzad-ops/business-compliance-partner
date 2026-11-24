import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  try {
    const { courseId } = await req.json();
    if (!courseId) {
      return NextResponse.json(
        { error: "কোর্স আইডি প্রয়োজন।" },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        success: true,
        enrollment: {
          id: `enr-${Date.now()}`,
          customerId: customer.id,
          courseId,
          progressPercentage: 0,
          status: "ACTIVE",
        },
      });
    }

    const existing = await prisma.enrollment.findUnique({
      where: {
        customerId_courseId: {
          customerId: customer.id,
          courseId,
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

    const enrollment = await prisma.enrollment.create({
      data: {
        customerId: customer.id,
        courseId,
        progressPercentage: 0,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (err) {
    console.error("[lms/enroll] Error:", err);
    return NextResponse.json(
      { error: "কোর্স এনরোলমেন্টে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
