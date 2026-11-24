import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  try {
    const { enrollmentId, lessonId, isCompleted } = await req.json();
    if (!enrollmentId || !lessonId) {
      return NextResponse.json(
        { error: "এনরোলমেন্ট ও লেসন আইডি প্রয়োজন।" },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        success: true,
        lessonProgress: { isCompleted: Boolean(isCompleted) },
      });
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: { enrollmentId, lessonId },
      },
      update: {
        isCompleted: Boolean(isCompleted),
        completedAt: isCompleted ? new Date() : null,
      },
      create: {
        enrollmentId,
        lessonId,
        isCompleted: Boolean(isCompleted),
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (err) {
    console.error("[lms/progress] Error:", err);
    return NextResponse.json(
      { error: "অগ্রগতি সংরক্ষণ করতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
