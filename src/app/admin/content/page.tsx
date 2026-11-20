import React from "react";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { requireAdminPageSession } from "@/lib/security/admin-page-guard";
import { hasPermission } from "@/lib/security/rbac";
import { AdminUnauthorizedCard } from "@/components/admin/AdminUnauthorizedCard";
import {
  AdminFaqClient,
  type FaqAdminRow,
} from "@/components/admin/AdminFaqClient";
import { SEED_FAQS } from "../../../../prisma/seed-data/faqs";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const guard = await requireAdminPageSession("faqs:manage", "/admin/content");
  if (!guard.authorized) {
    return <AdminUnauthorizedCard role={guard.admin.role} />;
  }

  const dbConfigured = isDatabaseConfigured();
  const canPublish = hasPermission(guard.admin.role, "content:publish");

  let faqs: FaqAdminRow[] = [];

  if (dbConfigured) {
    const dbFaqs = await prisma.faq.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    faqs = dbFaqs.map((f) => ({
      id: f.id,
      questionBn: f.questionBn,
      answerBn: f.answerBn,
      pillar: f.pillar,
      isRegulatory: f.isRegulatory,
      contentStatus: f.contentStatus,
      sortOrder: f.sortOrder,
      verifiedBy: f.verifiedBy,
    }));
  } else {
    faqs = SEED_FAQS.map((f, index) => ({
      id: `seed-faq-${index}`,
      questionBn: f.questionBn,
      answerBn: f.answerBn,
      pillar: f.pillar ?? null,
      isRegulatory: Boolean(f.isRegulatory),
      contentStatus: f.contentStatus,
      sortOrder: f.sortOrder ?? index,
      verifiedBy: null,
    }));
  }

  return (
    <AdminFaqClient
      faqs={faqs}
      canPublish={canPublish}
      dbConfigured={dbConfigured}
    />
  );
}
