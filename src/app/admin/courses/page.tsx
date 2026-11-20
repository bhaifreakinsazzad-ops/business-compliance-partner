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
import { SEED_COURSES } from "../../../../prisma/seed-data/courses";
import { SEED_CATEGORIES } from "../../../../prisma/seed-data/categories";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const guard = await requireAdminPageSession("content:read", "/admin/courses");
  if (!guard.authorized) {
    return <AdminUnauthorizedCard role={guard.admin.role} />;
  }

  const dbConfigured = isDatabaseConfigured();
  const canWrite = hasPermission(guard.admin.role, "content:write");
  const canPublish = hasPermission(guard.admin.role, "content:publish");

  let items: CatalogueAdminRow[] = [];
  let categories: CategoryOption[] = [];

  if (dbConfigured) {
    const [dbCourses, dbCategories] = await Promise.all([
      prisma.course.findMany({
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
        include: { category: { select: { id: true, nameBn: true } } },
      }),
      prisma.category.findMany({
        where: { pillar: "COURSES", isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, nameBn: true, slug: true },
      }),
    ]);

    categories = dbCategories;
    items = dbCourses.map((c) => ({
      id: c.id,
      slug: c.slug,
      titleBn: c.titleBn,
      titleEn: c.titleEn,
      summaryBn: c.summaryBn,
      categoryNameBn: c.category.nameBn,
      categoryId: c.categoryId,
      contentStatus: c.contentStatus,
      availabilityStatus: c.availabilityStatus,
      featured: c.featured,
      lastVerifiedAt: c.lastVerifiedAt ? c.lastVerifiedAt.toISOString() : null,
      verifiedBy: c.verifiedBy,
      warningNote:
        !c.feeDisplay && !c.duration && !c.instructorId
          ? "ফি, সময়কাল ও প্রশিক্ষক ক্লায়েন্ট কনফার্মেশনের অপেক্ষায় (Mode A)"
          : null,
      publicHref: `/courses/${c.slug}`,
    }));
  } else {
    categories = SEED_CATEGORIES.filter((c) => c.pillar === "COURSES").map((c) => ({
      id: c.slug,
      nameBn: c.nameBn,
      slug: c.slug,
    }));
    items = SEED_COURSES.map((c) => ({
      id: c.slug,
      slug: c.slug,
      titleBn: c.titleBn,
      titleEn: c.titleEn ?? null,
      summaryBn: c.summaryBn,
      categoryNameBn: c.categorySlug,
      categoryId: c.categorySlug,
      contentStatus: c.contentStatus,
      availabilityStatus: c.availabilityStatus,
      featured: Boolean(c.featured),
      lastVerifiedAt: null,
      verifiedBy: null,
      warningNote:
        "ফি, সময়কাল ও প্রশিক্ষক ক্লায়েন্ট কনফার্মেশনের অপেক্ষায় (Seed)",
      publicHref: `/courses/${c.slug}`,
    }));
  }

  return (
    <AdminCatalogueClient
      resource="courses"
      titleBn="কোর্স ক্যাটালগ ব্যবস্থাপনা (Courses)"
      items={items}
      categories={categories}
      canWrite={canWrite}
      canPublish={canPublish}
      dbConfigured={dbConfigured}
    />
  );
}
