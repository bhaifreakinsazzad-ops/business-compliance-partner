import { NextResponse, type NextRequest } from "next/server";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";
import { hashClientIp } from "@/lib/security/password";
import { hasPermission } from "@/lib/security/rbac";
import { getCurrentAdminSession } from "@/lib/security/session";
import {
  buildSafeAttachmentContentDisposition,
  deletePrivateDocument,
  readPrivateDocument,
  StorageConfigurationError,
  StorageIntegrityError,
} from "@/lib/storage/private-documents";

async function canCustomerAccessDocument(
  customerId: string,
  doc: { customerId: string | null; organizationId: string | null },
): Promise<boolean> {
  if (doc.customerId === customerId) return true;
  if (!doc.organizationId) return false;
  const membership = await prisma.organizationMembership.findFirst({
    where: {
      organizationId: doc.organizationId,
      customerId,
    },
    select: { id: true },
  });
  return Boolean(membership);
}

function canAdminDownloadDocument(
  admin: { userId: string; role: "ADMIN" | "EDITOR" | "LEAD_MANAGER" },
  doc: { assignedAdminId: string | null },
): boolean {
  if (hasPermission(admin.role, "documents:admin")) return true;
  if (
    hasPermission(admin.role, "documents:download") &&
    doc.assignedAdminId === admin.userId
  ) {
    return true;
  }
  return false;
}

export async function GET(
  req: NextRequest,
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

    if (!doc || doc.deletedAt) {
      return NextResponse.json(
        { error: "নথিটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    const customerAllowed = customer
      ? await canCustomerAccessDocument(customer.id, doc)
      : false;
    const adminAllowed = admin ? canAdminDownloadDocument(admin, doc) : false;

    if (!customerAllowed && !adminAllowed) {
      return NextResponse.json(
        { error: "এই নথিতে আপনার ডাউনলোড অনুমোদন নেই।" },
        { status: 403 },
      );
    }

    if (doc.quarantineStatus && doc.quarantineStatus !== "CLEAR") {
      return NextResponse.json(
        {
          error: "নিরাপত্তা যাচাইয়ের জন্য নথিটি বর্তমানে কোয়ারেন্টাইনে রয়েছে।",
          code: "DOCUMENT_QUARANTINED",
        },
        { status: 423 },
      );
    }

    const bytes = await readPrivateDocument(doc.fileKey, {
      storageProvider: doc.storageProvider,
      storageBucket: doc.storageBucket,
      expectedSha256: doc.sha256,
    });

    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const ipHash = rawIp ? hashClientIp(rawIp) : null;

    await prisma.auditLog
      .create({
        data: {
          actorId: admin?.userId ?? null,
          actorEmail: admin?.email ?? customer?.email ?? null,
          actorRole: admin?.role ?? null,
          action: "DOWNLOAD_PRIVATE_DOCUMENT",
          entityType: "Document",
          entityId: doc.id,
          summary: `${admin ? `Staff (${admin.role})` : "Customer"} downloaded private document ${doc.publicReference}`,
          metadata: {
            publicReference: doc.publicReference,
            customerId: customer?.id ?? null,
            adminId: admin?.userId ?? null,
          },
          ipHash,
        },
      })
      .catch(() => undefined);

    const mime = doc.mimeType || "application/octet-stream";

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": buildSafeAttachmentContentDisposition(
          doc.publicReference,
          doc.mimeType,
        ),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (err) {
    if (err instanceof StorageConfigurationError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode },
      );
    }
    if (err instanceof StorageIntegrityError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { error: "নথির ফাইল পাওয়া যায়নি বা পড়তে সমস্যা হয়েছে।" },
      { status: 404 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
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
      { error: "নথি সেবা সাময়িকভাবে অনুপলভ্য।" },
      { status: 503 },
    );
  }

  try {
    const doc = await prisma.document.findUnique({
      where: { publicReference: ref },
    });

    if (!doc || doc.deletedAt) {
      return NextResponse.json(
        { error: "নথিটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    const adminCanDelete =
      admin !== null && hasPermission(admin.role, "documents:delete");
    const customerCanDelete =
      customer !== null &&
      doc.customerId === customer.id &&
      doc.status === "PENDING_REVIEW";

    if (!adminCanDelete && !customerCanDelete) {
      return NextResponse.json(
        {
          error:
            "এই নথিটি মুছে ফেলার অনুমোদন নেই বা নথিটি ইতোমধ্যেই পর্যালোচনার আওতায় এসেছে।",
        },
        { status: 403 },
      );
    }

    const rawIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const ipHash = rawIp ? hashClientIp(rawIp) : null;

    await prisma.$transaction(async (tx) => {
      await tx.document.update({
        where: { id: doc.id },
        data: { deletedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          actorId: admin?.userId ?? null,
          actorEmail: admin?.email ?? customer?.email ?? null,
          actorRole: admin?.role ?? null,
          action: "DELETE_PRIVATE_DOCUMENT",
          entityType: "Document",
          entityId: doc.id,
          summary: `${admin ? `Admin (${admin.role})` : "Customer"} deleted document ${doc.publicReference}`,
          metadata: {
            publicReference: doc.publicReference,
          },
          ipHash,
        },
      });
    });

    await deletePrivateDocument(doc.fileKey, {
      storageProvider: doc.storageProvider,
      storageBucket: doc.storageBucket,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[documents/delete] Error:", err);
    return NextResponse.json(
      { error: "নথিটি মুছে ফেলতে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
