import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ cases: [] });
  }

  const cases = await prisma.complianceCase.findMany({
    where: { customerId: customer.id },
    include: { milestones: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ cases });
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  try {
    const { titleBn, categorySlug, authorityName, organizationId } = await req.json();
    if (!titleBn || !categorySlug) {
      return NextResponse.json(
        { error: "কেসের শিরোনাম ও ক্যাটাগরি প্রয়োজন।" },
        { status: 400 }
      );
    }

    const publicReference = `CASE-${Date.now()}`;

    if (!isDatabaseConfigured()) {
      return NextResponse.json({
        success: true,
        case: {
          publicReference,
          titleBn,
          categorySlug,
          status: "ASSESSMENT_PENDING",
        },
      });
    }

    const newCase = await prisma.complianceCase.create({
      data: {
        publicReference,
        customerId: customer.id,
        organizationId: organizationId || null,
        titleBn,
        categorySlug,
        authorityName: authorityName || null,
        status: "ASSESSMENT_PENDING",
        milestones: {
          create: [
            { titleBn: "প্রাথমিক তথ্য যাচাই", status: "PENDING", sortOrder: 1 },
            { titleBn: "প্রয়োজনীয় নথি পর্যালোচনা", status: "PENDING", sortOrder: 2 },
            { titleBn: "কর্তৃপক্ষের নিকট দাখিল", status: "PENDING", sortOrder: 3 },
            { titleBn: "চূড়ান্ত অনুমোদন ও সনদ", status: "PENDING", sortOrder: 4 },
          ],
        },
      },
      include: { milestones: true },
    });

    return NextResponse.json({ success: true, case: newCase });
  } catch (err) {
    console.error("[compliance/create] Error:", err);
    return NextResponse.json(
      { error: "কমপ্লায়েন্স কেস খুলতে সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}
