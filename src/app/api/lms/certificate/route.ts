import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code) {
    return NextResponse.json(
      { error: "সার্টিফিকেট ভেরিফিকেশন কোড লিখুন।" },
      { status: 400 },
    );
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json(
      {
        verified: false,
        error: "সার্টিফিকেট যাচাই সেবা সাময়িকভাবে অনুপলভ্য।",
      },
      { status: 503 },
    );
  }

  try {
    const certificate = await prisma.certificate.findUnique({
      where: { verificationCode: code },
      include: {
        customer: { select: { name: true } },
        enrollment: { select: { status: true, courseId: true } },
      },
    });

    if (!certificate || certificate.enrollment.status !== "COMPLETED") {
      return NextResponse.json(
        { verified: false, error: "প্রদত্ত কোডযুক্ত কোনো বৈধ সনদ পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      verified: true,
      certificate: {
        certificateNumber: certificate.certificateNumber,
        courseTitleBn: certificate.courseTitleBn,
        issuedAt: certificate.issuedAt,
        recipientName: certificate.customer.name,
      },
    });
  } catch {
    return NextResponse.json(
      {
        verified: false,
        error: "সার্টিফিকেট যাচাই সেবা সাময়িকভাবে অনুপলভ্য।",
      },
      { status: 503 },
    );
  }
}
