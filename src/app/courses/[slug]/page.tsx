import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import { buildWhatsAppCourseMessage } from "@/lib/contact/whatsapp";
import { loadBookCatalog } from "@/lib/books/catalog";
import { rankRelatedBooks } from "@/lib/recommendations/cross-division";
import {
  getPublishedCourseBySlug,
  listRelatedCourses,
} from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { VerificationMeta } from "@/components/shared/VerificationMeta";
import { SyllabusExplorer } from "@/components/shared/SyllabusExplorer";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";
import { CourseCard } from "@/components/shared/CourseCard";
import { BookCard } from "@/components/books/BookCard";

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CourseDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublishedCourseBySlug(slug);
  if (!course) {
    return { title: "কোর্স পাওয়া যায়নি" };
  }
  return {
    title: course.seoTitle || course.titleBn,
    description: course.seoDescription || course.summaryBn,
    alternates: { canonical: `/courses/${course.slug}` },
  };
}

export default async function CourseDetailPage({
  params,
}: CourseDetailPageProps) {
  const { slug } = await params;
  const [siteConfig, course, allBooksRes] = await Promise.all([
    getPublicSiteConfig(),
    getPublishedCourseBySlug(slug),
    loadBookCatalog(),
  ]);

  if (!course) {
    notFound();
  }

  const canonicalBaseUrl = getCanonicalBaseUrl();
  const coursePath = `/courses/${course.slug}`;
  const relatedCourses = await listRelatedCourses(
    course.categorySlug,
    course.slug,
    3,
  );
  const relatedBooks = rankRelatedBooks(
    allBooksRes.items,
    {
      titleBn: course.titleBn,
      titleEn: course.titleEn,
      categorySlug: course.categorySlug,
      categoryNameBn: course.categoryNameBn,
      summaryBn: course.summaryBn,
      topics: course.outcomes,
      relatedCourseCategorySlug: course.categorySlug,
    },
    undefined,
    2,
  );
  const enquiryHref = `/consultancy?pillar=COURSES&slug=${encodeURIComponent(
    course.slug,
  )}&topic=${encodeURIComponent(course.titleBn)}`;
  const courseWhatsAppMessage = buildWhatsAppCourseMessage({
    courseName: course.titleBn,
    coursePath,
    canonicalBaseUrl,
  });

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bg-gradient-to-br from-[#F2EFF8] via-[#ECE7F5] to-[#E5DDF2] text-[#081838] py-10 sm:py-12 border-b border-[#D4CCE3]">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              items={[
                { labelBn: "হোম", href: "/" },
                { labelBn: "কোর্স", href: "/courses" },
                { labelBn: course.titleBn },
              ]}
            />
            <div className="max-w-3xl space-y-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="cool">{course.categoryNameBn}</Badge>
                <StatusBadge status={course.availabilityStatus} />
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold leading-snug text-[#081838]">
                {course.titleBn}
              </h1>
              {course.titleEn ? (
                <p className="font-en text-sm font-semibold text-[#51406F]" lang="en">
                  {course.titleEn}
                </p>
              ) : null}
              <p className="text-sm sm:text-base text-[#181D26]/85 leading-relaxed">
                {course.summaryBn}
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <VerificationMeta
                lastVerifiedAt={course.lastVerifiedAt}
                verifiedBy={course.verifiedBy}
              />

              <div className="rounded-[16px] border border-[#D4CCE3] bg-white p-6 space-y-3">
                <h2 className="text-xl font-bold text-[#081838] inline-flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#51406F]" aria-hidden="true" />
                  <span>কোর্সটি কাদের জন্য</span>
                </h2>
                <p className="text-sm sm:text-base text-[#181D26]/90 leading-relaxed">
                  {course.audienceBn}
                </p>
              </div>

              <div className="rounded-[16px] border border-[#D4CCE3] bg-white p-6 space-y-4">
                <h2 className="text-xl font-bold text-[#081838]">
                  এই কোর্স থেকে যা শিখবেন
                </h2>
                <ul className="space-y-3">
                  {course.outcomes.map((outcome, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm sm:text-base text-[#181D26]/90"
                    >
                      <CheckCircle2
                        className="w-5 h-5 text-[#00865A] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <SyllabusExplorer modules={course.syllabus} />
            </div>

            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              <div className="rounded-[16px] border border-[#D4CCE3] bg-white p-6 space-y-5 shadow-sm">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-[#081838]">
                    কোর্স তথ্য ও আগ্রহ নিবন্ধন
                  </h2>
                  <p className="text-xs sm:text-sm text-[#596775] leading-relaxed">
                    ব্যাচের সময়সূচি, মাধ্যম ও ফি কেবল আনুষ্ঠানিকভাবে চূড়ান্ত হলেই
                    এখানে প্রকাশ করা হয়।
                  </p>
                </div>

                <dl className="space-y-3 text-sm border-y border-[#D4CCE3] py-4">
                  <div className="flex justify-between gap-2">
                    <dt className="text-[#596775]">ক্যাটাগরি</dt>
                    <dd className="font-semibold text-[#081838] text-end">
                      {course.categoryNameBn}
                    </dd>
                  </div>
                  {course.deliveryMode ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#596775]">মাধ্যম</dt>
                      <dd className="font-semibold text-[#081838]">
                        {course.deliveryMode}
                      </dd>
                    </div>
                  ) : null}
                  {course.duration ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#596775]">সময়কাল</dt>
                      <dd className="font-semibold text-[#081838]">
                        {course.duration}
                      </dd>
                    </div>
                  ) : null}
                  {course.feeDisplay ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#596775]">নির্ধারিত ফি</dt>
                      <dd className="font-semibold text-[#081838] tabular-nums">
                        {course.feeDisplay}
                      </dd>
                    </div>
                  ) : null}
                  {course.instructor ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-[#596775]">প্রশিক্ষক</dt>
                      <dd className="font-semibold text-[#081838]">
                        {course.instructor.nameBn}
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <div className="space-y-2.5">
                  <WhatsAppEnquiryButton
                    verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                    serviceName={course.titleBn}
                    servicePath={coursePath}
                    canonicalBaseUrl={canonicalBaseUrl}
                    customMessage={courseWhatsAppMessage}
                    fallbackHref={enquiryHref}
                    labelBn="WhatsApp-এ কোর্স সম্পর্কে জানুন"
                    fallbackLabelBn="কোর্স সম্পর্কে জানতে চাই"
                    size="lg"
                    fullWidth
                  />
                  <Link href={enquiryHref} className="ps-secondary-button w-full">
                    <span>অনলাইন ফর্মে আগ্রহ জানান</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* Cross-Division Books Discovery */}
        {relatedBooks.length > 0 ? (
          <section className="py-10 sm:py-12 bg-[#F2EFF8]/65 border-t border-[#D4CCE3]">
            <div className="ps-container space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
                  এই কোর্সের সাথে সহায়ক প্রস্তাবিত বইসমূহ
                </h2>
                <Link
                  href="/books"
                  className="text-sm font-semibold text-[#51406F] hover:underline underline-offset-4"
                >
                  সব বই প্রিভিউ →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedBooks.map((book) => (
                  <BookCard
                    key={book.slug}
                    book={book}
                    verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                    canonicalBaseUrl={canonicalBaseUrl}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {relatedCourses.length > 0 ? (
          <section className="py-10 sm:py-12 bg-white border-t border-[#D4CCE3]">
            <div className="ps-container space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
                  সম্পর্কিত অন্যান্য কোর্স
                </h2>
                <Link
                  href={`/courses?category=${encodeURIComponent(course.categorySlug)}`}
                  className="text-sm font-semibold text-[#51406F] hover:underline underline-offset-4"
                >
                  এই বিভাগের সব কোর্স →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCourses.map((item) => (
                  <CourseCard
                    key={item.slug}
                    course={item}
                    verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                    canonicalBaseUrl={canonicalBaseUrl}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
