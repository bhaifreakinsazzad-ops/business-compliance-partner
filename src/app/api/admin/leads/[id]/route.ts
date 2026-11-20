import { NextResponse, type NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { requireAdminSession } from "@/lib/security/session";
import { assertPermission } from "@/lib/security/rbac";
import { hashClientIp } from "@/lib/security/password";
import {
  findForbiddenContentMatch,
  leadStatusUpdateSchema,
} from "@/lib/validation/content";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id?.trim()) {
      return NextResponse.json(
        { success: false, error: "অবৈধ লিড আইডি।" },
        { status: 400 },
      );
    }

    const admin = await requireAdminSession("leads:update");

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: "ডাটাবেজ কনফিগার করা নেই।" },
        { status: 503 },
      );
    }

    let rawBody: unknown;
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "অবৈধ JSON অনুরোধ।" },
        { status: 400 },
      );
    }

    const parsed = leadStatusUpdateSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "ইনপুট যাচাই ব্যর্থ হয়েছে।",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 },
      );
    }

    if (parsed.data.internalNotes) {
      const forbiddenMatch = findForbiddenContentMatch(
        parsed.data.internalNotes,
      );
      if (forbiddenMatch) {
        return NextResponse.json(
          {
            success: false,
            code: "FORBIDDEN_CONTENT",
            error: "নোটের মধ্যে অনুমোদিত নয় এমন শব্দ বা প্যাটার্ন রয়েছে।",
          },
          { status: 422 },
        );
      }
    }

    const existingLead = await prisma.lead.findUnique({
      where: { id },
      select: {
        id: true,
        publicReference: true,
        status: true,
        assignedToId: true,
        contactedAt: true,
        closedAt: true,
      },
    });

    if (!existingLead) {
      return NextResponse.json(
        { success: false, error: "লিড পাওয়া যায়নি।" },
        { status: 404 },
      );
    }

    const nextAssignedToId =
      parsed.data.assignedToId !== undefined
        ? parsed.data.assignedToId || null
        : undefined;

    if (
      nextAssignedToId !== undefined &&
      nextAssignedToId !== existingLead.assignedToId
    ) {
      assertPermission(admin.role, "leads:assign");
    }

    const now = new Date();
    const nextStatus = parsed.data.status;
    const isTerminal =
      nextStatus === "CLOSED" ||
      nextStatus === "CONVERTED" ||
      nextStatus === "SPAM";

    const updateData: Prisma.LeadUncheckedUpdateInput = {
      status: nextStatus,
    };

    if (nextStatus === "CONTACTED" && !existingLead.contactedAt) {
      updateData.contactedAt = now;
    }

    if (isTerminal) {
      updateData.closedAt = existingLead.closedAt ?? now;
    } else if (existingLead.closedAt !== null) {
      updateData.closedAt = null;
    }

    if (parsed.data.internalNotes !== undefined) {
      updateData.internalNotes = parsed.data.internalNotes || null;
    }

    if (nextAssignedToId !== undefined) {
      updateData.assignedToId = nextAssignedToId;
    }

    const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;
    const ipHash = rawIp ? hashClientIp(rawIp) : null;

    const updated = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.update({
        where: { id },
        data: updateData,
        include: {
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: admin.userId,
          actorEmail: admin.email,
          actorRole: admin.role,
          action: "UPDATE_LEAD_STATUS",
          entityType: "Lead",
          entityId: lead.id,
          summary: `Updated lead ${existingLead.publicReference}: ${existingLead.status} -> ${lead.status}`,
          metadata: {
            publicReference: existingLead.publicReference,
            previousStatus: existingLead.status,
            nextStatus: lead.status,
            previousAssignedToId: existingLead.assignedToId,
            nextAssignedToId: lead.assignedToId,
            notesUpdated: parsed.data.internalNotes !== undefined,
          },
          ipHash,
        },
      });

      return lead;
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      const err = error as { statusCode: number; message: string };
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.statusCode },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return NextResponse.json(
          { success: false, error: "লিড পাওয়া যায়নি।" },
          { status: 404 },
        );
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { success: false, error: "নির্বাচিত অ্যাডমিন ব্যবহারকারী সঠিক নয়।" },
          { status: 400 },
        );
      }
    }

    console.error("[Admin Lead Update Error]", error);
    return NextResponse.json(
      { success: false, error: "সার্ভারে সমস্যা হয়েছে।" },
      { status: 500 },
    );
  }
}
