import { NextResponse, type NextRequest } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";
import { getCurrentAdminSession } from "@/lib/security/session";
import { readPrivateDocument } from "@/lib/storage/private-documents";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ ref: string }> },
) {
  const { ref } = await context.params;
  if (!ref || ref.length > 100) {
    return NextResponse.json({ error: "অবৈধ নথি রেফারেন্স।" }, { status: 400 });
  }

  const [customer, admin] = await Promise.all([
    getCurrentCustomer(),
    getCurrentAdminSession(),
  ]);

  if (!customer && !admin) {
    return NextResponse.json({ error: "অননুমোদিত অনুরোধ।" }, { status: 401 });
  }

  if (!isDatabaseConfigured() || !(await isCoreCommerceSchemaReady())) {
    return NextResponse.json(
      { error: "নথি ডাউনলোড সেবা সাময়িকভাবে অনুপলভ্য।" },
      { status: 503 },
    );
  }

  try {
    const doc = await prisma.document.findUnique({
      where: { publicReference: ref },
    });

    if (!doc) {
      return NextResponse.json(
        { error: "নথিটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    // Strict ownership enforcement unless staff admin session is present
    if (!admin && doc.customerId !== customer?.id) {
      return NextResponse.json(
        { error: "এই নথিতে আপনার প্রবেশাধিকার নেই।" },
        { status: 403 },
      );
    }

    const bytes = await readPrivateDocument(doc.fileKey);
    const mime = doc.mimeType || "application/octet-stream";
    const ext =
      mime === "application/pdf"
        ? "pdf"
        : mime === "image/png"
          ? "png"
          : mime === "image/jpeg"
            ? "jpg"
            : "bin";

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `inline; filename="${doc.publicReference}.${ext}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "নথির ফাইল পাওয়া যায়নি বা পড়তে সমস্যা হয়েছে।" },
      { status: 404 },
    );
  }
}
