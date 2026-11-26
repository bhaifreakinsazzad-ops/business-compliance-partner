import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  BookOpen,
  FileCheck2,
  FileText,
  Settings,
  History,
  ExternalLink,
} from "lucide-react";
import { getCurrentAdminSession } from "@/lib/security/session";
import { hasPermission } from "@/lib/security/rbac";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "অ্যাডমিন প্যানেল",
    template: "%s | Admin | Business Compliance Partner",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdminSession();

  // If viewing login or not authenticated yet, render children cleanly
  if (!admin) {
    return <>{children}</>;
  }

  const canViewDashboard = hasPermission(admin.role, "dashboard:view");
  const canViewLeads = hasPermission(admin.role, "leads:view");
  const canReadContent = hasPermission(admin.role, "content:read");
  const canManageFaqs = hasPermission(admin.role, "faqs:manage");
  const canManageSettings = hasPermission(admin.role, "settings:manage");
  const canViewAudit = hasPermission(admin.role, "audit:view");

  return (
    <div className="min-h-screen bg-ps-midnight text-ps-ivory font-bn flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-ps-navy border-b md:border-b-0 md:border-r border-ps-white/15 flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="p-5 sm:p-6 border-b border-ps-white/15 flex items-center justify-between gap-2">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2.5 text-ps-gold font-en font-bold text-lg"
          >
            <Shield className="w-6 h-6" aria-hidden="true" />
            <span className="text-ps-white tracking-wide">PS ADMIN</span>
          </Link>
          <span className="text-[10px] font-en uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-ps-midnight border border-ps-gold/50 text-ps-gold">
            {admin.role}
          </span>
        </div>

        {/* Navigation */}
        <nav aria-label="অ্যাডমিন নেভিগেশন" className="p-4 space-y-1.5 flex-1">
          {canViewDashboard && (
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-[12px] text-sm font-medium text-ps-ivory/90 hover:text-ps-white hover:bg-ps-midnight/70 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-ps-gold" aria-hidden="true" />
              <span>ড্যাশবোর্ড (Overview)</span>
            </Link>
          )}
          {canViewLeads && (
            <Link
              href="/admin/leads"
              className="flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-[12px] text-sm font-medium text-ps-ivory/90 hover:text-ps-white hover:bg-ps-midnight/70 transition-colors"
            >
              <Users className="w-4 h-4 text-ps-gold" aria-hidden="true" />
              <span>ইনকোয়ারি ও লিড (Leads)</span>
            </Link>
          )}
          {canReadContent && (
            <>
              <Link
                href="/admin/courses"
                className="flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-[12px] text-sm font-medium text-ps-ivory/90 hover:text-ps-white hover:bg-ps-midnight/70 transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-ps-gold" aria-hidden="true" />
                <span>কোর্স ব্যবস্থাপনা</span>
              </Link>
              <Link
                href="/admin/services"
                className="flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-[12px] text-sm font-medium text-ps-ivory/90 hover:text-ps-white hover:bg-ps-midnight/70 transition-colors"
              >
                <Briefcase className="w-4 h-4 text-ps-gold" aria-hidden="true" />
                <span>সার্ভিস ব্যবস্থাপনা</span>
              </Link>
              <Link
                href="/admin/licensing"
                className="flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-[12px] text-sm font-medium text-ps-ivory/90 hover:text-ps-white hover:bg-ps-midnight/70 transition-colors"
              >
                <FileCheck2 className="w-4 h-4 text-ps-gold" aria-hidden="true" />
                <span>লাইসেন্সিং ব্যবস্থাপনা</span>
              </Link>
              <Link
                href="/admin/books"
                className="flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-[12px] text-sm font-medium text-ps-ivory/90 hover:text-ps-white hover:bg-ps-midnight/70 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-ps-gold" aria-hidden="true" />
                <span>বই ও প্রকাশনা ব্যবস্থাপনা</span>
              </Link>
            </>
          )}
          {canManageFaqs && (
            <Link
              href="/admin/content"
              className="flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-[12px] text-sm font-medium text-ps-ivory/90 hover:text-ps-white hover:bg-ps-midnight/70 transition-colors"
            >
              <FileText className="w-4 h-4 text-ps-gold" aria-hidden="true" />
              <span>FAQ ও কন্টেন্ট</span>
            </Link>
          )}
          {canManageSettings && (
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-[12px] text-sm font-medium text-ps-ivory/90 hover:text-ps-white hover:bg-ps-midnight/70 transition-colors"
            >
              <Settings className="w-4 h-4 text-ps-gold" aria-hidden="true" />
              <span>সাইট সেটিংস</span>
            </Link>
          )}
          {canViewAudit && (
            <Link
              href="/admin/audit"
              className="flex items-center gap-3 min-h-[44px] px-3.5 py-2.5 rounded-[12px] text-sm font-medium text-ps-ivory/90 hover:text-ps-white hover:bg-ps-midnight/70 transition-colors"
            >
              <History className="w-4 h-4 text-ps-gold" aria-hidden="true" />
              <span>অডিট লগ</span>
            </Link>
          )}
          <div className="pt-4 pb-2 px-3.5 text-[11px] font-semibold uppercase tracking-wider text-ps-ivory/80">
            পাবলিক ক্যাটালগ প্রিভিউ
          </div>
          <Link
            href="/courses"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between min-h-[40px] px-3.5 py-2 rounded-[12px] text-sm text-ps-ivory/85 hover:text-ps-white hover:bg-ps-midnight/50 transition-colors"
          >
            <span className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-ps-gold" aria-hidden="true" />
              <span>কোর্স ক্যাটালগ</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-ps-ivory/75" aria-hidden="true" />
          </Link>
          <Link
            href="/services"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between min-h-[40px] px-3.5 py-2 rounded-[12px] text-sm text-ps-ivory/85 hover:text-ps-white hover:bg-ps-midnight/50 transition-colors"
          >
            <span className="flex items-center gap-3">
              <Briefcase className="w-4 h-4 text-ps-gold" aria-hidden="true" />
              <span>সার্ভিস ক্যাটালগ</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-ps-ivory/75" aria-hidden="true" />
          </Link>
          <Link
            href="/licensing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between min-h-[40px] px-3.5 py-2 rounded-[12px] text-sm text-ps-ivory/85 hover:text-ps-white hover:bg-ps-midnight/50 transition-colors"
          >
            <span className="flex items-center gap-3">
              <FileCheck2 className="w-4 h-4 text-ps-gold" aria-hidden="true" />
              <span>লাইসেন্সিং ডিরেক্টরি</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-ps-ivory/75" aria-hidden="true" />
          </Link>
          <Link
            href="/books"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between min-h-[40px] px-3.5 py-2 rounded-[12px] text-sm text-ps-ivory/85 hover:text-ps-white hover:bg-ps-midnight/50 transition-colors"
          >
            <span className="flex items-center gap-3">
              <BookOpen className="w-4 h-4 text-ps-gold" aria-hidden="true" />
              <span>বই ক্যাটালগ</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-ps-ivory/75" aria-hidden="true" />
          </Link>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-ps-white/15 bg-ps-midnight/50">
          <div className="mb-3 px-1">
            <p className="text-xs font-medium text-ps-white truncate">{admin.name}</p>
            <p className="text-[11px] font-en text-ps-ivory/80 truncate">{admin.email}</p>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 flex flex-col min-w-0 bg-ps-midnight overflow-y-auto"
      >
        <header className="min-h-16 border-b border-ps-white/15 bg-ps-navy/80 backdrop-blur-sm px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-ps-ivory/80">
            <span>স্টাফ অ্যাডমিন প্যানেল</span>
            <span aria-hidden="true">/</span>
            <span className="text-ps-white font-medium">কন্ট্রোল ড্যাশবোর্ড</span>
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 min-h-[40px] px-2 text-xs text-ps-gold hover:underline"
          >
            <span>লাইভ সাইট দেখুন</span>
            <ExternalLink className="w-3 h-3" aria-hidden="true" />
          </Link>
        </header>

        <div className="p-4 sm:p-6 md:p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
