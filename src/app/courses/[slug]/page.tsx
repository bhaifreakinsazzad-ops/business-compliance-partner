import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
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
  const [siteConfig, course] = await Promise.all([
    getPublicSiteConfig(),
    getPublishedCourseBySlug(slug),
  ]);

  if (!course) {
    notFound();
  }

  const canonicalBaseUrl = getCanonicalBaseUrl();
  const relatedCourses = await listRelatedCourses(
    course.categorySlug,
    course.slug,
    3,
  );
  const enquiryHref = `/consultancy?pillar=COURSES&slug=${encodeURIComponent(
    course.slug,
  )}&topic=${encodeURIComponent(course.titleBn)}`;

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bg-ps-midnight text-ps-white py-12 sm:py-14 border-b border-ps-gold/30">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              dark
              items={[
                { labelBn: "হোম", href: "/" },
                { labelBn: "কোর্স", href: "/courses" },
                { labelBn: course.titleBn },
              ]}
            />
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="outline">{course.categoryNameBn}</Badge>
                <StatusBadge status={course.availabilityStatus} />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold leading-snug">
                {course.titleBn}
              </h1>
              {course.titleEn ? (
                <p className="font-en text-sm text-ps-gold" lang="en">
                  {course.titleEn}
                </p>
              ) : null}
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                {course.summaryBn}
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Curriculum Column */}
            <div className="lg:col-span-8 space-y-8">
              <VerificationMeta
                lastVerifiedAt={course.lastVerifiedAt}
                verifiedBy={course.verifiedBy}
              />

              {/* Audience */}
              <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-3">
                <h2 className="text-xl font-bold text-ps-navy inline-flex items-center gap-2">
                  <Users className="w-5 h-5 text-ps-navy" aria-hidden="true" />
                  <span>কোর্সটি কাদের জন্য</span>
                </h2>
                <p className="text-sm sm:text-base text-ps-ink/90 leading-relaxed">
                  {course.audienceBn}
                </p>
              </div>

              {/* Learning Outcomes */}
              <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-4">
                <h2 className="text-xl font-bold text-ps-navy">
                  এই কোর্স থেকে যা শিখবেন
                </h2>
                <ul className="space-y-3">
                  {course.outcomes.map((outcome, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-ps-ink/90">
                      <CheckCircle2
                        className="w-5 h-5 text-ps-success shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Syllabus Modules */}
              <SyllabusExplorer modules={course.syllabus} />
            </div>

            {/* Sidebar — Strictly Verified Fields ONLY (Mode A) */}
            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              <div className="rounded-[16px] border-2 border-ps-navy/15 bg-ps-white p-6 space-y-5 shadow-sm">
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-ps-navy">
                    কোর্স তথ্য ও আগ্রহ নিবন্ধন
                  </h2>
                  <p className="text-xs sm:text-sm text-ps-muted leading-relaxed">
                    ব্যাচের সময়সূচি, মাধ্যম ও ফি কেবল আনুষ্ঠানিকভাবে চূড়ান্ত হলেই
                    এখানে প্রকাশ করা হয়।
                  </p>
                </div>

                <dl className="space-y-3 text-sm border-y border-ps-border py-4">
                  <div className="flex justify-between gap-2">
                    <dt className="text-ps-muted">ক্যাটাগরি</dt>
                    <dd className="font-semibold text-ps-navy text-end">
                      {course.categoryNameBn}
                    </dd>
                  </div>
                  {course.deliveryMode ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-ps-muted">মাধ্যম</dt>
                      <dd className="font-semibold text-ps-navy">{course.deliveryMode}</dd>
                    </div>
                  ) : null}
                  {course.duration ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-ps-muted">সময়কাল</dt>
                      <dd className="font-semibold text-ps-navy">{course.duration}</dd>
                    </div>
                  ) : null}
                  {course.feeDisplay ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-ps-muted">নির্ধারিত ফি</dt>
                      <dd className="font-semibold text-ps-navy">{course.feeDisplay}</dd>
                    </div>
                  ) : null}
                  {course.instructor ? (
                    <div className="flex justify-between gap-2">
                      <dt className="text-ps-muted">প্রশিক্ষক</dt>
                      <dd className="font-semibold text-ps-navy">{course.instructor.nameBn}</dd>
                    </div>
                  ) : null}
                </dl>

                {siteConfig.verifiedWhatsapp ? (
                  <WhatsAppEnquiryButton
                    verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                    serviceName={course.titleBn}
                    servicePath={`/courses/${course.slug}`}
                    canonicalBaseUrl={canonicalBaseUrl}
                    fallbackHref={enquiryHref}
                    labelBn="WhatsApp-এ কোর্স সম্পর্কে জানুন"
                    fallbackLabelBn="কোর্স সম্পর্কে জানতে চাই"
                    fullWidth
                  />
                ) : null}

                <Link href={enquiryHref} className="ps-primary-button w-full">
                  <span>কোর্স সম্পর্কে জানতে চাই</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {relatedCourses.length > 0 ? (
          <section className="py-10 sm:py-12 bg-ps-white border-t border-ps-border">
            <div className="ps-container space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-ps-navy">
                  সম্পর্কিত অন্যান্য কোর্স
                </h2>
                <Link
                  href={`/courses?category=${encodeURIComponent(course.categorySlug)}`}
                  className="text-sm font-semibold text-ps-navy hover:underline underline-offset-4"
                >
                  এই বিভাগের সব কোর্স →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedCourses.map((item) => (
                  <CourseCard key={item.slug} course={item} />
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
