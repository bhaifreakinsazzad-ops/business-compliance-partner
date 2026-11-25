import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ChevronLeft, ChevronRight, X } from "lucide-react";
import { getPublicSiteConfig } from "@/lib/config/site";
import {
  listPublishedCourses,
  sortCourseCategoriesByClientPriority,
} from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { CategoryGrid } from "@/components/shared/CategoryGrid";
import { CourseCard } from "@/components/shared/CourseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBox } from "@/components/shared/SearchBox";
import { CTASection } from "@/components/shared/CTASection";

export const metadata: Metadata = {
  title: "পেশাদার কোর্স ও প্রশিক্ষণ ক্যাটালগ",
  description:
    "বাংলাদেশে Income Tax, VAT & Mushak, e-GP, E-commerce, RJSC, Customs ও Accounting বিষয়ে ব্যবহারিক কোর্স ক্যাটালগ ও আগ্রহ নিবন্ধন।",
  alternates: { canonical: "/courses" },
};

const PAGE_SIZE = 12;

interface CoursesPageProps {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { category = "", q = "", page = "1" } = await searchParams;
  const [siteConfig, { categories, items }] = await Promise.all([
    getPublicSiteConfig(),
    listPublishedCourses({
      categorySlug: category || undefined,
      q: q || undefined,
    }),
  ]);

  const orderedCategories = sortCourseCategoriesByClientPriority(categories);
  const activeCategory = orderedCategories.find((c) => c.slug === category);

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
    return qs ? `/courses?${qs}` : "/courses";
  };

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* Compact Hero */}
        <section className="bg-ps-midnight text-ps-white py-10 sm:py-12 border-b border-ps-gold/30">
          <div className="ps-container space-y-4">
            <Breadcrumbs
              dark
              items={[{ labelBn: "হোম", href: "/" }, { labelBn: "কোর্স ও প্রশিক্ষণ" }]}
            />
            <div className="max-w-3xl space-y-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-ps-gold/40 bg-ps-navy px-3 py-1 text-xs font-medium text-ps-ivory">
                <BookOpen className="w-3.5 h-3.5 text-ps-gold" aria-hidden="true" />
                <span lang="en">Course Discovery Hub • 10 Tracks</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold leading-snug">
                পেশাদার কোর্স ও ব্যবসায়িক প্রশিক্ষণ
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                Tax, VAT, e-GP, E-commerce এবং RJSC সহ ১০টি ক্যাটাগরি থেকে আপনার
                প্রয়োজনীয় ব্যবহারিক প্রশিক্ষণ কোর্স বেছে নিন।
              </p>
            </div>
          </div>
        </section>

        {/* Search & Category-First Discovery */}
        <section className="py-8 sm:py-12">
          <div className="ps-container space-y-8">
            <div className="rounded-[16px] bg-ps-white border border-ps-border p-5 sm:p-6 space-y-4 shadow-sm">
              <SearchBox
                action="/courses"
                defaultValue={q}
                categoryHiddenValue={category || undefined}
                labelBn="কোর্স অনুসন্ধান করুন"
                placeholderBn="কোর্সের নাম বা বিষয় লিখুন (যেমন: Income Tax, VAT, e-GP, RJSC)..."
              />

              {(category || q) ? (
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs sm:text-sm">
                  <p className="text-ps-ink/85">
                    মোট <strong>{items.length}</strong>টি প্রকাশিত কোর্স পাওয়া গেছে
                    {activeCategory ? (
                      <>
                        {" "}
                        — ক্যাটাগরি: <strong>{activeCategory.nameBn}</strong>
                      </>
                    ) : null}
                  </p>
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-1.5 rounded-full border border-ps-border bg-ps-cool px-3 py-1.5 text-xs font-semibold text-ps-navy hover:bg-ps-ivory"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>ফিল্টার মুছুন</span>
                  </Link>
                </div>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-ps-navy">
                    কোর্স ক্যাটাগরি নির্বাচন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-ps-muted">
                    Tax, VAT, e-GP, E-commerce ও Company Secretarial (RJSC) অগ্রাধিকার ক্রমে সাজানো।
                  </p>
                </div>
              </div>

              <CategoryGrid
                categories={orderedCategories}
                basePath="/courses"
                activeSlug={category}
                query={q}
                ariaLabel="কোর্স ক্যাটাগরি"
                showAllCard
                allLabelBn="সব ক্যাটাগরি"
                accent="gold"
                columns={3}
                highlightCount={5}
              />
            </div>

            {paginatedItems.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-3 border-b border-ps-border pb-3">
                  <h2 className="text-lg sm:text-xl font-bold text-ps-navy">
                    {activeCategory
                      ? `${activeCategory.nameBn} — কোর্স তালিকা`
                      : "প্রকাশিত কোর্সসমূহ"}
                  </h2>
                  <span className="text-xs sm:text-sm font-medium text-ps-muted">
                    মোট {items.length}টি কোর্স
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedItems.map((course) => (
                    <CourseCard key={course.slug} course={course} />
                  ))}
                </div>

                {totalPages > 1 ? (
                  <nav
                    aria-label="কোর্স পেজিনেশন"
                    className="flex flex-wrap items-center justify-center gap-2 pt-2"
                  >
                    {currentPage > 1 ? (
                      <Link
                        href={buildPageHref(currentPage - 1)}
                        className="inline-flex items-center gap-1 min-h-11 px-4 rounded-[10px] border border-ps-border bg-ps-white text-sm font-semibold text-ps-navy hover:bg-ps-cool"
                      >
                        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                        <span>পূর্ববর্তী</span>
                      </Link>
                    ) : null}
                    <span className="px-3 text-sm font-medium text-ps-muted">
                      পৃষ্ঠা {currentPage} / {totalPages}
                    </span>
                    {currentPage < totalPages ? (
                      <Link
                        href={buildPageHref(currentPage + 1)}
                        className="inline-flex items-center gap-1 min-h-11 px-4 rounded-[10px] border border-ps-border bg-ps-white text-sm font-semibold text-ps-navy hover:bg-ps-cool"
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
                titleBn="এই ফিল্টারে প্রকাশিত কোনো কোর্স পাওয়া যায়নি"
                descriptionBn="অন্যান্য ক্যাটাগরি নির্বাচন করুন অথবা আমাদের কনসালটেন্সি ফর্মের মাধ্যমে নির্দিষ্ট প্রশিক্ষণের আগ্রহ জানান।"
                resetHref="/courses"
                resetLabelBn="সব কোর্স দেখুন"
              />
            )}
          </div>
        </section>

        <CTASection
          titleBn="আপনার প্রতিষ্ঠানের জন্য কাস্টম বা নির্দিষ্ট বিষয়ে প্রশিক্ষণ প্রয়োজন?"
          descriptionBn="আপনার আগ্রহ ও প্রয়োজনের বিষয়টি লিখে পাঠান—নতুন ব্যাচ বা কারিকুলাম চূড়ান্ত হলে আমাদের টিম যোগাযোগ করবে।"
          primaryHref="/consultancy?pillar=COURSES"
          primaryLabelBn="কোর্স সম্পর্কে জানতে চাই"
        />
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
