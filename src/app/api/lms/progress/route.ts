import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";
import { generatePublicReference } from "@/lib/security/reference-id";

const progressSchema = z.object({
  enrollmentId: z.string().trim().min(1, "এনরোলমেন্ট আইডি প্রয়োজন।"),
  lessonId: z.string().trim().min(1, "লেসন আইডি প্রয়োজন।"),
  isCompleted: z.boolean(),
});

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json(
      {
        error: "অগ্রগতি সংরক্ষণ সেবা সাময়িকভাবে অনুপলভ্য।",
        code: "SERVICE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  let body: z.infer<typeof progressSchema>;
  try {
    const raw = await req.json();
    const parsed = progressSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "এনরোলমেন্ট ও লেসন আইডি প্রয়োজন।" },
        { status: 400 },
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "অবৈধ JSON রিকোয়েস্ট।" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findFirst({
        where: {
          id: body.enrollmentId,
          customerId: customer.id,
        },
        include: {
          course: {
            select: {
              id: true,
              titleBn: true,
            },
          },
        },
      });

      if (!enrollment) {
        return { kind: "ENROLLMENT_NOT_FOUND" as const };
      }

      const lesson = await tx.lesson.findFirst({
        where: {
          id: body.lessonId,
          module: {
            courseId: enrollment.courseId,
          },
        },
        select: { id: true },
      });

      if (!lesson) {
        return { kind: "LESSON_MISMATCH" as const };
      }

      const progress = await tx.lessonProgress.upsert({
        where: {
          enrollmentId_lessonId: {
            enrollmentId: enrollment.id,
            lessonId: lesson.id,
          },
        },
        update: {
          isCompleted: body.isCompleted,
          completedAt: body.isCompleted ? new Date() : null,
        },
        create: {
          enrollmentId: enrollment.id,
          lessonId: lesson.id,
          isCompleted: body.isCompleted,
          completedAt: body.isCompleted ? new Date() : null,
        },
      });

      const [totalLessons, completedLessons] = await Promise.all([
        tx.lesson.count({
          where: { module: { courseId: enrollment.courseId } },
        }),
        tx.lessonProgress.count({
          where: {
            enrollmentId: enrollment.id,
            isCompleted: true,
          },
        }),
      ]);

      const progressPercentage =
        totalLessons > 0
          ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
          : 0;
      const isFullyCompleted = totalLessons > 0 && completedLessons >= totalLessons;

      const updatedEnrollment = await tx.enrollment.update({
        where: { id: enrollment.id },
        data: {
          progressPercentage,
          status: isFullyCompleted ? "COMPLETED" : "ACTIVE",
          completedAt: isFullyCompleted ? new Date() : null,
        },
      });

      if (isFullyCompleted) {
        const existingCert = await tx.certificate.findFirst({
          where: {
            enrollmentId: enrollment.id,
            customerId: customer.id,
          },
        });
        if (!existingCert) {
          const certRef = generatePublicReference().replace(/^BCP-/, "BCP-CERT-");
          const verificationCode = `VER-${generatePublicReference().replace(/^BCP-/, "")}`;
          await tx.certificate.create({
            data: {
              certificateNumber: certRef,
              enrollmentId: enrollment.id,
              customerId: customer.id,
              courseTitleBn: enrollment.course.titleBn,
              verificationCode,
            },
          });
        }
      }

      return {
        kind: "OK" as const,
        progress,
        enrollment: updatedEnrollment,
      };
    });

    if (result.kind === "ENROLLMENT_NOT_FOUND") {
      return NextResponse.json(
        { error: "এনরোলমেন্টটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    if (result.kind === "LESSON_MISMATCH") {
      return NextResponse.json(
        { error: "এই লেসনটি নির্বাচিত কোর্সের অন্তর্ভুক্ত নয়।" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      progress: result.progress,
      enrollment: result.enrollment,
    });
  } catch (err) {
    console.error("[lms/progress] Error:", err);
    return NextResponse.json(
      { error: "অগ্রগতি সংরক্ষণ করতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
