import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Shield } from "lucide-react";
import { getCurrentAdminSession } from "@/lib/security/session";
import { sanitizeAdminRedirectPath } from "@/components/admin/admin-redirect";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = {
  title: "স্টাফ লগইন",
  robots: { index: false, follow: false },
};

interface AdminLoginPageProps {
  searchParams?: Promise<{ next?: string }>;
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const admin = await getCurrentAdminSession();

  if (admin) {
    redirect(sanitizeAdminRedirectPath(resolvedParams.next));
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-ps-midnight text-ps-ivory flex items-center justify-center p-4 font-bn"
    >
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 mb-4 text-ps-gold hover:opacity-90 transition-opacity"
          >
            <Shield className="w-8 h-8" aria-hidden="true" />
            <span className="font-en font-bold text-2xl tracking-wider text-ps-white">
              BUSINESS COMPLIANCE PARTNER
            </span>
          </Link>
          <h1 className="text-xl font-bn font-semibold text-ps-white">
            স্টাফ অ্যাডমিন পোর্টাল
          </h1>
          <p className="text-sm text-ps-ivory/80 mt-1">
            শুধুমাত্র অনুমোদিত কর্মকর্তা ও টিম সদস্যদের ব্যবহারের জন্য
          </p>
        </div>

        {/* Form Card */}
        <Suspense
          fallback={
            <div className="bg-ps-navy border border-ps-white/15 rounded-[16px] p-8 text-center text-sm text-ps-ivory/80">
              লোড হচ্ছে...
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>

        {/* Security Notice */}
        <p className="text-center text-xs text-ps-ivory/80 mt-6">
          নিরাপত্তা নীতি: সমস্ত অ্যাডমিন কার্যকলাপ এবং আইপি অডিট লগে সংরক্ষিত হয়।
        </p>
      </div>
    </main>
  );
}
