import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen, CheckCircle2, Info, Users } from "lucide-react";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import {
  BOOK_AVAILABILITY_BADGE_BN,
  getGovernedBookBySlug,
  loadBookCatalog,
} from "@/lib/books/catalog";
import { formatBdtFromPaisa } from "@/lib/commerce/payments";
import { buildWhatsAppBookMessage } from "@/lib/contact/whatsapp";
import {
  rankRelatedBooks,
  rankRelatedCourses,
  rankRelatedServices,
} from "@/lib/recommendations/cross-division";
import {
  listPublishedCourses,
  listPublishedServices,
} from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { BookPreview3D } from "@/components/three/BookPreview3D";
import { BookCard } from "@/components/books/BookCard";
import { BookCheckoutPanel } from "@/components/books/BookCheckoutPanel";
import { CourseCard } from "@/components/shared/CourseCard";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";

interface BookDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BookDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getGovernedBookBySlug(slug);
  if (!book) {
    return { title: "বইটি পাওয়া যায়নি" };
  }
  return {
    title: `${book.titleBn} | ${book.availabilityState === "PUBLISHED_PRICED" ? "বই ও অর্ডার" : "প্রকাশনা প্রিভিউ"}`,
    description: book.summaryBn,
    alternates: { canonical: `/books/${book.slug}` },
  };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params;
  const book = await getGovernedBookBySlug(slug);
  if (!book) {
    notFound();
  }

  const [siteConfig, allCoursesRes, allServicesRes, allBooksRes] =
    await Promise.all([
      getPublicSiteConfig(),
      listPublishedCourses(),
      listPublishedServices(),
      loadBookCatalog(),
    ]);

  const canonicalBaseUrl = getCanonicalBaseUrl();
  const bookPath = `/books/${book.slug}`;
  const enquiryHref = `/consultancy?pillar=CONSULTANCY&slug=${encodeURIComponent(
    book.slug,
  )}&topic=${encodeURIComponent(`প্রস্তাবিত বই: ${book.titleBn}`)}`;
  const bookWhatsAppMessage = buildWhatsAppBookMessage({
    bookTitle: book.titleBn,
    bookPath,
    canonicalBaseUrl,
  });

  const crossContext = {
    titleBn: book.titleBn,
    titleEn: book.titleEn,
    categorySlug: book.categorySlug,
    categoryNameBn: book.categoryNameBn,
    summaryBn: book.summaryBn,
    topics: book.topicsBn,
    relatedCourseCategorySlug: book.relatedCourseCategorySlug,
    relatedServiceCategorySlug: book.relatedServiceCategorySlug,
    relatedLicensingCategorySlug: book.relatedLicensingCategorySlug,
  };

  const relatedCourses = rankRelatedCourses(
    allCoursesRes.items,
    crossContext,
    undefined,
    2,
  );
  const relatedServices = rankRelatedServices(
    allServicesRes.items,
    crossContext,
    undefined,
    2,
  );
  const relatedBooks = rankRelatedBooks(
    allBooksRes.items,
    crossContext,
    book.slug,
    3,
  );

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* Executive Lavender Detail Header */}
        <section className="bcp-periwinkle-contact-header text-[#081838] py-10 sm:py-12 border-b border-[#E1E4F2]">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              items={[
                { labelBn: "হোম", href: "/" },
                { labelBn: "আমাদের সকল বইসমূহ", href: "/books" },
                { labelBn: book.titleBn },
              ]}
            />
            <div className="max-w-3xl space-y-3">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold">
                <span className="text-[#243FBA]">{book.categoryNameBn}</span>
                <span aria-hidden="true" className="text-[#E1E4F2]">
                  ·
                </span>
                {book.availabilityState === "PUBLISHED_PRICED" &&
                typeof book.pricePaisa === "number" ? (
                  <span className="text-[#00865A] font-bold tabular-nums">
                    প্রকাশিত সংস্করণ · {formatBdtFromPaisa(book.pricePaisa)}
                  </span>
                ) : (
                  <span className="text-[#9A6300]">{BOOK_AVAILABILITY_BADGE_BN}</span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold leading-snug text-[#081838]">
                {book.titleBn}
              </h1>
              <p className="font-en text-sm font-semibold text-[#243FBA]" lang="en">
                {book.titleEn}
              </p>
              <p className="text-sm sm:text-base text-[#181D26]/85 leading-relaxed">
                {book.subtitleBn}
              </p>
            </div>
          </div>
        </section>

        {/* Main Content + 3D Book Preview + Sticky Interest Box */}
        <section className="py-10 sm:py-14">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              {/* Interactive 3D Hardcover Preview */}
              <BookPreview3D book={book} />

              {/* Publication & Pricing Notice */}
              <div className="rounded-[16px] border border-[#E1E4F2] bg-[#FBFAFF] p-5 sm:p-6 flex items-start gap-3">
                <Info className="w-5 h-5 text-[#243FBA] shrink-0 mt-0.5" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#081838]">
                    প্রকাশনা ও মূল্য সম্পর্কিত তথ্য
                  </p>
                  <p className="text-xs sm:text-sm text-[#181D26]/85 leading-relaxed">
                    {book.editionNoteBn}
                  </p>
                </div>
              </div>

              {/* Book Overview */}
              <div className="rounded-[16px] border border-[#E1E4F2] bg-white p-6 space-y-3">
                <h2 className="text-xl font-bold text-[#081838] inline-flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#243FBA]" aria-hidden="true" />
                  <span>বইয়ের সারসংক্ষেপ</span>
                </h2>
                <p className="text-sm sm:text-base text-[#181D26]/90 leading-relaxed">
                  {book.summaryBn}
                </p>
              </div>

              {/* Audience */}
              <div className="rounded-[16px] border border-[#E1E4F2] bg-white p-6 space-y-3">
                <h2 className="text-xl font-bold text-[#081838] inline-flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#243FBA]" aria-hidden="true" />
                  <span>বইটি কাদের জন্য উপযোগী</span>
                </h2>
                <p className="text-sm sm:text-base text-[#181D26]/90 leading-relaxed">
                  {book.audienceBn}
                </p>
              </div>

              {/* Proposed Topics / Outline */}
              <div className="rounded-[16px] border border-[#E1E4F2] bg-white p-6 space-y-4">
                <h2 className="text-xl font-bold text-[#081838]">
                  প্রস্তাবিত সূচিপত্র ও মূল বিষয়সমূহ
                </h2>
                <ul className="space-y-3">
                  {book.topicsBn.map((topic, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm sm:text-base text-[#181D26]/90"
                    >
                      <CheckCircle2
                        className="w-5 h-5 text-[#00865A] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sticky Commercial Sidebar: Checkout for Priced Edition or Enquiry for Preview */}
            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              {book.availabilityState === "PUBLISHED_PRICED" &&
              typeof book.pricePaisa === "number" &&
              book.pricePaisa > 0 ? (
                <BookCheckoutPanel book={book} />
              ) : (
                <div className="rounded-[16px] border border-border-subtle bg-white p-6 space-y-5 shadow-sm">
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-text-primary">
                      প্রকাশনা আগ্রহ নিবন্ধন
                    </h2>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      বইটি প্রকাশিত হলে বা প্রি-অর্ডার শুরু হলে অগ্রাধিকার ভিত্তিতে তথ্য পেতে
                      নিচের মাধ্যমগুলোতে যোগাযোগ করুন।
                    </p>
                  </div>

                  <dl className="space-y-3 text-sm border-y border-border-subtle py-4">
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">বিভাগ</dt>
                      <dd className="font-semibold text-text-primary text-end">
                        {book.categoryNameBn}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">অবস্থা</dt>
                      <dd className="font-semibold text-[#8A5800] text-end">
                        {BOOK_AVAILABILITY_BADGE_BN}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-text-muted">সংস্করণ ও মূল্য</dt>
                      <dd className="font-semibold text-text-accent text-end">
                        প্রকাশনার সময় জানানো হবে
                      </dd>
                    </div>
                  </dl>

                  <div className="space-y-2.5">
                    <WhatsAppEnquiryButton
                      verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                      serviceName={book.titleBn}
                      servicePath={bookPath}
                      canonicalBaseUrl={canonicalBaseUrl}
                      customMessage={bookWhatsAppMessage}
                      fallbackHref={enquiryHref}
                      labelBn="WhatsApp-এ আগ্রহ জানান"
                      fallbackLabelBn="আগ্রহ নিবন্ধন করুন"
                      size="lg"
                      fullWidth
                    />
                    <Link href={enquiryHref} className="ps-secondary-button w-full">
                      <span>অনলাইন ফর্মে আগ্রহ জানান</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        {/* Cross-Division Discovery: Related Courses & Services */}
        {relatedCourses.length > 0 || relatedServices.length > 0 ? (
          <section className="py-10 sm:py-14 bg-[#FBFAFF]/65 border-t border-[#E1E4F2]">
            <div className="ps-container space-y-10">
              {relatedCourses.length > 0 ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
                      এই বিষয়ের সাথে সম্পর্কিত কোর্সসমূহ
                    </h2>
                    <Link
                      href={`/courses?category=${encodeURIComponent(
                        book.relatedCourseCategorySlug ?? "",
                      )}`}
                      className="text-sm font-semibold text-[#243FBA] hover:underline underline-offset-4"
                    >
                      সকল কোর্স দেখুন →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {relatedCourses.map((course) => (
                      <CourseCard
                        key={course.slug}
                        course={course}
                        verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                        canonicalBaseUrl={canonicalBaseUrl}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              {relatedServices.length > 0 ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
                      সংশ্লিষ্ট পেশাদার কমপ্লায়েন্স সেবাসমূহ
                    </h2>
                    <Link
                      href={`/services?category=${encodeURIComponent(
                        book.relatedServiceCategorySlug ?? "",
                      )}`}
                      className="text-sm font-semibold text-[#243FBA] hover:underline underline-offset-4"
                    >
                      সকল সেবা দেখুন →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {relatedServices.map((svc) => (
                      <ServiceCard
                        key={svc.slug}
                        service={svc}
                        verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                        canonicalBaseUrl={canonicalBaseUrl}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* More Upcoming Books */}
        <section className="py-10 sm:py-12 bg-white border-t border-[#E1E4F2]">
          <div className="ps-container space-y-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
                অন্যান্য প্রস্তাবিত বইসমূহ
              </h2>
              <Link
                href="/books"
                className="text-sm font-semibold text-[#243FBA] hover:underline underline-offset-4"
              >
                সব বই দেখুন →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedBooks.map((item) => (
                <BookCard
                  key={item.slug}
                  book={item}
                  verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                  canonicalBaseUrl={canonicalBaseUrl}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
