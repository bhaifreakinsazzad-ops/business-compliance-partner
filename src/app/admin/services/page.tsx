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
import { SEED_SERVICES } from "../../../../prisma/seed-data/services";
import { SEED_CATEGORIES } from "../../../../prisma/seed-data/categories";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const guard = await requireAdminPageSession("content:read", "/admin/services");
  if (!guard.authorized) {
    return <AdminUnauthorizedCard role={guard.admin.role} />;
  }

  const dbConfigured = isDatabaseConfigured();
  const canWrite = hasPermission(guard.admin.role, "content:write");
  const canPublish = hasPermission(guard.admin.role, "content:publish");

  let items: CatalogueAdminRow[] = [];
  let categories: CategoryOption[] = [];

  if (dbConfigured) {
    const [dbServices, dbCategories] = await Promise.all([
      prisma.service.findMany({
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
        include: { category: { select: { id: true, nameBn: true } } },
      }),
      prisma.category.findMany({
        where: { pillar: "SERVICES", isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, nameBn: true, slug: true },
      }),
    ]);

    categories = dbCategories;
    items = dbServices.map((s) => ({
      id: s.id,
      slug: s.slug,
      titleBn: s.titleBn,
      titleEn: s.titleEn,
      summaryBn: s.summaryBn,
      categoryNameBn: s.category.nameBn,
      categoryId: s.categoryId,
      contentStatus: s.contentStatus,
      availabilityStatus: s.availabilityStatus,
      featured: s.featured,
      lastVerifiedAt: s.lastVerifiedAt ? s.lastVerifiedAt.toISOString() : null,
      verifiedBy: s.verifiedBy,
      warningNote: s.requiresSpecialist
        ? "বিশেষজ্ঞ / অনুমোদিত পেশাদারের পর্যালোচনা প্রয়োজন"
        : null,
      publicHref: `/services/${s.slug}`,
    }));
  } else {
    categories = SEED_CATEGORIES.filter((c) => c.pillar === "SERVICES").map((c) => ({
      id: c.slug,
      nameBn: c.nameBn,
      slug: c.slug,
    }));
    items = SEED_SERVICES.map((s) => ({
      id: s.slug,
      slug: s.slug,
      titleBn: s.titleBn,
      titleEn: s.titleEn ?? null,
      summaryBn: s.summaryBn,
      categoryNameBn: s.categorySlug,
      categoryId: s.categorySlug,
      contentStatus: s.contentStatus,
      availabilityStatus: s.availabilityStatus,
      featured: Boolean(s.featured),
      lastVerifiedAt: null,
      verifiedBy: null,
      warningNote: s.requiresSpecialist
        ? "বিশেষজ্ঞ / অনুমোদিত পেশাদারের পর্যালোচনা প্রয়োজন"
        : null,
      publicHref: `/services/${s.slug}`,
    }));
  }

  return (
    <AdminCatalogueClient
      resource="services"
      titleBn="পেশাদার সেবা ব্যবস্থাপনা (Services)"
      items={items}
      categories={categories}
      canWrite={canWrite}
      canPublish={canPublish}
      dbConfigured={dbConfigured}
    />
  );
}
