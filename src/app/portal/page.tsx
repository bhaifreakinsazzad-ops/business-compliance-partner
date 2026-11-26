import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building,
  Clock,
  Download,
  FileCheck2,
  FileText,
  LogOut,
  Package,
  PlusCircle,
  Shield,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { formatBdtFromPaisa, toPaisa } from "@/lib/commerce/payments";
import { getCurrentCustomer } from "@/lib/customer/auth";
import { isDatabaseConfigured, prisma } from "@/lib/db/prisma";
import { PortalOrderCancelButton } from "@/components/portal/PortalOrderCancelButton";
import { PortalQuoteActions } from "@/components/portal/PortalQuoteActions";

export const dynamic = "force-dynamic";

interface PortalServiceRequest {
  id: string;
  publicReference: string;
  title: string;
  scopeDetails: string;
  status: string;
  quotes: {
    id: string;
    totalAmountBdt: number;
    totalAmountPaisa: number | null;
    status: string;
    orders: { id: string }[];
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
  publicReference: string;
  title: string;
  category: string;
  status: string;
  quarantineStatus: string;
}

interface PortalBookOrder {
  id: string;
  publicReference: string;
  totalBdt: number;
  totalPaisa: number | null;
  paymentStatus: string;
  status: string;
  shippingAddress: string | null;
  createdAt: Date;
  bookItems: {
    id: string;
    titleSnapshot: string;
    quantity: number;
    unitPricePaisa: number;
    lineTotalPaisa: number;
  }[];
}

export default async function CustomerPortalPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/portal/login");
  }

  let serviceRequests: PortalServiceRequest[] = [];
  let complianceCases: PortalComplianceCase[] = [];
  let enrollments: PortalEnrollment[] = [];
  let documents: PortalDocument[] = [];
  let bookOrders: PortalBookOrder[] = [];

  if (isDatabaseConfigured()) {
    try {
      [serviceRequests, complianceCases, enrollments, documents, bookOrders] =
        await Promise.all([
          prisma.serviceRequest.findMany({
            where: { customerId: customer.id },
            include: {
              quotes: {
                include: {
                  items: true,
                  orders: { select: { id: true } },
                },
              },
            },
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
            where: { customerId: customer.id, deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: 10,
          }),
          prisma.order.findMany({
            where: { customerId: customer.id, orderKind: "BOOKSTORE" },
            include: { bookItems: true },
            orderBy: { createdAt: "desc" },
            take: 10,
          }),
        ]);
    } catch (err) {
      console.warn("[portal] Could not fetch customer relations:", err);
    }
  }

  const hasLiveRequests = serviceRequests.length > 0;
  const activeOrg = customer.organizations[0]?.name || "ব্যক্তিগত প্রোফাইল";

  return (
    <div className="min-h-screen bg-[#F2EFF8]/50 text-[#081838] flex flex-col">
      {/* Top Command Bar */}
      <header className="bg-[#081838] text-white border-b border-[#C59028]/40 sticky top-0 z-40">
        <div className="ps-container py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="shrink-0 flex items-center gap-2">
              <Image
                src="/brand/bcp-master-logo.png"
                alt="Business Compliance Partner"
                width={38}
                height={38}
                referrerPolicy="no-referrer"
                className="rounded-full border border-[#C59028]/60"
              />
              <span className="font-editorial text-sm font-bold tracking-wide hidden sm:inline text-[#F5F1E8]">
                BCP COMMAND CENTER
              </span>
            </Link>
            <div className="h-5 w-px bg-white/20 hidden sm:block" />
            <div className="flex items-center gap-2 text-xs text-white/80">
              <Building className="w-3.5 h-3.5 text-[#DFB15B]" aria-hidden="true" />
              <span className="font-medium truncate max-w-[200px]">{activeOrg}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/80 hidden md:inline">
              স্বাগতম, <strong className="text-[#DFB15B]">{customer.name}</strong>
            </span>
            <form action="/api/customer/auth/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="লগআউট"
              >
                <LogOut className="w-3.5 h-3.5 text-[#DFB15B]" aria-hidden="true" />
                <span>প্রস্থান</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Command Dashboard */}
      <main className="ps-container py-8 space-y-8 flex-1">
        {/* Welcome & Overview Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[16px] border border-[#D4CCE3] shadow-sm">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#51406F] uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#51406F]" aria-hidden="true" />
              <span>বিজনেস কমপ্লায়েন্স পার্টনার • গ্রাহক পোর্টাল</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081838]">
              {customer.name}-এর ব্যবসায়িক ড্যাশবোর্ড
            </h1>
            <p className="text-xs sm:text-sm text-[#596775]">
              আপনার প্রতিষ্ঠানের লাইসেন্স, ভ্যাট-ট্যাক্স কমপ্লায়েন্স ও কোর্সসমূহের সার্বিক অবস্থা
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#51406F] text-white text-xs sm:text-sm font-bold hover:bg-[#3F315A] transition-colors shadow-sm"
            >
              <PlusCircle className="w-4 h-4 text-[#DFB15B]" aria-hidden="true" />
              <span>নতুন সেবার অনুরোধ</span>
            </Link>
            <Link
              href="/tools"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-[10px] bg-[#F2EFF8] border border-[#D4CCE3] text-[#081838] text-xs sm:text-sm font-semibold hover:border-[#51406F] transition-colors"
            >
              <span>রেডিনেস টুলস</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* 4 Core Operational Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-[14px] border border-[#D4CCE3] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F2EFF8] flex items-center justify-center text-[#51406F] border border-[#D4CCE3] shrink-0">
              <FileCheck2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[#596775] font-medium">সক্রিয় সেবা অনুরোধ</p>
              <p className="text-2xl font-extrabold text-[#081838] tabular-nums">
                {serviceRequests.length || 0}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[14px] border border-[#D4CCE3] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F2EFF8] flex items-center justify-center text-[#51406F] border border-[#D4CCE3] shrink-0">
              <Clock className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[#596775] font-medium">কমপ্লায়েন্স কেস</p>
              <p className="text-2xl font-extrabold text-[#081838] tabular-nums">
                {complianceCases.length || 0}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[14px] border border-[#D4CCE3] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F2EFF8] flex items-center justify-center text-[#51406F] border border-[#D4CCE3] shrink-0">
              <BookOpen className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[#596775] font-medium">নিবন্ধিত কোর্স</p>
              <p className="text-2xl font-extrabold text-[#081838] tabular-nums">
                {enrollments.length || 0}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-[14px] border border-[#D4CCE3] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F2EFF8] flex items-center justify-center text-[#51406F] border border-[#D4CCE3] shrink-0">
              <Shield className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[#596775] font-medium">সংরক্ষিত নথিপত্র</p>
              <p className="text-2xl font-extrabold text-[#081838] tabular-nums">
                {documents.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Service Requests & Quotes */}
        <section className="bg-white rounded-[16px] border border-[#D4CCE3] shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-[#D4CCE3] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#081838] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#51406F]" aria-hidden="true" />
                <span>আমার সেবা অনুরোধ ও কোটেশন</span>
              </h2>
              <p className="text-xs text-[#596775]">
                ট্রেড লাইসেন্স, মূসক, e-TIN ও অন্যান্য পেশাদার সহায়তার অগ্রগতি
              </p>
            </div>
            <Link
              href="/services"
              className="text-xs font-bold text-[#51406F] hover:text-[#3F315A] hover:underline flex items-center gap-1"
            >
              <span>নতুন সেবা</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="p-5 sm:p-6">
            {hasLiveRequests ? (
              <div className="space-y-3">
                {serviceRequests.map((req) => {
                  const latestQuote = req.quotes[0];
                  const quotePaisa = latestQuote
                    ? (latestQuote.totalAmountPaisa ?? toPaisa(latestQuote.totalAmountBdt))
                    : 0;
                  return (
                    <div
                      key={req.id}
                      className="p-4 rounded-xl border border-[#D4CCE3] bg-[#F2EFF8]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono font-bold text-[#081838]">
                            {req.publicReference}
                          </span>
                          <span className="text-[#A599C2]" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-semibold text-[#51406F]">
                            {req.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-[#081838]">{req.title}</p>
                        <p className="text-xs text-[#596775] line-clamp-1">
                          {req.scopeDetails}
                        </p>
                      </div>

                      {latestQuote ? (
                        <div className="text-right shrink-0 space-y-1.5">
                          <p className="text-xs text-[#596775]">কোটেশন ফি</p>
                          <p className="text-sm font-extrabold text-[#081838] tabular-nums">
                            {formatBdtFromPaisa(quotePaisa, "en-US")}
                          </p>
                          <span className="block text-[11px] text-[#00865A] font-semibold">
                            {latestQuote.status}
                          </span>
                          <PortalQuoteActions
                            quoteId={latestQuote.id}
                            status={latestQuote.status}
                            hasOrder={latestQuote.orders.length > 0}
                          />
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[#F2EFF8] border border-[#D4CCE3] flex items-center justify-center mx-auto text-[#51406F]">
                  <FileText className="w-6 h-6" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-bold text-[#081838]">
                  কোনো সক্রিয় সেবা অনুরোধ নেই
                </h3>
                <p className="text-xs text-[#596775] max-w-sm mx-auto">
                  আপনার ব্যবসার জন্য প্রয়োজনীয় আয়কর, ভ্যাট, লাইসেন্স বা টেন্ডার সেবার অনুরোধ জানান।
                </p>
                <Link
                  href="/services"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#51406F] text-white text-xs font-bold hover:bg-[#3F315A] transition-colors"
                >
                  <span>সেবা ক্যাটালগ দেখুন</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Learning & Compliance Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LMS Learning Box */}
          <div className="bg-white rounded-[16px] border border-[#D4CCE3] shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4CCE3] pb-3">
              <h2 className="text-base font-bold text-[#081838] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#51406F]" aria-hidden="true" />
                <span>আমার কোর্স ও অগ্রগতি</span>
              </h2>
              <Link
                href="/courses"
                className="text-xs font-bold text-[#51406F] hover:text-[#3F315A] hover:underline"
              >
                সব কোর্স
              </Link>
            </div>

            {enrollments.length > 0 ? (
              <div className="space-y-3">
                {enrollments.map((enr) => (
                  <div
                    key={enr.id}
                    className="p-3.5 rounded-xl border border-[#D4CCE3] bg-[#F2EFF8]/50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-[#081838]">
                        {enr.course.titleBn}
                      </p>
                      <span className="text-xs font-bold text-[#51406F] tabular-nums">
                        {enr.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#DDD6EB] rounded-full h-2">
                      <div
                        className="bg-[#51406F] h-2 rounded-full"
                        style={{ width: `${enr.progressPercentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-[#596775]">
                  আপনি এখনও কোনো কোর্সে ভর্তি হননি।
                </p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#51406F] hover:text-[#081838] underline"
                >
                  ১০৫টি কোর্স এক্সপ্লোর করুন
                </Link>
              </div>
            )}
          </div>

          {/* Secure Document Vault Box */}
          <div className="bg-white rounded-[16px] border border-[#D4CCE3] shadow-sm p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4CCE3] pb-3">
              <h2 className="text-base font-bold text-[#081838] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#51406F]" aria-hidden="true" />
                <span>নিরাপদ ডকুমেন্ট ভল্ট</span>
              </h2>
              <span className="text-[11px] font-semibold text-[#596775]">
                সুরক্ষিত প্রাইভেট স্টোরেজ
              </span>
            </div>

            {documents.length > 0 ? (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg border border-[#D4CCE3] flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#081838]">{doc.title}</p>
                      <p className="text-[11px] text-[#596775]">{doc.category}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] font-bold text-[#00865A]">
                        {doc.quarantineStatus !== "CLEAR"
                          ? "QUARANTINED"
                          : doc.status}
                      </span>
                      {doc.quarantineStatus === "CLEAR" ? (
                        <a
                          href={`/api/documents/${encodeURIComponent(doc.publicReference)}`}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#51406F] hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>ডাউনলোড</span>
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-[#596775]">
                  কোনো ফাইল আপলোড করা হয়নি।
                </p>
                <p className="text-[11px] text-[#596775]">
                  সেবা প্রক্রিয়াকরণের সময় প্রয়োজনীয় নথি সুরক্ষিতভাবে আপলোড করতে পারবেন।
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Bookstore Orders */}
        <section className="bg-white rounded-[16px] border border-[#D4CCE3] shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D4CCE3] pb-3">
            <h2 className="text-base font-bold text-[#081838] flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#51406F]" aria-hidden="true" />
              <span>আমার বই ক্রয়ের অর্ডারসমূহ</span>
            </h2>
            <Link
              href="/books"
              className="text-xs font-bold text-[#51406F] hover:text-[#3F315A] hover:underline"
            >
              বুকস্টোর দেখুন →
            </Link>
          </div>

          {bookOrders.length > 0 ? (
            <div className="space-y-3">
              {bookOrders.map((order) => {
                const orderPaisa = order.totalPaisa ?? toPaisa(order.totalBdt);
                const canSelfCancel =
                  order.paymentStatus === "UNPAID" &&
                  order.status !== "CANCELLED" &&
                  order.status !== "SHIPPED" &&
                  order.status !== "DELIVERED" &&
                  order.status !== "REFUNDED";

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-[#D4CCE3] bg-[#F2EFF8]/40 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#51406F]" aria-hidden="true" />
                        <span className="font-mono text-xs font-bold text-[#081838]">
                          #{order.publicReference}
                        </span>
                        <span className="text-xs text-[#596775]">
                          ({new Date(order.createdAt).toLocaleDateString("bn-BD")})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#DDD6EB] text-[#51406F]">
                          {order.status === "CONFIRMED"
                            ? "নিশ্চিতকৃত"
                            : order.status === "CANCELLED"
                              ? "বাতিলকৃত"
                              : order.status}
                        </span>
                        <span className="text-sm font-bold text-[#081838] tabular-nums">
                          {formatBdtFromPaisa(orderPaisa, "bn-BD")}
                        </span>
                      </div>
                    </div>

                    <div className="divide-y divide-[#D4CCE3]/60 text-xs text-[#181D26]">
                      {order.bookItems.map((item) => (
                        <div
                          key={item.id}
                          className="py-2 flex items-center justify-between"
                        >
                          <span className="font-medium text-[#081838]">
                            {item.titleSnapshot}
                          </span>
                          <span className="text-[#596775] tabular-nums">
                            {item.quantity}টি ×{" "}
                            {formatBdtFromPaisa(item.unitPricePaisa, "bn-BD")} ={" "}
                            {formatBdtFromPaisa(item.lineTotalPaisa, "bn-BD")}
                          </span>
                        </div>
                      ))}
                    </div>

                    {order.shippingAddress ? (
                      <div className="text-[11px] text-[#596775] bg-white p-2.5 rounded-lg border border-[#D4CCE3]/60 flex flex-wrap items-center justify-between gap-2">
                        <span>
                          <strong>ডেলিভারি ঠিকানা:</strong> {order.shippingAddress}
                        </span>
                        {canSelfCancel ? (
                          <PortalOrderCancelButton
                            orderId={order.id}
                            orderReference={order.publicReference}
                          />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-[#596775]">
                আপনার কোনো বই ক্রয়ের অর্ডার পাওয়া যায়নি।
              </p>
              <Link
                href="/books"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#51406F] text-white text-xs font-bold hover:bg-[#3F315A] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>প্রকাশিত বই ও প্রিভিউ দেখুন</span>
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
