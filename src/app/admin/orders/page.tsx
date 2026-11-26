import React from "react";
import { toPaisa } from "@/lib/commerce/payments";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { isCoreCommerceSchemaReady } from "@/lib/db/schema-ready";
import { requireAdminPageSession } from "@/lib/security/admin-page-guard";
import { hasPermission } from "@/lib/security/rbac";
import { AdminUnauthorizedCard } from "@/components/admin/AdminUnauthorizedCard";
import {
  AdminOrdersClient,
  type AdminOrderRow,
} from "@/components/admin/AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const guard = await requireAdminPageSession("orders:manage", "/admin/orders");
  if (!guard.authorized) {
    return <AdminUnauthorizedCard role={guard.admin.role} />;
  }

  const dbReady =
    isDatabaseConfigured() && (await isCoreCommerceSchemaReady());
  const canCancel = hasPermission(guard.admin.role, "orders:cancel");

  let rows: AdminOrderRow[] = [];

  if (dbReady) {
    const orders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        bookItems: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    rows = orders.map((o) => ({
      id: o.id,
      publicReference: o.publicReference,
      orderKind: o.orderKind,
      status: o.status,
      paymentStatus: o.paymentStatus,
      totalPaisa: o.totalPaisa ?? toPaisa(o.totalBdt),
      customerEmail: o.customer?.email ?? null,
      customerName: o.customer?.name ?? null,
      shippingAddress: o.shippingAddress,
      itemCount: o.bookItems.length,
      createdAt: o.createdAt.toISOString(),
    }));
  }

  return (
    <AdminOrdersClient
      orders={rows}
      canCancel={canCancel}
      dbConfigured={dbReady}
    />
  );
}
