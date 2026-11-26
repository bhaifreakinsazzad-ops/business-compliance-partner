import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";
import { generatePublicReference } from "@/lib/security/reference-id";
import {
  deletePrivateDocument,
  MAX_PRIVATE_DOCUMENT_BYTES,
  savePrivateDocument,
  verifyDocumentMagicBytes,
} from "@/lib/storage/private-documents";

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json(
      {
        error: "নথি সংরক্ষণ সেবা সাময়িকভাবে অনুপলভ্য।",
        code: "SERVICE_UNAVAILABLE",
      },
      { status: 503 },
    );
  }

  let savedFileKey: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const rawTitle = (formData.get("title") as string | null)?.trim();
    const rawCategory = (formData.get("category") as string | null)?.trim();
    const caseId = (formData.get("caseId") as string | null)?.trim() || null;
    const requestId = (formData.get("requestId") as string | null)?.trim() || null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "কোনো ফাইল নির্বাচন করা হয়নি।" },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_PRIVATE_DOCUMENT_BYTES) {
      return NextResponse.json(
        { error: "ফাইলের আকার ১০ মেগাবাইটের মধ্যে হতে হবে।" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const verifiedMime = verifyDocumentMagicBytes(buffer, file.type);
    if (!verifiedMime) {
      return NextResponse.json(
        { error: "শুধুমাত্র বৈধ PDF, JPG এবং PNG ফাইল অনুমোদিত।" },
        { status: 400 },
      );
    }

    // Verify ownership of linked caseId / requestId before saving anything
    if (caseId) {
      const ownedCase = await prisma.complianceCase.findFirst({
        where: { id: caseId, customerId: customer.id },
        select: { id: true },
      });
      if (!ownedCase) {
        return NextResponse.json(
          { error: "নির্বাচিত কমপ্লায়েন্স কেসটি আপনার অ্যাকাউন্টের সাথে যুক্ত নয়।" },
          { status: 403 },
        );
      }
    }

    if (requestId) {
      const ownedRequest = await prisma.serviceRequest.findFirst({
        where: { id: requestId, customerId: customer.id },
        select: { id: true },
      });
      if (!ownedRequest) {
        return NextResponse.json(
          { error: "নির্বাচিত সেবা অনুরোধটি আপনার অ্যাকাউন্টের সাথে যুক্ত নয়।" },
          { status: 403 },
        );
      }
    }

    const title = (rawTitle || "ব্যবসায়িক নথি").slice(0, 160);
    const category = (rawCategory || "সাধারণ").slice(0, 80);
    const publicReference = generatePublicReference().replace(/^BCP-/, "DOC-");

    const persisted = await savePrivateDocument({
      customerId: customer.id,
      publicReference,
      buffer,
      verifiedMime,
    });
    savedFileKey = persisted.fileKey;

    const document = await prisma.document.create({
      data: {
        publicReference,
        customerId: customer.id,
        caseId,
        requestId,
        title,
        category,
        fileKey: persisted.fileKey,
        fileUrl: `/api/documents/${publicReference}`,
        fileSizeBytes: persisted.sizeBytes,
        mimeType: verifiedMime,
        status: "PENDING_REVIEW",
      },
    });

    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (err) {
    if (savedFileKey) {
      await deletePrivateDocument(savedFileKey);
    }
    console.error("[documents/upload] Error:", err);
    return NextResponse.json(
      { error: "নথি আপলোড প্রক্রিয়ায় সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json({ documents: [] });
  }

  try {
    const documents = await prisma.document.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch {
    return NextResponse.json({ documents: [] });
  }
}
