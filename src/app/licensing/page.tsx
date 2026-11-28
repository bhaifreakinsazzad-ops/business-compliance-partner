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
import { listPublishedLicensing } from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { AuthorityNote } from "@/components/shared/AuthorityNote";
import { CategoryGrid } from "@/components/shared/CategoryGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { LicensingCard } from "@/components/shared/LicensingCard";
import { SearchBox } from "@/components/shared/SearchBox";
import { CTASection } from "@/components/shared/CTASection";

export const metadata: Metadata = {
  title: "লাইসেন্সিং ও নিবন্ধন নির্দেশিকা",
  description:
    "ট্রেড লাইসেন্স, Smart RJSC, NBR e-TIN/BIN, DIFE LIMA, ফায়ার সার্ভিস e-Fire লাইসেন্স এবং IRC/ERC নিবন্ধন সহায়তা নির্দেশিকা।",
  alternates: { canonical: "/licensing" },
};

const PAGE_SIZE = 12;

interface LicensingPageProps {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

export default async function LicensingPage({
  searchParams,
}: LicensingPageProps) {
  const { category = "", q = "", page = "1" } = await searchParams;
  const [siteConfig, { categories, items }] = await Promise.all([
    getPublicSiteConfig(),
    listPublishedLicensing({
      categorySlug: category || undefined,
      q: q || undefined,
    }),
  ]);
  const canonicalBaseUrl = getCanonicalBaseUrl();
  const activeCategory = categories.find((c) => c.slug === category);

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
    return qs ? `/licensing?${qs}` : "/licensing";
  };

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bcp-periwinkle-contact-header text-[#081838] py-10 sm:py-12 border-b border-[#E1E4F2]">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              items={[
                { labelBn: "হোম", href: "/" },
                { labelBn: "লাইসেন্সিং ও নিবন্ধন" },
              ]}
            />
            <div className="max-w-3xl space-y-2.5">
              <p className="inline-flex items-center gap-2 text-xs font-en font-semibold uppercase tracking-[0.14em] text-[#243FBA]">
                <FileCheck2 className="w-4 h-4 text-[#243FBA]" aria-hidden="true" />
                <span>Licensing &amp; Registration Directory · 6 Categories</span>
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-snug text-[#081838]">
                ব্যবসায়িক লাইসেন্সিং ও নিবন্ধন সহায়তা
              </h1>
              <p className="text-sm sm:text-base text-[#181D26]/85 leading-relaxed">
                সংশ্লিষ্ট সরকারি কর্তৃপক্ষের সঠিক তথ্যসূত্র, প্রাথমিক নথিপত্র এবং
                আবেদন প্রস্তুতির নির্দেশিকা।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <Link
                href="/services"
                className="flex items-center gap-3 rounded-[12px] bg-white border border-[#E1E4F2] text-[#081838] px-4 py-3 font-semibold text-sm hover:border-[#243FBA] transition-colors"
              >
                <BriefcaseBusiness className="w-5 h-5 text-[#243FBA] shrink-0" aria-hidden="true" />
                <span>পেশাদার ব্যবসায়িক সেবা</span>
              </Link>
              <Link
                href="/licensing"
                className="flex items-center gap-3 rounded-[12px] bg-[#243FBA] text-white px-4 py-3 font-bold text-sm shadow-sm"
              >
                <FileCheck2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>লাইসেন্সিং ও নিবন্ধন</span>
              </Link>
              <Link
                href="/consultancy"
                className="flex items-center gap-3 rounded-[12px] bg-white border border-[#E1E4F2] text-[#081838] px-4 py-3 font-semibold text-sm hover:border-[#243FBA] transition-colors"
              >
                <MessageSquareText className="w-5 h-5 text-[#243FBA] shrink-0" aria-hidden="true" />
                <span>বিশেষজ্ঞ কনসালটেন্সি</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="ps-container space-y-8">
            <AuthorityNote limitationsBn={siteConfig.legalDisclaimerBn} />

            <div className="rounded-[16px] bg-white border border-[#E1E4F2] p-5 sm:p-6 space-y-4 shadow-sm">
              <SearchBox
                action="/licensing"
                defaultValue={q}
                categoryHiddenValue={category || undefined}
                labelBn="লাইসেন্স বা নিবন্ধন খুঁজুন"
                placeholderBn="যেমন: Trade Licence, RJSC, DIFE, Fire, IRC, ERC..."
              />

              {(category || q) ? (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm">
                  <p className="text-[#181D26]/85">
                    মোট <strong>{items.length}</strong>টি প্রকাশিত লাইসেন্সিং তথ্য পাওয়া গেছে
                    {activeCategory ? (
                      <>
                        {" "}
                        — বিভাগ: <strong>{activeCategory.nameBn}</strong>
                      </>
                    ) : null}
                  </p>
                  <Link
                    href="/licensing"
                    className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#E1E4F2] bg-[#FBFAFF] px-3 py-1.5 text-xs font-semibold text-[#243FBA] hover:bg-[#E2E3FF]"
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
                  লাইসেন্সিং বিভাগ নির্বাচন করুন
                </h2>
                <p className="text-xs sm:text-sm text-[#596775]">
                  ব্যবসা, পরিবেশ, কারখানা, পণ্য ও আমদানি-রপ্তানি সংক্রান্ত লাইসেন্স বিভাগ।
                </p>
              </div>

              <CategoryGrid
                categories={categories}
                basePath="/licensing"
                activeSlug={category}
                query={q}
                ariaLabel="লাইসেন্সিং বিভাগ"
                showAllCard
                allLabelBn="সব বিভাগ"
                accent="lavender"
                columns={3}
              />
            </div>

            {paginatedItems.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3 border-b border-[#E1E4F2] pb-3">
                  <h2 className="text-lg sm:text-xl font-bold text-[#081838]">
                    {activeCategory
                      ? `${activeCategory.nameBn} — তালিকা`
                      : "প্রকাশিত লাইসেন্সিং ও নিবন্ধনসমূহ"}
                  </h2>
                  <span className="text-xs sm:text-sm font-medium text-[#596775] tabular-nums">
                    মোট {items.length}টি এন্ট্রি
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedItems.map((entry) => (
                    <LicensingCard
                      key={entry.slug}
                      entry={entry}
                      verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                      canonicalBaseUrl={canonicalBaseUrl}
                    />
                  ))}
                </div>

                {totalPages > 1 ? (
                  <nav
                    aria-label="লাইসেন্সিং পেজিনেশন"
                    className="flex flex-wrap items-center justify-center gap-2 pt-2"
                  >
                    {currentPage > 1 ? (
                      <Link
                        href={buildPageHref(currentPage - 1)}
                        className="inline-flex items-center gap-1 min-h-11 px-4 rounded-[10px] border border-[#E1E4F2] bg-white text-sm font-semibold text-[#243FBA] hover:bg-[#FBFAFF]"
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
                        className="inline-flex items-center gap-1 min-h-11 px-4 rounded-[10px] border border-[#E1E4F2] bg-white text-sm font-semibold text-[#243FBA] hover:bg-[#FBFAFF]"
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
                titleBn="এই বিভাগে প্রকাশিত কোনো লাইসেন্সিং তথ্য পাওয়া যায়নি"
                descriptionBn="অন্যান্য বিভাগ দেখুন অথবা আপনার প্রয়োজনীয় অনুমোদনের বিষয়ে সরাসরি পরামর্শের অনুরোধ পাঠান।"
                resetHref="/licensing"
                resetLabelBn="সব লাইসেন্সিং দেখুন"
              />
            )}
          </div>
        </section>

        <CTASection
          titleBn="আপনার ব্যবসার জন্য কোন লাইসেন্সগুলো প্রযোজ্য তা নিশ্চিত হতে চান?"
          descriptionBn="ব্যবসার ধরন ও অবস্থান লিখে পাঠালে আমাদের টিম প্রযোজ্য নিবন্ধন তালিকা পর্যালোচনা করে যোগাযোগ করবে।"
          primaryHref="/consultancy?pillar=LICENSING"
          primaryLabelBn="সহায়তা চাই"
        />
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
