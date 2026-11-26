import type { Metadata } from "next";
import Link from "next/link";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  MessageSquareText,
  X,
} from "lucide-react";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import {
  listPublishedServices,
  resolveServiceCategorySlug,
} from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { CategoryGrid } from "@/components/shared/CategoryGrid";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBox } from "@/components/shared/SearchBox";
import { CTASection } from "@/components/shared/CTASection";

export const metadata: Metadata = {
  title: "পেশাদার ব্যবসায়িক সেবা ক্যাটালগ",
  description:
    "Tax, VAT, e-GP, Smart RJSC, কাস্টমস, অ্যাকাউন্টিং এবং HR কমপ্লায়েন্স বিষয়ক পেশাদার ব্যবসায়িক সহায়তা ক্যাটালগ।",
  alternates: { canonical: "/services" },
};

const PAGE_SIZE = 12;

interface ServicesPageProps {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { category = "", q = "", page = "1" } = await searchParams;
  const resolvedCategory = resolveServiceCategorySlug(category) ?? "";
  const [siteConfig, { categories, items }] = await Promise.all([
    getPublicSiteConfig(),
    listPublishedServices({
      categorySlug: resolvedCategory || undefined,
      q: q || undefined,
    }),
  ]);

  const canonicalBaseUrl = getCanonicalBaseUrl();
  const activeCategory = categories.find((c) => c.slug === resolvedCategory);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const parsedPage = Number.parseInt(page, 10);
  const currentPage =
    Number.isFinite(parsedPage) && parsedPage >= 1
      ? Math.min(parsedPage, totalPages)
      : 1;
  const paginatedItems = items.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const buildPageHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/services?${qs}` : "/services";
  };

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bg-gradient-to-br from-[#F2EFF8] via-[#ECE7F5] to-[#E5DDF2] text-[#081838] py-10 sm:py-12 border-b border-[#D4CCE3]">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              items={[{ labelBn: "হোম", href: "/" }, { labelBn: "পেশাদার সেবা" }]}
            />
            <div className="max-w-3xl space-y-2.5">
              <p className="inline-flex items-center gap-2 text-xs font-en font-semibold uppercase tracking-[0.14em] text-[#51406F]">
                <BriefcaseBusiness className="w-4 h-4 text-[#51406F]" aria-hidden="true" />
                <span>Professional Business Services · 11 Categories</span>
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-snug text-[#081838]">
                পেশাদার ব্যবসায়িক ও কমপ্লায়েন্স সেবাসমূহ
              </h1>
              <p className="text-sm sm:text-base text-[#181D26]/85 leading-relaxed">
                ট্যাক্স, ভ্যাট, e-GP, কোম্পানি সেক্রেটারিয়াল, আমদানি-রপ্তানি ও
                অ্যাকাউন্টিং বিষয়ে সুসংগঠিত সেবা ও সরাসরি WhatsApp সহায়তা।
              </p>
            </div>

            {/* 3-Gateway Quick Switcher: Services, Licensing, Consultancy */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <Link
                href="/services"
                className="flex items-center gap-3 rounded-[12px] bg-[#51406F] text-white px-4 py-3 font-bold text-sm shadow-sm"
              >
                <BriefcaseBusiness className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>পেশাদার ব্যবসায়িক সেবা</span>
              </Link>
              <Link
                href="/licensing"
                className="flex items-center gap-3 rounded-[12px] bg-white border border-[#D4CCE3] text-[#081838] px-4 py-3 font-semibold text-sm hover:border-[#51406F] transition-colors"
              >
                <FileCheck2 className="w-5 h-5 text-[#51406F] shrink-0" aria-hidden="true" />
                <span>লাইসেন্সিং ও নিবন্ধন</span>
              </Link>
              <Link
                href="/consultancy"
                className="flex items-center gap-3 rounded-[12px] bg-white border border-[#D4CCE3] text-[#081838] px-4 py-3 font-semibold text-sm hover:border-[#51406F] transition-colors"
              >
                <MessageSquareText className="w-5 h-5 text-[#51406F] shrink-0" aria-hidden="true" />
                <span>বিশেষজ্ঞ কনসালটেন্সি</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="ps-container space-y-8">
            <div className="rounded-[16px] bg-white border border-[#D4CCE3] p-5 sm:p-6 space-y-4 shadow-sm">
              <SearchBox
                action="/services"
                defaultValue={q}
                categoryHiddenValue={category || undefined}
                labelBn="পেশাদার সেবা খুঁজুন"
                placeholderBn="সেবার নাম বা বিষয় লিখুন (যেমন: e-TIN, BIN, RJSC, e-GP, Bookkeeping)..."
              />

              {(category || q) ? (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm">
                  <p className="text-[#181D26]/85">
                    মোট <strong>{items.length}</strong>টি প্রকাশিত সেবা পাওয়া গেছে
                    {activeCategory ? (
                      <>
                        {" "}
                        — বিভাগ: <strong>{activeCategory.nameBn}</strong>
                      </>
                    ) : null}
                  </p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#D4CCE3] bg-[#F2EFF8] px-3 py-1.5 text-xs font-semibold text-[#51406F] hover:bg-[#DDD6EB]"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>ফিল্টার মুছুন</span>
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
                  সেবা বিভাগ নির্বাচন করুন
                </h2>
                <p className="text-xs sm:text-sm text-[#596775]">
                  আপনার প্রয়োজনীয় বিভাগ নির্বাচন করে সরাসরি WhatsApp বা অনলাইন অনুরোধ পাঠান।
                </p>
              </div>

              <CategoryGrid
                categories={categories}
                basePath="/services"
                activeSlug={resolvedCategory}
                query={q}
                ariaLabel="সেবা ক্যাটাগরি"
                showAllCard
                allLabelBn="সব বিভাগ"
                accent="lavender"
                columns={3}
              />
            </div>

            {paginatedItems.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3 border-b border-[#D4CCE3] pb-3">
                  <h2 className="text-lg sm:text-xl font-bold text-[#081838]">
                    {activeCategory
                      ? `${activeCategory.nameBn} — সেবাসমূহ`
                      : "প্রকাশিত পেশাদার সেবাসমূহ"}
                  </h2>
                  <span className="text-xs sm:text-sm font-medium text-[#596775] tabular-nums">
                    মোট {items.length}টি সেবা
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedItems.map((svc) => (
                    <ServiceCard
                      key={svc.slug}
                      service={svc}
                      verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                      canonicalBaseUrl={canonicalBaseUrl}
                    />
                  ))}
                </div>

                {totalPages > 1 ? (
                  <nav
                    aria-label="সেবা পেজিনেশন"
                    className="flex flex-wrap items-center justify-center gap-2 pt-2"
                  >
                    {currentPage > 1 ? (
                      <Link
                        href={buildPageHref(currentPage - 1)}
                        className="inline-flex items-center gap-1 min-h-11 px-4 rounded-[10px] border border-[#D4CCE3] bg-white text-sm font-semibold text-[#51406F] hover:bg-[#F2EFF8]"
                      >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        <span>পূর্ববর্তী</span>
                      </Link>
                    ) : null}
                    <span className="px-3 text-sm font-medium text-[#596775] tabular-nums">
                      পৃষ্ঠা {currentPage} / {totalPages}
                    </span>
                    {currentPage < totalPages ? (
                      <Link
                        href={buildPageHref(currentPage + 1)}
                        className="inline-flex items-center gap-1 min-h-11 px-4 rounded-[10px] border border-[#D4CCE3] bg-white text-sm font-semibold text-[#51406F] hover:bg-[#F2EFF8]"
                      >
                        <span>পরবর্তী</span>
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    ) : null}
                  </nav>
                ) : null}
              </div>
            ) : (
              <EmptyState
                titleBn="এই বিভাগে প্রকাশিত কোনো সেবা পাওয়া যায়নি"
                descriptionBn="অন্যান্য বিভাগ দেখুন অথবা সরাসরি আপনার ব্যবসার প্রয়োজন লিখে আমাদের টিমের কাছে পাঠান।"
                resetHref="/services"
                resetLabelBn="সব সেবা দেখুন"
              />
            )}
          </div>
        </section>

        <CTASection
          titleBn="আপনার ব্যবসার প্রয়োজনীয় সেবাটি তালিকায় খুঁজে পাচ্ছেন না?"
          descriptionBn="সংক্ষেপে আপনার সমস্যাটি লিখে পাঠালে আমাদের টিম পর্যালোচনা করে উপযুক্ত সময়ে যোগাযোগ করবে।"
          primaryHref="/consultancy?pillar=SERVICES"
          primaryLabelBn="পরামর্শের অনুরোধ করুন"
        />
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
