import React from "react";
import { Shield } from "lucide-react";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { requireAdminPageSession } from "@/lib/security/admin-page-guard";
import { AdminUnauthorizedCard } from "@/components/admin/AdminUnauthorizedCard";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const guard = await requireAdminPageSession("audit:view", "/admin/audit");
  if (!guard.authorized) {
    return <AdminUnauthorizedCard role={guard.admin.role} />;
  }

  const dbConfigured = isDatabaseConfigured();
  const [auditLogs, revisions] = dbConfigured
    ? await Promise.all([
        prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.contentRevision.findMany({
          orderBy: { createdAt: "desc" },
          take: 25,
        }),
      ])
    : [[], []];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bn font-bold text-ps-white">
          নিরাপত্তা অডিট লগ ও রিভিশন ইতিহাস
        </h1>
        <p className="text-sm text-ps-ivory/80 mt-1">
          সর্বশেষ ৫০টি অ্যাডমিন অডিট ইভেন্ট এবং ২৫টি কন্টেন্ট রিভিশন।
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ps-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-ps-gold" aria-hidden="true" />
          <span>অডিট লগ ({auditLogs.length})</span>
        </h2>

        {auditLogs.length === 0 ? (
          <div className="p-6 rounded-[16px] bg-ps-navy border border-ps-white/15 text-sm text-ps-ivory/80">
            কোনো অডিট রেকর্ড পাওয়া যায়নি।
          </div>
        ) : (
          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-[12px] bg-ps-navy border border-ps-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-en font-bold px-2 py-0.5 rounded bg-ps-midnight text-ps-gold border border-ps-gold/40">
                      {log.action}
                    </span>
                    <span className="text-xs font-en text-ps-ivory/75">
                      {log.entityType}
                      {log.entityId ? ` #${log.entityId.slice(0, 8)}` : ""}
                    </span>
                  </div>
                  <p className="text-sm text-ps-white">{log.summary}</p>
                  <p className="text-xs font-en text-ps-ivory/70">
                    {log.actorEmail ?? "system"} ({log.actorRole ?? "SYSTEM"})
                  </p>
                </div>
                <time className="text-xs font-en text-ps-ivory/70 shrink-0">
                  {log.createdAt.toISOString()}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-ps-white">
          কন্টেন্ট রিভিশন ({revisions.length})
        </h2>
        {revisions.length === 0 ? (
          <div className="p-6 rounded-[16px] bg-ps-navy border border-ps-white/15 text-sm text-ps-ivory/80">
            কোনো কন্টেন্ট রিভিশন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="space-y-2">
            {revisions.map((rev) => (
              <div
                key={rev.id}
                className="p-3.5 rounded-[12px] bg-ps-navy border border-ps-white/15 flex items-center justify-between gap-3 text-xs font-en"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-ps-midnight text-ps-gold border border-ps-gold/30 font-semibold">
                    {rev.action}
                  </span>
                  <span className="text-ps-white">
                    {rev.entityType} ({rev.entityId})
                  </span>
                </div>
                <span className="text-ps-ivory/70">
                  {rev.createdAt.toISOString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
