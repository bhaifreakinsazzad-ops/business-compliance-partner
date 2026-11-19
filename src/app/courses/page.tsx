import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getPublicSiteConfig } from "@/lib/config/site";
import { listPublishedCourses } from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { CourseCard } from "@/components/shared/CourseCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBox } from "@/components/shared/SearchBox";
import { CTASection } from "@/components/shared/CTASection";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "পেশাদার কোর্স ও প্রশিক্ষণ ক্যাটালগ",
  description:
    "বাংলাদেশে Income Tax, VAT & Mushak, e-GP, Customs, Accounting ও Company Secretarial বিষয়ে ব্যবহারিক কোর্স ক্যাটালগ ও আগ্রহ নিবন্ধন।",
  alternates: { canonical: "/courses" },
};

interface CoursesPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { category = "", q = "" } = await searchParams;
  const [siteConfig, { categories, items }] = await Promise.all([
    getPublicSiteConfig(),
    listPublishedCourses({
      categorySlug: category || undefined,
      q: q || undefined,
    }),
  ]);

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* Hero */}
        <section className="bg-ps-midnight text-ps-white py-12 sm:py-14 border-b border-ps-gold/30">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              dark
              items={[{ labelBn: "হোম", href: "/" }, { labelBn: "কোর্স ও প্রশিক্ষণ" }]}
            />
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-ps-gold/40 bg-ps-navy px-3 py-1 text-xs font-medium text-ps-ivory">
                <BookOpen className="w-3.5 h-3.5 text-ps-gold" aria-hidden="true" />
                <span lang="en">Priority 01 • Course Catalogue (Mode A)</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold leading-snug">
                পেশাদার কোর্স ও ব্যবসায়িক প্রশিক্ষণ
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                বাংলাদেশি ব্যবসায়িক আইন, কর, ভ্যাট, কাস্টমস, ই-জিপি এবং অ্যাকাউন্টিং
                বিষয়ে কাঠামোগত প্রশিক্ষণ ক্যাটালগ। সিলেবাস দেখে আপনার আগ্রহ নিবন্ধন করুন।
              </p>
            </div>
          </div>
        </section>

        {/* Search & Category Filter */}
        <section className="py-10 sm:py-12">
          <div className="ps-container space-y-8">
            <div className="rounded-[16px] bg-ps-white border border-ps-border p-5 sm:p-6 space-y-5 shadow-sm">
              <SearchBox
                action="/courses"
                defaultValue={q}
                categoryHiddenValue={category || undefined}
                labelBn="কোর্স অনুসন্ধান করুন"
                placeholderBn="কোর্সের নাম বা বিষয় লিখুন (যেমন: Income Tax, VAT, e-GP, RJSC)..."
              />

              <div className="flex flex-wrap gap-2" role="navigation" aria-label="কোর্স ক্যাটাগরি">
                <Link
                  href={q ? `/courses?q=${encodeURIComponent(q)}` : "/courses"}
                  className={cn(
                    "inline-flex items-center min-h-10 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors",
                    !category
                      ? "bg-ps-navy text-ps-white border-ps-navy"
                      : "bg-ps-cool text-ps-navy border-ps-border hover:bg-ps-white",
                  )}
                >
                  সব ক্যাটাগরি
                </Link>
                {categories.map((cat) => {
                  const active = cat.slug === category;
                  const href = q
                    ? `/courses?category=${encodeURIComponent(cat.slug)}&q=${encodeURIComponent(q)}`
                    : `/courses?category=${encodeURIComponent(cat.slug)}`;
                  return (
                    <Link
                      key={cat.slug}
                      href={href}
                      className={cn(
                        "inline-flex items-center min-h-10 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors",
                        active
                          ? "bg-ps-navy text-ps-white border-ps-navy"
                          : "bg-ps-white text-ps-navy border-ps-border hover:bg-ps-cool",
                      )}
                    >
                      {cat.nameBn}
                    </Link>
                  );
                })}
              </div>
            </div>

            {items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((course) => (
                  <CourseCard key={course.slug} course={course} />
                ))}
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
