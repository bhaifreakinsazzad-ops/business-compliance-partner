import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { hashClientIp } from "@/lib/security/password";
import { assertPermission } from "@/lib/security/rbac";
import { requireAdminSession } from "@/lib/security/session";
import { handleAdminApiError } from "@/lib/services/admin-content";

const adminDocumentPatchSchema = z.object({
  status: z.enum(["PENDING_REVIEW", "VERIFIED", "REJECTED"]).optional(),
  rejectionReason: z.string().trim().max(500).optional().nullable(),
  quarantineStatus: z.enum(["CLEAR", "QUARANTINED"]).optional(),
  assignedAdminId: z.string().trim().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ ref: string }> },
) {
  try {
    const admin = await requireAdminSession("documents:review");
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { error: "ডাটাবেজ কনফিগার করা নেই।" },
        { status: 503 },
      );
    }

    const { ref } = await context.params;
    const raw = await request.json().catch(() => null);
    const parsed = adminDocumentPatchSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "সঠিক ডকুমেন্ট রিভিউ তথ্য দিন।" },
        { status: 400 },
      );
    }

    const doc = await prisma.document.findUnique({
      where: { publicReference: ref },
    });
    if (!doc || doc.deletedAt) {
      return NextResponse.json(
        { error: "নথিটি খুঁজে পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    if (parsed.data.quarantineStatus !== undefined) {
      assertPermission(admin.role, "documents:admin");
    }
    if (parsed.data.assignedAdminId !== undefined) {
      assertPermission(admin.role, "documents:assign");
    }

    const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;
    const ipHash = rawIp ? hashClientIp(rawIp) : null;

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.document.update({
        where: { id: doc.id },
        data: {
          ...(parsed.data.status !== undefined
            ? {
                status: parsed.data.status,
                reviewedById: admin.userId,
                reviewedAt: new Date(),
              }
            : {}),
          ...(parsed.data.rejectionReason !== undefined
            ? { rejectionReason: parsed.data.rejectionReason }
            : {}),
          ...(parsed.data.quarantineStatus !== undefined
            ? { quarantineStatus: parsed.data.quarantineStatus }
            : {}),
          ...(parsed.data.assignedAdminId !== undefined
            ? { assignedAdminId: parsed.data.assignedAdminId || null }
            : {}),
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: admin.userId,
          actorEmail: admin.email,
          actorRole: admin.role,
          action: "REVIEW_PRIVATE_DOCUMENT",
          entityType: "Document",
          entityId: doc.id,
          summary: `Reviewed document ${doc.publicReference} (${next.status}, quarantine=${next.quarantineStatus})`,
          metadata: {
            publicReference: doc.publicReference,
            previousStatus: doc.status,
            nextStatus: next.status,
            quarantineStatus: next.quarantineStatus,
            assignedAdminId: next.assignedAdminId,
          },
          ipHash,
        },
      });

      return next;
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (error) {
    return handleAdminApiError(error);
  }
}
