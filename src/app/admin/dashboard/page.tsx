import React from "react";
import Link from "next/link";
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Download,
  ArrowRight,
  Database,
  ExternalLink,
  Shield,
} from "lucide-react";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { hasPermission } from "@/lib/security/rbac";
import { requireAdminPageSession } from "@/lib/security/admin-page-guard";
import { AdminUnauthorizedCard } from "@/components/admin/AdminUnauthorizedCard";
import { SEED_COURSES } from "../../../../prisma/seed-data/courses";
import { SEED_SERVICES } from "../../../../prisma/seed-data/services";
import { SEED_LICENSING } from "../../../../prisma/seed-data/licensing";

interface CatalogueSummary {
  coursesTotal: number;
  coursesPublished: number;
  servicesTotal: number;
  servicesPublished: number;
  licensingTotal: number;
  licensingPublished: number;
  source: "live" | "seed";
}

function getSeedCatalogueSummary(): CatalogueSummary {
  return {
    coursesTotal: SEED_COURSES.length,
    coursesPublished: SEED_COURSES.filter(
      (item) => item.contentStatus === "PUBLISHED",
    ).length,
    servicesTotal: SEED_SERVICES.length,
    servicesPublished: SEED_SERVICES.filter(
      (item) => item.contentStatus === "PUBLISHED",
    ).length,
    licensingTotal: SEED_LICENSING.length,
    licensingPublished: SEED_LICENSING.filter(
      (item) => item.contentStatus === "PUBLISHED",
    ).length,
    source: "seed",
  };
}

export default async function AdminDashboardPage() {
  const guard = await requireAdminPageSession(
    "dashboard:view",
    "/admin/dashboard",
  );
  if (!guard.authorized) {
    return <AdminUnauthorizedCard role={guard.admin.role} />;
  }

  const { admin } = guard;
  const canViewLeads = hasPermission(admin.role, "leads:view");
  const canExportLeads = hasPermission(admin.role, "leads:export");
  const canViewAudit = hasPermission(admin.role, "audit:view");

  const dbOk = isDatabaseConfigured();

  let totalLeads = 0;
  let newLeads = 0;
  let activePipelineLeads = 0;
  let convertedLeads = 0;
  let recentAuditCount = 0;
  let catalogue = getSeedCatalogueSummary();

  if (dbOk) {
    try {
      const [
        leadStats,
        auditCount,
        coursesTotal,
        coursesPublished,
        servicesTotal,
        servicesPublished,
        licensingTotal,
        licensingPublished,
      ] = await Promise.all([
        canViewLeads
          ? Promise.all([
              prisma.lead.count(),
              prisma.lead.count({ where: { status: "NEW" } }),
              prisma.lead.count({
                where: { status: { in: ["REVIEWED", "CONTACTED", "QUALIFIED"] } },
              }),
              prisma.lead.count({ where: { status: "CONVERTED" } }),
            ])
          : Promise.resolve<[number, number, number, number]>([0, 0, 0, 0]),
        canViewAudit ? prisma.auditLog.count() : Promise.resolve(0),
        prisma.course.count(),
        prisma.course.count({ where: { contentStatus: "PUBLISHED" } }),
        prisma.service.count(),
        prisma.service.count({ where: { contentStatus: "PUBLISHED" } }),
        prisma.licensingEntry.count(),
        prisma.licensingEntry.count({ where: { contentStatus: "PUBLISHED" } }),
      ]);

      [totalLeads, newLeads, activePipelineLeads, convertedLeads] = leadStats;
      recentAuditCount = auditCount;
      catalogue = {
        coursesTotal,
        coursesPublished,
        servicesTotal,
        servicesPublished,
        licensingTotal,
        licensingPublished,
        source: "live",
      };
    } catch (e) {
      console.error("[Dashboard Query Error]", e);
    }
  }

  const sourceBadgeText =
    catalogue.source === "live" ? "Live DB" : "Seed Fallback";

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bn font-bold text-ps-white">
            অ্যাডমিন ওভারভিউ ড্যাশবোর্ড
          </h1>
          <p className="text-sm text-ps-ivory/80 mt-1">
            পেপারওয়ার্ক স্কোয়াড ক্লায়েন্ট ইনকোয়ারি, ক্যাটালগ স্থিতি এবং নিরাপত্তা পর্যবেক্ষণ
          </p>
        </div>
        {canViewAudit && (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-[12px] bg-ps-navy border border-ps-gold/40 text-xs text-ps-ivory">
            <Shield className="w-4 h-4 text-ps-gold" aria-hidden="true" />
            <span>অডিট লগ রেকর্ড:</span>
            <span className="font-en font-bold text-ps-gold">
              {recentAuditCount}
            </span>
          </div>
        )}
      </div>

      {/* Database Connection Notice */}
      {!dbOk ? (
        <div className="p-4 rounded-[16px] bg-amber-950/50 border border-amber-400/40 flex items-start gap-4">
          <Database
            className="w-5 h-5 text-ps-gold flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="text-sm">
            <h2 className="font-semibold text-ps-gold">
              পোস্টগ্রেসকিউএল ডাটাবেজ এখনও সংযুক্ত হয়নি
            </h2>
            <p className="text-ps-ivory/90 mt-1">
              সিস্টেমটি বর্তমানে সিড মেমোরি মোডে কাজ করছে। নতুন লিড সংগ্রহ ও স্থায়ী সংরক্ষণের জন্য অনুগ্রহ করে{" "}
              <code className="font-en text-ps-ivory bg-ps-midnight px-1.5 py-0.5 rounded text-xs border border-ps-white/15">
                docker compose up -d
              </code>{" "}
              চালান অথবা{" "}
              <code className="font-en text-ps-ivory bg-ps-midnight px-1.5 py-0.5 rounded text-xs border border-ps-white/15">
                DATABASE_URL
              </code>{" "}
              কনফিগার করুন।
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-[12px] bg-emerald-950/40 border border-emerald-400/40 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-100">
          <span className="flex items-center gap-2">
            <CheckCircle2
              className="w-4 h-4 text-emerald-300"
              aria-hidden="true"
            />
            <span>PostgreSQL ডাটাবেজ সক্রিয় এবং নিরাপদ সংযোগ বিদ্যমান।</span>
          </span>
          <span className="font-en text-[11px] text-emerald-200">
            DB Status: Connected
          </span>
        </div>
      )}

      {/* Quick Metrics (RBAC-gated on leads:view) */}
      {canViewLeads ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-[16px] bg-ps-navy border border-ps-white/15">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ps-ivory/85 uppercase tracking-wider">
                মোট ইনকোয়ারি
              </span>
              <Users className="w-5 h-5 text-ps-gold" aria-hidden="true" />
            </div>
            <div className="mt-3 text-3xl font-bold font-en text-ps-white">
              {totalLeads}
            </div>
            <p className="text-xs text-ps-ivory/80 mt-1">সর্বমোট প্রাপ্ত আবেদন</p>
          </div>

          <div className="p-5 rounded-[16px] bg-ps-navy border border-ps-white/15">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ps-gold uppercase tracking-wider">
                নতুন আবেদন
              </span>
              <Clock className="w-5 h-5 text-ps-gold" aria-hidden="true" />
            </div>
            <div className="mt-3 text-3xl font-bold font-en text-ps-gold">
              {newLeads}
            </div>
            <p className="text-xs text-ps-ivory/80 mt-1">পর্যালোচনার অপেক্ষায়</p>
          </div>

          <div className="p-5 rounded-[16px] bg-ps-navy border border-ps-white/15">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-200 uppercase tracking-wider">
                চলমান প্রসেস
              </span>
              <AlertTriangle
                className="w-5 h-5 text-sky-300"
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 text-3xl font-bold font-en text-sky-200">
              {activePipelineLeads}
            </div>
            <p className="text-xs text-ps-ivory/80 mt-1">
              পর্যালোচিত, যোগাযোগকৃত ও যোগ্য
            </p>
          </div>

          <div className="p-5 rounded-[16px] bg-ps-navy border border-ps-white/15">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                সফল কনভার্সন
              </span>
              <CheckCircle2
                className="w-5 h-5 text-emerald-300"
                aria-hidden="true"
              />
            </div>
            <div className="mt-3 text-3xl font-bold font-en text-emerald-200">
              {convertedLeads}
            </div>
            <p className="text-xs text-ps-ivory/80 mt-1">সফলভাবে সমাধানকৃত</p>
          </div>
        </div>
      ) : (
        <div className="p-5 rounded-[16px] bg-ps-navy border border-ps-white/15 text-sm text-ps-ivory/85">
          লিড এবং ক্লায়েন্ট ইনকোয়ারি মেট্রিক্স শুধুমাত্র অনুমোদিত লিড ম্যানেজার বা অ্যাডমিনদের জন্য প্রদর্শিত হয়।
        </div>
      )}

      {/* Catalogue & Content Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[16px] bg-ps-navy border border-ps-white/15">
          <h2 className="font-semibold text-ps-white text-base mb-1">
            প্রফেশনাল কোর্স ক্যাটালগ
          </h2>
          <p className="text-xs text-ps-ivory/80 mb-4">
            ট্যাক্স, ভ্যাট, কাস্টমস ও ই-জিপি প্রশিক্ষণ ট্র্যাক
          </p>
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <span className="text-3xl font-bold font-en text-ps-white">
              {catalogue.coursesTotal}
            </span>
            <span className="text-xs font-en text-emerald-200 bg-emerald-950/70 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
              {sourceBadgeText}
            </span>
          </div>
          <p className="text-xs text-ps-ivory/80 mb-4">
            মোট {catalogue.coursesTotal}টি (প্রকাশিত {catalogue.coursesPublished}টি)
          </p>
          <Link
            href="/courses"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-ps-gold hover:underline"
          >
            <span>পাবলিক ক্যাটালগ দেখুন</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>

        <div className="p-6 rounded-[16px] bg-ps-navy border border-ps-white/15">
          <h2 className="font-semibold text-ps-white text-base mb-1">
            বিজনেস সার্ভিসসমূহ
          </h2>
          <p className="text-xs text-ps-ivory/80 mb-4">
            কমপ্লায়েন্স, অ্যাকাউন্টস ও বিজনেস সলিউশন
          </p>
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <span className="text-3xl font-bold font-en text-ps-white">
              {catalogue.servicesTotal}
            </span>
            <span className="text-xs font-en text-emerald-200 bg-emerald-950/70 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
              {sourceBadgeText}
            </span>
          </div>
          <p className="text-xs text-ps-ivory/80 mb-4">
            মোট {catalogue.servicesTotal}টি (প্রকাশিত {catalogue.servicesPublished}টি)
          </p>
          <Link
            href="/services"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-ps-gold hover:underline"
          >
            <span>পাবলিক সার্ভিসসমূহ দেখুন</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>

        <div className="p-6 rounded-[16px] bg-ps-navy border border-ps-white/15">
          <h2 className="font-semibold text-ps-white text-base mb-1">
            লাইসেন্সিং ডিরেক্টরি
          </h2>
          <p className="text-xs text-ps-ivory/80 mb-4">
            ট্রেড, ফ্যাক্টরি, ফায়ার, পরিবেশ ও আমদানি-রপ্তানি
          </p>
          <div className="flex items-baseline justify-between gap-2 mb-2">
            <span className="text-3xl font-bold font-en text-ps-white">
              {catalogue.licensingTotal}
            </span>
            <span className="text-xs font-en text-emerald-200 bg-emerald-950/70 border border-emerald-400/40 px-2.5 py-0.5 rounded-full">
              {sourceBadgeText}
            </span>
          </div>
          <p className="text-xs text-ps-ivory/80 mb-4">
            মোট {catalogue.licensingTotal}টি (প্রকাশিত {catalogue.licensingPublished}টি)
          </p>
          <Link
            href="/licensing"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-ps-gold hover:underline"
          >
            <span>লাইসেন্সিং পাতা দেখুন</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {/* RBAC-gated Action Banner */}
      {(canViewLeads || canExportLeads) && (
        <div className="p-6 rounded-[16px] bg-ps-navy border border-ps-gold/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bn font-semibold text-ps-white">
              ক্লায়েন্ট ইনকোয়ারি ও লিড পর্যালোচনা করুন
            </h2>
            <p className="text-sm text-ps-ivory/80 mt-1">
              আবেদনকারীদের তথ্য, মোবাইল নম্বর এবং কাঙ্ক্ষিত সার্ভিসের বিবরণ দেখুন ও নিরাপদ সিএসভি এক্সপোর্ট করুন।
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {canViewLeads && (
              <Link
                href="/admin/leads"
                className="min-h-[44px] py-2.5 px-4 bg-ps-gold hover:bg-ps-gold/90 text-ps-midnight font-semibold rounded-[12px] text-sm inline-flex items-center gap-2 transition-colors"
              >
                <span>ইনকোয়ারি লিস্ট দেখুন</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
            {canExportLeads && (
              <a
                href="/api/admin/leads?format=csv"
                download
                className="min-h-[44px] py-2.5 px-4 bg-ps-midnight hover:bg-ps-midnight/80 text-ps-ivory border border-ps-white/25 rounded-[12px] text-sm inline-flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4 text-ps-gold" aria-hidden="true" />
                <span>CSV এক্সপোর্ট</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
