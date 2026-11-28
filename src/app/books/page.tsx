import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Info, X } from "lucide-react";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import { BOOK_PRICING_NOTICE_BN, loadBookCatalog } from "@/lib/books/catalog";
import type { PublicCategoryDTO } from "@/types/domain";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { CategoryGrid } from "@/components/shared/CategoryGrid";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBox } from "@/components/shared/SearchBox";
import { CTASection } from "@/components/shared/CTASection";

export const metadata: Metadata = {
  title: "আমাদের সকল বইসমূহ | পেশাদার প্রকাশনা",
  description:
    "বাংলাদেশে আয়কর, ভ্যাট ও মূসক, e-GP, Smart RJSC, অ্যাকাউন্টিং, ই-কমার্স, কাস্টমস ও শ্রম আইন বিষয়ক আসন্ন কমপ্লায়েন্স বইয়ের প্রিভিউ ও আগ্রহ নিবন্ধন।",
  alternates: { canonical: "/books" },
};

interface BooksPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function BooksPage({ searchParams }: BooksPageProps) {
  const { category = "", q = "" } = await searchParams;
  const siteConfig = await getPublicSiteConfig();
  const canonicalBaseUrl = getCanonicalBaseUrl();

  const { categories, items } = await loadBookCatalog({
    categorySlug: category || undefined,
    q: q || undefined,
  });

  const activeCategory = categories.find((c) => c.slug === category);
  const hasUpcomingBooks = items.some((book) => book.availabilityState === "UPCOMING_PREVIEW");

  const categoryCards: PublicCategoryDTO[] = categories.map((cat) => ({
    id: cat.slug,
    pillar: "COURSES",
    slug: cat.slug,
    nameBn: cat.nameBn,
    nameEn: cat.nameEn,
    shortDescBn: cat.shortDescBn,
    shortDescEn: null,
    iconName: "BookOpen",
    sortOrder: cat.sortOrder,
    publishedCount: cat.previewCount,
  }));

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* Executive Lavender Banner */}
        <section className="bcp-periwinkle-contact-header text-[#081838] py-10 sm:py-12 border-b border-[#E1E4F2]">
          <div className="ps-container space-y-4">
            <Breadcrumbs
              items={[
                { labelBn: "হোম", href: "/" },
                { labelBn: "আমাদের সকল বইসমূহ" },
              ]}
            />
            <div className="max-w-3xl space-y-2.5">
              <p className="inline-flex items-center gap-2 text-xs font-en font-semibold uppercase tracking-[0.14em] text-[#243FBA]">
                <BookOpen className="w-4 h-4 text-[#243FBA]" aria-hidden="true" />
                <span>03 · Books · Practical Knowledge & Publications</span>
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-snug text-[#081838]">
                আমাদের সকল বইসমূহ ও প্রকাশনা
              </h1>
              <p className="text-sm sm:text-base text-[#181D26]/85 leading-relaxed">
                আমাদের কোর্স ও কমপ্লায়েন্স সেবাসমূহের সাথে সামঞ্জস্যপূর্ণ প্র্যাকটিক্যাল
                হ্যান্ডবুক ও রেফারেন্স গাইডসমূহ। প্রতিটি বইয়ের বিষয়সূচি দেখে সরাসরি
                প্রকাশনা আগ্রহ জানাতে পারবেন।
              </p>
            </div>

            {/* Honest Pre-Launch Notice */}
            <div className="rounded-[12px] border border-[#E1E4F2] bg-white/85 px-4 py-3 flex items-start gap-2.5 text-xs sm:text-sm text-[#181D26] max-w-3xl">
              <Info className="w-4 h-4 text-[#243FBA] shrink-0 mt-0.5" aria-hidden="true" />
              <span>{hasUpcomingBooks ? BOOK_PRICING_NOTICE_BN : "প্রকাশিত বইয়ের মূল্য ও প্রাপ্যতা সংশ্লিষ্ট বইয়ের বিস্তারিত পাতায় দেখুন।"}</span>
            </div>
          </div>
        </section>

        {/* Search, Categories & Book Previews */}
        <section className="py-8 sm:py-12">
          <div className="ps-container space-y-8">
            <div className="rounded-[16px] bg-white border border-[#E1E4F2] p-5 sm:p-6 space-y-4 shadow-sm">
              <SearchBox
                action="/books"
                defaultValue={q}
                categoryHiddenValue={category || undefined}
                labelBn="বই অনুসন্ধান করুন"
                placeholderBn="বইয়ের শিরোনাম বা বিষয় লিখুন (যেমন: Income Tax, VAT, RJSC, e-GP, DBID)..."
              />

              {category || q ? (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm">
                  <p className="text-[#181D26]/85">
                    মোট <strong>{items.length}</strong>টি বই পাওয়া গেছে
                    {activeCategory ? (
                      <>
                        {" "}
                        — বিভাগ: <strong>{activeCategory.nameBn}</strong>
                      </>
                    ) : null}
                  </p>
                  <Link
                    href="/books"
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
                  বইয়ের বিভাগ নির্বাচন করুন
                </h2>
                <p className="text-xs sm:text-sm text-[#596775]">
                  বিষয়ভিত্তিক {categories.length}টি প্রকাশনা বিভাগ থেকে আপনার প্রয়োজনীয় বই খুঁজুন।
                </p>
              </div>

              <CategoryGrid
                categories={categoryCards}
                basePath="/books"
                activeSlug={category}
                query={q}
                ariaLabel="বই ক্যাটাগরি"
                showAllCard
                allLabelBn="সকল বই দেখুন"
                accent="lavender"
                columns={3}
              />
            </div>

            {items.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3 border-b border-[#E1E4F2] pb-3">
                  <h2 className="text-lg sm:text-xl font-bold text-[#081838]">
                    {activeCategory
                      ? `${activeCategory.nameBn} — বই ও প্রকাশনা`
                      : "সকল বই ও হ্যান্ডবুক"}
                  </h2>
                  <span className="text-xs sm:text-sm font-medium text-[#596775] tabular-nums">
                    মোট {items.length}টি বই
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((book) => (
                    <BookCard
                      key={book.slug}
                      book={book}
                      verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                      canonicalBaseUrl={canonicalBaseUrl}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                titleBn="এই অনুসন্ধানে কোনো বই পাওয়া যায়নি"
                descriptionBn="অন্যান্য বিভাগ নির্বাচন করুন অথবা আপনার কাঙ্ক্ষিত বিষয়টির ওপর প্রকাশনার জন্য পরামর্শ জানান।"
                resetHref="/books"
                resetLabelBn="সব বই দেখুন"
              />
            )}
          </div>
        </section>

        <CTASection
          eyebrowEn="Courses · Services · Books"
          titleBn="প্রকাশনার আগে থেকেই বই বা কর্পোরেট কপির বিষয়ে আগ্রহ জানাতে চান?"
          descriptionBn="কোনো বই প্রকাশিত হলেই অগ্রাধিকার ভিত্তিতে তথ্য পেতে আপনার আগ্রহ নিবন্ধন করুন অথবা সংশ্লিষ্ট কোর্স ও সেবা দেখুন।"
          primaryHref="/consultancy?pillar=CONSULTANCY&topic=%E0%A6%AC%E0%A6%87+%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%95%E0%A6%BE%E0%A6%B6%E0%A6%A8%E0%A6%BE+%E0%A6%86%E0%A6%97%E0%A7%8D%E0%A6%B0%E0%A6%B9"
          primaryLabelBn="প্রকাশনা আগ্রহ জানান"
          secondaryHref="/courses"
          secondaryLabelBn="Explore Courses · কোর্সসমূহ"
          tertiaryHref="/services"
          tertiaryLabelBn="Explore Services · সেবাসমূহ"
        />
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
