import React from "react";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { requireAdminPageSession } from "@/lib/security/admin-page-guard";
import { hasPermission } from "@/lib/security/rbac";
import { AdminUnauthorizedCard } from "@/components/admin/AdminUnauthorizedCard";
import {
  AdminCatalogueClient,
  type CatalogueAdminRow,
  type CategoryOption,
} from "@/components/admin/AdminCatalogueClient";
import { SEED_LICENSING } from "../../../../prisma/seed-data/licensing";
import { SEED_CATEGORIES } from "../../../../prisma/seed-data/categories";

export const dynamic = "force-dynamic";

export default async function AdminLicensingPage() {
  const guard = await requireAdminPageSession("content:read", "/admin/licensing");
  if (!guard.authorized) {
    return <AdminUnauthorizedCard role={guard.admin.role} />;
  }

  const dbConfigured = isDatabaseConfigured();
  const canWrite = hasPermission(guard.admin.role, "content:write");
  const canPublish = hasPermission(guard.admin.role, "content:publish");

  let items: CatalogueAdminRow[] = [];
  let categories: CategoryOption[] = [];

  if (dbConfigured) {
    const [dbEntries, dbCategories] = await Promise.all([
      prisma.licensingEntry.findMany({
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
        include: { category: { select: { id: true, nameBn: true } } },
      }),
      prisma.category.findMany({
        where: { pillar: "LICENSING", isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, nameBn: true, slug: true },
      }),
    ]);

    categories = dbCategories;
    items = dbEntries.map((l) => ({
      id: l.id,
      slug: l.slug,
      titleBn: l.titleBn,
      titleEn: l.titleEn,
      summaryBn: l.summaryBn,
      categoryNameBn: l.category.nameBn,
      categoryId: l.categoryId,
      contentStatus: l.contentStatus,
      availabilityStatus: l.availabilityStatus,
      featured: l.featured,
      lastVerifiedAt: l.lastVerifiedAt ? l.lastVerifiedAt.toISOString() : null,
      verifiedBy: l.verifiedBy,
      warningNote: `কর্তৃপক্ষ: ${l.authorityName}`,
      publicHref: `/licensing/${l.slug}`,
    }));
  } else {
    categories = SEED_CATEGORIES.filter((c) => c.pillar === "LICENSING").map((c) => ({
      id: c.slug,
      nameBn: c.nameBn,
      slug: c.slug,
    }));
    items = SEED_LICENSING.map((l) => ({
      id: l.slug,
      slug: l.slug,
      titleBn: l.titleBn,
      titleEn: l.titleEn ?? null,
      summaryBn: l.summaryBn,
      categoryNameBn: l.categorySlug,
      categoryId: l.categorySlug,
      contentStatus: l.contentStatus,
      availabilityStatus: l.availabilityStatus,
      featured: Boolean(l.featured),
      lastVerifiedAt: null,
      verifiedBy: null,
      warningNote: `কর্তৃপক্ষ: ${l.authorityName}`,
      publicHref: `/licensing/${l.slug}`,
    }));
  }

  return (
    <AdminCatalogueClient
      resource="licensing"
      titleBn="লাইসেন্সিং ডিরেক্টরি ব্যবস্থাপনা (Licensing)"
      items={items}
      categories={categories}
      canWrite={canWrite}
      canPublish={canPublish}
      dbConfigured={dbConfigured}
    />
  );
}
