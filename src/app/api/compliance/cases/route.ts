import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";
import { generatePublicReference } from "@/lib/security/reference-id";

const createCaseSchema = z.object({
  titleBn: z.string().trim().min(3).max(200),
  categorySlug: z.string().trim().min(2).max(120),
  authorityName: z.string().trim().max(180).optional(),
  organizationId: z.string().trim().optional(),
});

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json({ cases: [] });
  }

  try {
    const cases = await prisma.complianceCase.findMany({
      where: { customerId: customer.id },
      include: { milestones: { orderBy: { sortOrder: "asc" } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ cases });
  } catch {
    return NextResponse.json({ cases: [] });
  }
}

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json(
      { error: "কমপ্লায়েন্স কেস সেবা সাময়িকভাবে অনুপলভ্য।" },
      { status: 503 },
    );
  }

  let body: z.infer<typeof createCaseSchema>;
  try {
    const raw = await req.json();
    const parsed = createCaseSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "কেসের শিরোনাম ও ক্যাটাগরি প্রয়োজন।" },
        { status: 400 },
      );
    }
    body = parsed.data;
  } catch {
    return NextResponse.json({ error: "অবৈধ JSON রিকোয়েস্ট।" }, { status: 400 });
  }

  // Enforce organization membership ownership if organizationId supplied
  if (body.organizationId) {
    const isMember = customer.organizations.some(
      (org) => org.id === body.organizationId,
    );
    if (!isMember) {
      return NextResponse.json(
        { error: "নির্বাচিত প্রতিষ্ঠানে আপনার প্রবেশাধিকার নেই।" },
        { status: 403 },
      );
    }
  }

  try {
    const publicReference = generatePublicReference().replace(/^BCP-/, "CASE-");

    const newCase = await prisma.complianceCase.create({
      data: {
        publicReference,
        customerId: customer.id,
        organizationId: body.organizationId || null,
        titleBn: body.titleBn,
        categorySlug: body.categorySlug,
        authorityName: body.authorityName || null,
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

    return NextResponse.json({ success: true, case: newCase }, { status: 201 });
  } catch (err) {
    console.error("[compliance/create] Error:", err);
    return NextResponse.json(
      { error: "কমপ্লায়েন্স কেস খুলতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
