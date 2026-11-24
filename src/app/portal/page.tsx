import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building,
  Clock,
  FileCheck2,
  FileText,
  LogOut,
  PlusCircle,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

interface PortalServiceRequest {
  id: string;
  publicReference: string;
  title: string;
  scopeDetails: string;
  status: string;
  quotes: {
    totalAmountBdt: number;
    status: string;
  }[];
}

interface PortalComplianceCase {
  id: string;
  publicReference: string;
  titleBn: string;
  categorySlug: string;
  status: string;
}

interface PortalEnrollment {
  id: string;
  progressPercentage: number;
  course: {
    titleBn: string;
  };
}

interface PortalDocument {
  id: string;
  title: string;
  category: string;
  status: string;
}

export default async function CustomerPortalPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/portal/login");
  }

  // Load Customer's Data from Prisma (or fallback mock if DB not connected)
  let serviceRequests: PortalServiceRequest[] = [];
  let complianceCases: PortalComplianceCase[] = [];
  let enrollments: PortalEnrollment[] = [];
  let documents: PortalDocument[] = [];

  if (isDatabaseConfigured()) {
    try {
      [serviceRequests, complianceCases, enrollments, documents] = await Promise.all([
        prisma.serviceRequest.findMany({
          where: { customerId: customer.id },
          include: { quotes: { include: { items: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.complianceCase.findMany({
          where: { customerId: customer.id },
          include: { milestones: { orderBy: { sortOrder: "asc" } } },
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
        prisma.enrollment.findMany({
          where: { customerId: customer.id },
          include: { course: true, certificates: true },
          orderBy: { enrolledAt: "desc" },
          take: 5,
        }),
        prisma.document.findMany({
          where: { customerId: customer.id },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);
    } catch (err) {
      console.warn("[portal] Could not fetch customer relations:", err);
    }
  }

  // If no records exist, supply structured initial onboarding samples
  const hasLiveRequests = serviceRequests.length > 0;
  const activeOrg = customer.organizations[0]?.name || "ব্যক্তিগত প্রোফাইল";

  return (
    <div className="min-h-screen bg-ps-pearl text-ps-midnight flex flex-col">
      {/* Top Command Bar */}
      <header className="bg-ps-midnight text-ps-white border-b border-ps-gold/30 sticky top-0 z-40">
        <div className="ps-container py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0 flex items-center gap-2">
              <Image
                src="/brand/bcp-master-logo.png"
                alt="Business Compliance Partner"
                width={38}
                height={38}
                className="rounded-full border border-ps-gold/60"
              />
              <span className="font-editorial text-sm font-bold tracking-wide hidden sm:inline text-ps-ivory">
                BCP COMMAND CENTER
              </span>
            </Link>
            <div className="h-5 w-px bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs text-ps-ivory/80">
              <Building className="w-3.5 h-3.5 text-ps-gold" />
              <span className="font-medium truncate max-w-[200px]">{activeOrg}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/80 hidden md:inline">
              স্বাগতম, <strong className="text-ps-gold">{customer.name}</strong>
            </span>
            <form action="/api/customer/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5 text-ps-gold" />
                <span>প্রস্থান</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Command Dashboard */}
      <main className="ps-container py-8 space-y-8 flex-1">
        {/* Welcome & Overview Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[16px] border border-ps-border shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-ps-gold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-ps-gold" />
              <span>বিজনেস কমপ্লায়েন্স পার্টনার • গ্রাহক পোর্টাল v2.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ps-midnight">
              {customer.name}-এর ব্যবসায়িক ড্যাশবোর্ড
            </h1>
            <p className="text-xs sm:text-sm text-ps-slate">
              আপনার প্রতিষ্ঠানের লাইসেন্স, ভ্যাট-ট্যাক্স কমপ্লায়েন্স ও কোর্সসমূহের সার্বিক অবস্থা
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-ps-midnight text-ps-ivory text-xs sm:text-sm font-bold hover:bg-ps-navy transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-ps-gold" />
              <span>নতুন সেবার অনুরোধ</span>
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-ps-cool border border-ps-border text-ps-navy text-xs sm:text-sm font-semibold hover:border-ps-gold transition-colors"
            >
              <span>রেডিনেস টুলস</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Core Operational Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-[14px] border border-ps-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ps-navy/5 flex items-center justify-center text-ps-navy border border-ps-navy/10 shrink-0">
              <FileCheck2 className="w-6 h-6 text-ps-gold" />
            </div>
            <div>
              <p className="text-xs text-ps-slate font-medium">সক্রিয় সেবা অনুরোধ</p>
              <p className="text-2xl font-extrabold text-ps-midnight">
                {serviceRequests.length || 0}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[14px] border border-ps-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ps-navy/5 flex items-center justify-center text-ps-navy border border-ps-navy/10 shrink-0">
              <Clock className="w-6 h-6 text-ps-gold" />
            </div>
            <div>
              <p className="text-xs text-ps-slate font-medium">কমপ্লায়েন্স কেস</p>
              <p className="text-2xl font-extrabold text-ps-midnight">
                {complianceCases.length || 0}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[14px] border border-ps-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ps-navy/5 flex items-center justify-center text-ps-navy border border-ps-navy/10 shrink-0">
              <BookOpen className="w-6 h-6 text-ps-gold" />
            </div>
            <div>
              <p className="text-xs text-ps-slate font-medium">নিবন্ধিত কোর্স</p>
              <p className="text-2xl font-extrabold text-ps-midnight">
                {enrollments.length || 0}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[14px] border border-ps-border shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-ps-navy/5 flex items-center justify-center text-ps-navy border border-ps-navy/10 shrink-0">
              <Shield className="w-6 h-6 text-ps-gold" />
            </div>
            <div>
              <p className="text-xs text-ps-slate font-medium">সংরক্ষিত নথিপত্র</p>
              <p className="text-2xl font-extrabold text-ps-midnight">
                {documents.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Service Requests & Quotes */}
        <section className="bg-white rounded-[16px] border border-ps-border shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-ps-border flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ps-midnight flex items-center gap-2">
                <FileText className="w-5 h-5 text-ps-gold" />
                <span>আমার সেবা অনুরোধ ও কোটেশন</span>
              </h2>
              <p className="text-xs text-ps-slate">
                ট্রেড লাইসেন্স, মূসক, e-TIN ও অন্যান্য পেশাদার সহায়তার অগ্রগতি
              </p>
            </div>
            <Link
              href="/services"
              className="text-xs font-bold text-ps-gold hover:underline flex items-center gap-1"
            >
              <span>নতুন সেবা</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            {hasLiveRequests ? (
              <div className="space-y-3">
                {serviceRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-ps-border bg-ps-pearl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-ps-gold">
                          {req.publicReference}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-ps-navy/10 font-semibold text-ps-navy">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-ps-midnight">{req.title}</p>
                      <p className="text-xs text-ps-slate line-clamp-1">
                        {req.scopeDetails}
                      </p>
                    </div>

                    {req.quotes && req.quotes.length > 0 ? (
                      <div className="text-right shrink-0">
                        <p className="text-xs text-ps-slate">কোটেশন ফি</p>
                        <p className="text-sm font-extrabold text-ps-midnight">
                          ৳{req.quotes[0].totalAmountBdt.toLocaleString()}
                        </p>
                        <span className="text-[11px] text-green-700 font-semibold">
                          {req.quotes[0].status}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-ps-cool border border-ps-border flex items-center justify-center mx-auto text-ps-slate">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-ps-midnight">
                  কোনো সক্রিয় সেবা অনুরোধ নেই
                </h3>
                <p className="text-xs text-ps-slate max-w-sm mx-auto">
                  আপনার ব্যবসার জন্য প্রয়োজনীয় আয়কর, ভ্যাট, লাইসেন্স বা টেন্ডার সেবার অনুরোধ জানান।
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-ps-midnight text-ps-ivory text-xs font-bold hover:bg-ps-navy"
                >
                  <span>সেবা ক্যাটালগ দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Learning & Compliance Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LMS Learning Box */}
          <div className="bg-white rounded-[16px] border border-ps-border shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-ps-border pb-3">
              <h2 className="text-base font-bold text-ps-midnight flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-ps-gold" />
                <span>আমার কোর্স ও অগ্রগতি</span>
              </h2>
              <Link href="/courses" className="text-xs font-bold text-ps-gold hover:underline">
                সব কোর্স
              </Link>
            </div>

            {enrollments.length > 0 ? (
              <div className="space-y-3">
                {enrollments.map((enr) => (
                  <div
                    key={enr.id}
                    className="p-3.5 rounded-xl border border-ps-border bg-ps-pearl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-ps-midnight">
                        {enr.course.titleBn}
                      </p>
                      <span className="text-xs font-bold text-ps-gold">
                        {enr.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-ps-gold h-2 rounded-full"
                        style={{ width: `${enr.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-ps-slate">
                  আপনি এখনও কোনো কোর্সে ভর্তি হননি।
                </p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1 text-xs font-bold text-ps-midnight hover:text-ps-gold underline"
                >
                  ১০৫টি কোর্স এক্সপ্লোর করুন
                </Link>
              </div>
            )}
          </div>

          {/* Secure Document Vault Box */}
          <div className="bg-white rounded-[16px] border border-ps-border shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-ps-border pb-3">
              <h2 className="text-base font-bold text-ps-midnight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-ps-gold" />
                <span>নিরাপদ ডকুমেন্ট ভল্ট</span>
              </h2>
              <span className="text-[11px] font-semibold text-ps-slate">
                এনক্রিপ্টেড ক্লাউড
              </span>
            </div>

            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg border border-ps-border flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-ps-midnight">{doc.title}</p>
                      <p className="text-[11px] text-ps-slate">{doc.category}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700">
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-ps-slate">
                  কোনো ফাইল আপলোড করা হয়নি।
                </p>
                <p className="text-[11px] text-ps-slate">
                  সেবা প্রক্রিয়াকরণের সময় প্রয়োজনীয় নথি সুরক্ষিতভাবে আপলোড করতে পারবেন।
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
