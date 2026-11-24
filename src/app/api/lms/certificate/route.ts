import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code) {
    return NextResponse.json(
      { error: "সার্টিফিকেট ভেরিফিকেশন কোড লিখুন।" },
      { status: 400 }
    );
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({
      verified: true,
      certificate: {
        certificateNumber: "BCP-CERT-DEMO-2026",
        courseTitleBn: "ইনকাম ট্যাক্স রিটার্ন ও ফাইল প্রস্তুতি",
        issuedAt: new Date().toISOString(),
        recipientName: "যাচাইকৃত শিক্ষার্থী",
      },
    });
  }

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: { customer: { select: { name: true } } },
  });

  if (!certificate) {
    return NextResponse.json(
      { verified: false, error: "প্রদত্ত কোডযুক্ত কোনো বৈধ সনদ পাওয়া যায়নি।" },
      { status: 404 }
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
}
