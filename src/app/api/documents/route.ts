import { NextRequest, NextResponse } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "ব্যবসায়িক নথি";
    const category = (formData.get("category") as string) || "সাধারণ";
    const caseId = formData.get("caseId") as string | null;
    const requestId = formData.get("requestId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "কোনো ফাইল নির্বাচন করা হয়নি।" },
        { status: 400 }
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "শুধুমাত্র PDF, JPG এবং PNG ফাইল অনুমোদিত।" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "ফাইলের আকার সর্বোচ্চ ১০ মেগাবাইট হতে পারবে।" },
        { status: 400 }
      );
    }

    const publicReference = `DOC-${Date.now()}`;
    const fileKey = `private/customers/${customer.id}/${publicReference}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const fileUrl = `/api/documents/${publicReference}`;

    if (isDatabaseConfigured()) {
      const document = await prisma.document.create({
        data: {
          publicReference,
          customerId: customer.id,
          caseId: caseId || null,
          requestId: requestId || null,
          title,
          category,
          fileKey,
          fileUrl,
          fileSizeBytes: file.size,
          mimeType: file.type,
          status: "PENDING_REVIEW",
        },
      });

      return NextResponse.json({ success: true, document });
    }

    return NextResponse.json({
      success: true,
      document: {
        publicReference,
        title,
        category,
        fileSizeBytes: file.size,
        status: "PENDING_REVIEW",
      },
      message: "নথি সফলভাবে গ্রহণ করা হয়েছে এবং পর্যালোচনার অপেক্ষায় রয়েছে।",
    });
  } catch (err) {
    console.error("[documents/upload] Error:", err);
    return NextResponse.json(
      { error: "নথি আপলোড প্রক্রিয়ায় সমস্যা হয়েছে।" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
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
