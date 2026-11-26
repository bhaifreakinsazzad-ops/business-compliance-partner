import React from "react";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isBooksSchemaReady } from "@/lib/db/schema-ready";
import { requireAdminPageSession } from "@/lib/security/admin-page-guard";
import { hasPermission } from "@/lib/security/rbac";
import { BOOK_PREVIEW_CATALOG, listBookCategories } from "@/lib/books/catalog";
import { AdminUnauthorizedCard } from "@/components/admin/AdminUnauthorizedCard";
import {
  AdminBooksClient,
  type BookAdminRow,
  type BookCategoryOption,
} from "@/components/admin/AdminBooksClient";

export const dynamic = "force-dynamic";

export default async function AdminBooksPage() {
  const guard = await requireAdminPageSession("content:read", "/admin/books");
  if (!guard.authorized) {
    return <AdminUnauthorizedCard role={guard.admin.role} />;
  }

  const dbReady = isDatabaseConfigured() && (await isBooksSchemaReady());
  const canWrite = hasPermission(guard.admin.role, "content:write");
  const canPublish = hasPermission(guard.admin.role, "content:publish");

  let items: BookAdminRow[] = [];
  let categories: BookCategoryOption[] = [];

  if (dbReady) {
    const [dbBooks, dbCategories] = await Promise.all([
      prisma.book.findMany({
        orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
        include: { category: { select: { id: true, nameBn: true } } },
      }),
      prisma.bookCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: { id: true, nameBn: true, slug: true },
      }),
    ]);

    categories = dbCategories;
    items = dbBooks.map((b) => ({
      id: b.id,
      slug: b.slug,
      sku: b.sku,
      titleBn: b.titleBn,
      titleEn: b.titleEn,
      categoryNameBn: b.category.nameBn,
      categoryId: b.categoryId,
      contentStatus: b.contentStatus,
      availabilityStatus: b.availabilityStatus,
      pricePaisa: b.pricePaisa,
      stockQuantity: b.stockQuantity,
      featured: b.featured,
      publicHref: `/books/${b.slug}`,
    }));
  }

  if (items.length === 0) {
    if (categories.length === 0) {
      categories = listBookCategories().map((c) => ({
        id: c.slug,
        nameBn: c.nameBn,
        slug: c.slug,
      }));
    }
    if (!dbReady) {
      items = BOOK_PREVIEW_CATALOG.map((b) => ({
        id: b.id,
        slug: b.slug,
        sku: null,
        titleBn: b.titleBn,
        titleEn: b.titleEn,
        categoryNameBn: b.categoryNameBn,
        categoryId: b.categorySlug,
        contentStatus: "DRAFT",
        availabilityStatus: "UPCOMING",
        pricePaisa: null,
        stockQuantity: 0,
        featured: b.featured,
        publicHref: `/books/${b.slug}`,
      }));
    }
  }

  return (
    <AdminBooksClient
      items={items}
      categories={categories}
      canWrite={canWrite}
      canPublish={canPublish}
      dbConfigured={dbReady}
    />
  );
}
