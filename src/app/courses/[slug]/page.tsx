import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Users } from "lucide-react";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import { buildWhatsAppCourseMessage } from "@/lib/contact/whatsapp";
import { getPublishedCourseBySlug } from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { VerificationMeta } from "@/components/shared/VerificationMeta";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";

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
  const coursePath = `/courses/${course.slug}`;
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
              <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-4">
                <h2 className="text-xl font-bold text-ps-navy">
                  প্রস্তাবিত মডিউল ও সিলেবাস
                </h2>
                <div className="space-y-3">
                  {course.syllabus.map((mod, idx) => (
                    <details
                      key={idx}
                      open={idx === 0}
                      className="ps-disclosure rounded-[12px] border border-ps-border bg-ps-ivory/50"
                    >
                      <summary className="p-4 font-bold text-ps-navy text-sm sm:text-base">
                        {mod.titleBn}
                      </summary>
                      <ul className="px-4 pb-4 space-y-1.5 text-sm text-ps-ink/85 list-disc list-inside">
                        {mod.topicsBn.map((topic, tIdx) => (
                          <li key={tIdx}>{topic}</li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </div>
              </div>
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
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
