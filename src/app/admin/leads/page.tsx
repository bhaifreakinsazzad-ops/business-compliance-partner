import React from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Download,
  Phone,
  Mail,
  MapPin,
  Database,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Prisma } from "@prisma/client";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { hasPermission } from "@/lib/security/rbac";
import { requireAdminPageSession } from "@/lib/security/admin-page-guard";
import { LEAD_STATUS_ENUM } from "@/lib/validation/content";
import { PILLAR_ENUM } from "@/lib/validation/lead";
import { AdminUnauthorizedCard } from "@/components/admin/AdminUnauthorizedCard";
import { LeadStatusUpdater } from "@/components/admin/LeadStatusUpdater";
import type { LeadStatusValue, Pillar } from "@/types/domain";

interface LeadsPageProps {
  searchParams: Promise<{
    status?: string;
    pillar?: string;
    q?: string;
    page?: string;
  }>;
}

const PAGE_SIZE = 25;

const STATUS_LABELS: Record<
  LeadStatusValue,
  { label: string; badgeClass: string }
> = {
  NEW: {
    label: "নতুন আবেদন (NEW)",
    badgeClass: "bg-amber-950/80 text-amber-200 border-amber-400/50",
  },
  REVIEWED: {
    label: "পর্যালোচিত (REVIEWED)",
    badgeClass: "bg-indigo-950/80 text-indigo-200 border-indigo-400/50",
  },
  CONTACTED: {
    label: "যোগাযোগকৃত (CONTACTED)",
    badgeClass: "bg-sky-950/80 text-sky-200 border-sky-400/50",
  },
  QUALIFIED: {
    label: "যোগ্য (QUALIFIED)",
    badgeClass: "bg-teal-950/80 text-teal-200 border-teal-400/50",
  },
  CONVERTED: {
    label: "সফল (CONVERTED)",
    badgeClass: "bg-emerald-950/80 text-emerald-200 border-emerald-400/50",
  },
  CLOSED: {
    label: "সমাপ্ত (CLOSED)",
    badgeClass: "bg-ps-midnight text-ps-ivory/85 border-ps-white/25",
  },
  SPAM: {
    label: "স্প্যাম (SPAM)",
    badgeClass: "bg-rose-950/80 text-rose-200 border-rose-400/50",
  },
};

const STATUS_TABS: Array<{ key: "" | LeadStatusValue; label: string }> = [
  { key: "", label: "সকল" },
  { key: "NEW", label: "নতুন (NEW)" },
  { key: "REVIEWED", label: "পর্যালোচিত" },
  { key: "CONTACTED", label: "যোগাযোগকৃত" },
  { key: "QUALIFIED", label: "যোগ্য" },
  { key: "CONVERTED", label: "সফল" },
  { key: "CLOSED", label: "সমাপ্ত" },
  { key: "SPAM", label: "স্প্যাম" },
];

const PILLAR_TABS: Array<{ key: "" | Pillar; label: string }> = [
  { key: "", label: "সকল পিলার" },
  { key: "CONSULTANCY", label: "কনসালটেন্সি" },
  { key: "COURSES", label: "কোর্স" },
  { key: "SERVICES", label: "সার্ভিস" },
  { key: "LICENSING", label: "লাইসেন্সিং" },
];

function buildLeadsHref(params: {
  status?: string;
  pillar?: string;
  q?: string;
  page?: number;
}): string {
  const qs = new URLSearchParams();
  if (params.status) qs.set("status", params.status);
  if (params.pillar) qs.set("pillar", params.pillar);
  if (params.q) qs.set("q", params.q);
  if (params.page && params.page > 1) qs.set("page", String(params.page));
  const query = qs.toString();
  return query ? `/admin/leads?${query}` : "/admin/leads";
}

function buildCsvHref(params: {
  status?: string;
  pillar?: string;
  q?: string;
}): string {
  const qs = new URLSearchParams({ format: "csv" });
  if (params.status) qs.set("status", params.status);
  if (params.pillar) qs.set("pillar", params.pillar);
  if (params.q) qs.set("q", params.q);
  return `/api/admin/leads?${qs.toString()}`;
}

export default async function AdminLeadsPage({ searchParams }: LeadsPageProps) {
  const guard = await requireAdminPageSession("leads:view", "/admin/leads");
  if (!guard.authorized) {
    return <AdminUnauthorizedCard role={guard.admin.role} />;
  }

  const { admin } = guard;
  const canExport = hasPermission(admin.role, "leads:export");
  const canUpdate = hasPermission(admin.role, "leads:update");

  const params = await searchParams;

  const rawStatus = params.status?.trim();
  const parsedStatus =
    rawStatus && rawStatus !== "ALL"
      ? LEAD_STATUS_ENUM.safeParse(rawStatus)
      : null;
  const statusFilter: LeadStatusValue | undefined =
    parsedStatus?.success ? parsedStatus.data : undefined;

  const rawPillar = params.pillar?.trim();
  const parsedPillar =
    rawPillar && rawPillar !== "ALL" ? PILLAR_ENUM.safeParse(rawPillar) : null;
  const pillarFilter: Pillar | undefined =
    parsedPillar?.success ? parsedPillar.data : undefined;

  const searchQuery = params.q?.trim() || "";
  const parsedPage = Number.parseInt(params.page ?? "1", 10);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage >= 1 ? parsedPage : 1;

  const dbOk = isDatabaseConfigured();
  let leads: Array<{
    id: string;
    publicReference: string;
    name: string;
    mobile: string;
    email: string | null;
    addressArea: string;
    categoryContext: string;
    pillar: Pillar;
    targetSlug: string | null;
    problemDescription: string;
    status: LeadStatusValue;
    internalNotes: string | null;
    createdAt: Date;
  }> = [];
  let totalCount = 0;

  if (dbOk) {
    try {
      const where: Prisma.LeadWhereInput = {};
      if (statusFilter) {
        where.status = statusFilter;
      }
      if (pillarFilter) {
        where.pillar = pillarFilter;
      }
      if (searchQuery) {
        where.OR = [
          { publicReference: { contains: searchQuery, mode: "insensitive" } },
          { name: { contains: searchQuery, mode: "insensitive" } },
          { mobile: { contains: searchQuery } },
          { email: { contains: searchQuery, mode: "insensitive" } },
        ];
      }

      const [rows, count] = await Promise.all([
        prisma.lead.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: (currentPage - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
          select: {
            id: true,
            publicReference: true,
            name: true,
            mobile: true,
            email: true,
            addressArea: true,
            categoryContext: true,
            pillar: true,
            targetSlug: true,
            problemDescription: true,
            status: true,
            internalNotes: true,
            createdAt: true,
          },
        }),
        prisma.lead.count({ where }),
      ]);
      leads = rows;
      totalCount = count;
    } catch (e) {
      console.error("[Leads Query Error]", e);
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const csvHref = buildCsvHref({
    status: statusFilter,
    pillar: pillarFilter,
    q: searchQuery || undefined,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bn font-bold text-ps-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-ps-gold" aria-hidden="true" />
            <span>ইনকোয়ারি ও লিড পোর্টাল</span>
          </h1>
          <p className="text-sm text-ps-ivory/80 mt-1">
            ওয়েবসাইট থেকে প্রাপ্ত সকল কনসালটেন্সি ও সার্ভিস আবেদনের কেন্দ্রীয় তালিকা ({totalCount}টি)
          </p>
        </div>

        {canExport && (
          <a
            href={csvHref}
            download
            className="min-h-[44px] py-2.5 px-4 bg-ps-gold hover:bg-ps-gold/90 text-ps-midnight font-semibold rounded-[12px] text-sm inline-flex items-center gap-2 shadow-md transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>CSV ডাউনলোড</span>
          </a>
        )}
      </div>

      {/* Database Warning */}
      {!dbOk && (
        <div className="p-4 rounded-[16px] bg-amber-950/50 border border-amber-400/40 flex items-start gap-3">
          <Database
            className="w-5 h-5 text-ps-gold flex-shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="text-sm text-ps-ivory/90">
            <strong className="text-ps-gold">ডাটাবেজ সংযুক্ত নেই:</strong>{" "}
            নতুন লিড ডাটাবেজে সংরক্ষণ করতে অনুগ্রহ করে{" "}
            <code className="font-en text-ps-ivory bg-ps-midnight px-1.5 py-0.5 rounded text-xs border border-ps-white/15">
              docker compose up -d
            </code>{" "}
            অথবা PostgreSQL সংযোগ কনফিগার করুন।
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="p-4 rounded-[16px] bg-ps-navy border border-ps-white/15 space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <form method="GET" action="/admin/leads" className="relative flex-1 max-w-md flex gap-2">
            <div className="relative flex-1">
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ps-ivory/70 pointer-events-none"
                aria-hidden="true"
              />
              <label htmlFor="leads-search" className="visually-hidden">
                লিড অনুসন্ধান করুন
              </label>
              <input
                id="leads-search"
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="রেফারেন্স আইডি, নাম বা মোবাইল দিয়ে খুঁজুন..."
                className="w-full min-h-[42px] pl-9 pr-4 py-2 bg-ps-midnight border border-ps-white/25 rounded-[12px] text-sm text-ps-white placeholder:text-ps-ivory/60 focus:border-ps-gold"
              />
            </div>
            {statusFilter && (
              <input type="hidden" name="status" value={statusFilter} />
            )}
            {pillarFilter && (
              <input type="hidden" name="pillar" value={pillarFilter} />
            )}
            <button
              type="submit"
              className="min-h-[42px] px-4 py-2 rounded-[12px] bg-ps-gold hover:bg-ps-gold/90 text-ps-midnight font-semibold text-xs transition-colors cursor-pointer"
            >
              খুঁজুন
            </button>
          </form>

          {/* Pillar Filter Tabs */}
          <div
            role="navigation"
            aria-label="পিলার অনুযায়ী ফিল্টার"
            className="flex flex-wrap items-center gap-1.5 text-xs"
          >
            {PILLAR_TABS.map((tab) => {
              const isActive = (pillarFilter || "") === tab.key;
              return (
                <Link
                  key={tab.key || "ALL_PILLARS"}
                  href={buildLeadsHref({
                    status: statusFilter,
                    pillar: tab.key || undefined,
                    q: searchQuery || undefined,
                  })}
                  className={`min-h-[36px] inline-flex items-center px-3 py-1.5 rounded-[10px] font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-ps-gold text-ps-midnight font-semibold"
                      : "bg-ps-midnight text-ps-ivory/85 border border-ps-white/15 hover:text-ps-white hover:border-ps-gold/50"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Status Tabs */}
        <div
          role="navigation"
          aria-label="স্ট্যাটাস অনুযায়ী ফিল্টার"
          className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-ps-white/10 pt-3"
        >
          {STATUS_TABS.map((tab) => {
            const isActive = (statusFilter || "") === tab.key;
            return (
              <Link
                key={tab.key || "ALL_STATUS"}
                href={buildLeadsHref({
                  status: tab.key || undefined,
                  pillar: pillarFilter,
                  q: searchQuery || undefined,
                })}
                className={`min-h-[36px] inline-flex items-center px-3 py-1.5 rounded-[10px] font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-ps-gold text-ps-midnight font-semibold"
                    : "bg-ps-midnight text-ps-ivory/85 border border-ps-white/15 hover:text-ps-white hover:border-ps-gold/50"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-[16px] border border-ps-white/15 bg-ps-navy overflow-hidden">
        {leads.length === 0 ? (
          <div className="p-12 text-center">
            <Users
              className="w-12 h-12 mx-auto text-ps-gold/70 mb-3"
              aria-hidden="true"
            />
            <h2 className="text-base font-semibold text-ps-white">
              কোনো ইনকোয়ারি পাওয়া যায়নি
            </h2>
            <p className="text-xs text-ps-ivory/80 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter || pillarFilter
                ? "খোঁজা বা ফিল্টারের সাথে মিল পাওয়া যায়নি। অন্য শর্ত দিয়ে চেষ্টা করুন।"
                : "নতুন আবেদন জমা পড়লে তা এই তালিকায় প্রদর্শিত হবে।"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ps-midnight/80 text-xs uppercase tracking-wider text-ps-ivory/85 border-b border-ps-white/15">
                <tr>
                  <th scope="col" className="py-3.5 px-4 font-semibold">
                    রেফারেন্স ID
                  </th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">
                    আবেদনকারী
                  </th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">
                    যোগাযোগ
                  </th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">
                    সেবা / পিলার
                  </th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">
                    তারিখ
                  </th>
                  <th scope="col" className="py-3.5 px-4 font-semibold">
                    স্ট্যাটাস ও অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ps-white/10 text-ps-ivory">
                {leads.map((lead) => {
                  const statusInfo = STATUS_LABELS[lead.status] ?? {
                    label: lead.status,
                    badgeClass:
                      "bg-ps-midnight text-ps-ivory border-ps-white/25",
                  };

                  return (
                    <tr
                      key={lead.id}
                      className="hover:bg-ps-midnight/40 transition-colors align-top"
                    >
                      {/* Ref ID */}
                      <td className="py-4 px-4 font-en font-semibold text-ps-gold whitespace-nowrap">
                        {lead.publicReference}
                      </td>

                      {/* Name & Address */}
                      <td className="py-4 px-4">
                        <div className="font-medium text-ps-white">
                          {lead.name}
                        </div>
                        <div className="text-xs text-ps-ivory/80 flex items-center gap-1 mt-0.5">
                          <MapPin
                            className="w-3 h-3 flex-shrink-0 text-ps-gold"
                            aria-hidden="true"
                          />
                          <span>{lead.addressArea}</span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 font-en text-xs text-ps-white">
                          <Phone
                            className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0"
                            aria-hidden="true"
                          />
                          <a href={`tel:${lead.mobile}`} className="hover:underline">
                            {lead.mobile}
                          </a>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-xs text-ps-ivory/85 mt-1">
                            <Mail
                              className="w-3 h-3 text-ps-ivory/75 flex-shrink-0"
                              aria-hidden="true"
                            />
                            <a
                              href={`mailto:${lead.email}`}
                              className="hover:underline truncate max-w-[180px]"
                            >
                              {lead.email}
                            </a>
                          </div>
                        )}
                      </td>

                      {/* Pillar, Category & Problem */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="inline-block font-en text-[11px] font-semibold px-2 py-0.5 rounded bg-ps-midnight text-ps-gold border border-ps-gold/40">
                            {lead.pillar}
                          </span>
                          <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-ps-midnight text-ps-ivory border border-ps-white/20">
                            {lead.categoryContext}
                          </span>
                        </div>
                        {lead.targetSlug && (
                          <p className="text-[11px] font-en text-ps-ivory/75 mb-0.5">
                            Target: {lead.targetSlug}
                          </p>
                        )}
                        <p className="text-xs text-ps-ivory/85 line-clamp-2 max-w-xs">
                          {lead.problemDescription}
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-ps-ivory/85">
                        {new Date(lead.createdAt).toLocaleDateString("bn-BD", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      {/* Status & Inline Updater */}
                      <td className="py-4 px-4">
                        <div className="space-y-2">
                          <span
                            className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusInfo.badgeClass}`}
                          >
                            {statusInfo.label}
                          </span>
                          {canUpdate && (
                            <LeadStatusUpdater
                              leadId={lead.id}
                              publicReference={lead.publicReference}
                              currentStatus={lead.status}
                              currentNotes={lead.internalNotes}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="লিড তালিকা পেজিনেশন"
          className="flex items-center justify-between gap-4 px-4 py-3 rounded-[12px] bg-ps-navy border border-ps-white/15 text-xs text-ps-ivory"
        >
          <span>
            পৃষ্ঠা <strong className="font-en text-ps-gold">{currentPage}</strong> /{" "}
            <span className="font-en">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            {currentPage > 1 && (
              <Link
                href={buildLeadsHref({
                  status: statusFilter,
                  pillar: pillarFilter,
                  q: searchQuery || undefined,
                  page: currentPage - 1,
                })}
                className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-ps-midnight border border-ps-white/20 text-ps-ivory hover:border-ps-gold transition-colors"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>পূর্ববর্তী</span>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link
                href={buildLeadsHref({
                  status: statusFilter,
                  pillar: pillarFilter,
                  q: searchQuery || undefined,
                  page: currentPage + 1,
                })}
                className="min-h-[36px] inline-flex items-center gap-1 px-3 py-1.5 rounded-[10px] bg-ps-midnight border border-ps-white/20 text-ps-ivory hover:border-ps-gold transition-colors"
              >
                <span>পরবর্তী</span>
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
