import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import { loadBookCatalog } from "@/lib/books/catalog";
import {
  listPublishedCourses,
  listPublishedFaqs,
  listPublishedLicensing,
  listPublishedServices,
  sortCourseCategoriesByClientPriority,
} from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Footer } from "@/components/layout/Footer";
import { PromotionalHeroSlider } from "@/components/home/PromotionalHeroSlider";
import { PrimaryBusinessActions } from "@/components/home/PrimaryBusinessActions";
import { ConnectedEcosystemShowcase } from "@/components/home/ConnectedEcosystemShowcase";
import { CategoryGrid } from "@/components/shared/CategoryGrid";
import { CourseCard } from "@/components/shared/CourseCard";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { LicensingCard } from "@/components/shared/LicensingCard";
import { BookCard } from "@/components/books/BookCard";
import { AuthorityNote } from "@/components/shared/AuthorityNote";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { CTASection } from "@/components/shared/CTASection";
import { StatCounters } from "@/components/ui/StatCounters";
import { LazyCompliance3D } from "@/components/ui/LazyCompliance3D";
import { MotionReveal } from "@/components/ui/MotionReveal";
import { StickyNarrativeSection } from "@/components/motion/StickyNarrativeSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { UnifiedSearchSection } from "@/components/home/UnifiedSearchSection";
import { BusinessSolutionFinder } from "@/components/home/BusinessSolutionFinder";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { ConsultancyForm } from "@/components/forms/ConsultancyForm";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";

const CLIENT_JOURNEY_STEPS = [
  {
    stepNumber: 1,
    titleBn: "প্রয়োজন নির্বাচন",
    descriptionBn:
      "Courses-এ শিখতে চান, Services-এ পেশাদার সহায়তা চান নাকি Books-এ বইয়ের প্রিভিউ দেখতে চান—তা বেছে নিন।",
  },
  {
    stepNumber: 2,
    titleBn: "বিস্তারিত ও নথি যাচাই",
    descriptionBn:
      "সিলেবাস, সেবার পরিধি, বইয়ের বিষয়সূচি ও প্রাথমিক নথির চেকলিস্ট সহজেই দেখে নিন।",
  },
  {
    stepNumber: 3,
    titleBn: "সরাসরি WhatsApp বা ফর্ম",
    descriptionBn:
      "কোনো বাড়তি ধাপ ছাড়াই WhatsApp-এ বার্তা পাঠান বা অনলাইন অনুরোধ জমা দিন।",
  },
  {
    stepNumber: 4,
    titleBn: "পেশাদার সহায়তা",
    descriptionBn:
      "আমাদের টিম যাচাই শেষে উপযুক্ত সময়ে আপনার সাথে যোগাযোগ করে দিকনির্দেশনা দেবে।",
  },
];

export default async function HomePage() {
  const [siteConfig, coursesData, servicesData, licensingData, faqs, booksData] =
    await Promise.all([
      getPublicSiteConfig(),
      listPublishedCourses(),
      listPublishedServices(),
      listPublishedLicensing(),
      listPublishedFaqs(),
      loadBookCatalog(),
    ]);

  const canonicalBaseUrl = getCanonicalBaseUrl();
  const prioritizedCourseCategories = sortCourseCategoriesByClientPriority(
    coursesData.categories,
  ).slice(0, 5);
  const topServiceCategories = servicesData.categories.slice(0, 6);
  const featuredCourses = coursesData.items.slice(0, 6);
  const featuredServices = servicesData.items.slice(0, 6);
  const featuredBooks = booksData.items.filter((b) => b.featured).slice(0, 6);
  const featuredLicensing = licensingData.items.slice(0, 4);

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* 1. Compact Executive Lavender Hero Slider + 3D Knowledge Studio */}
        <PromotionalHeroSlider
          logoAssetPath={siteConfig.logoAssetPath}
          brandName={siteConfig.brandName}
        />

        {/* 2. Three Unified Flagship Navigation Buttons (01. Courses -> 02. Services -> 03. Books) */}
        <PrimaryBusinessActions />

        {/* 3. PILLAR 01 — COURSES (Education Marketplace Showcase) */}
        <section
          id="pillar-courses"
          data-home-pillar="courses"
          aria-label="01. Courses — আমাদের সকল কোর্সসমূহ"
          className="py-10 sm:py-14 bg-[#F2EFF8]/65 border-b border-[#D4CCE3]"
        >
          <div className="ps-container space-y-8">
            <div className="rounded-[18px] bg-white border border-[#D4CCE3] p-6 sm:p-7 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-[12px] bg-[#51406F] text-white shrink-0">
                  <GraduationCap className="w-6 h-6" aria-hidden="true" />
                </span>
                <SectionHeading
                  eyebrowEn="01 · Courses · I Want To Learn"
                  titleBn="Courses — আমাদের সকল কোর্সসমূহ"
                  descriptionBn="পেশাদার দক্ষতা অর্জন করুন এবং নিজেকে প্রস্তুত করুন। Tax, VAT, e-GP, E-commerce ও RJSC সহ ১০টি ব্যবহারিক প্রশিক্ষণ বিভাগ।"
                />
              </div>
              <Link
                href="/courses"
                className="ps-primary-button shrink-0 whitespace-nowrap"
              >
                <span className="font-en" lang="en">
                  Explore Courses
                </span>
                <span aria-hidden="true">·</span>
                <span>সকল কোর্স দেখুন</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-bold text-[#081838]">
                  অগ্রাধিকারপ্রাপ্ত প্রশিক্ষণ ট্র্যাক (Priority Course Tracks)
                </h3>
                <Link
                  href="/courses"
                  className="text-xs sm:text-sm font-semibold text-[#51406F] hover:underline underline-offset-4 whitespace-nowrap"
                >
                  সকল ১০টি বিভাগ →
                </Link>
              </div>
              <MotionReveal>
                <CategoryGrid
                  categories={prioritizedCourseCategories}
                  basePath="/courses"
                  ariaLabel="জনপ্রিয় কোর্স ক্যাটাগরি"
                  accent="lavender"
                  columns={5}
                  highlightCount={5}
                  luminousPriority
                />
              </MotionReveal>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-[#D4CCE3] pb-3">
                <h3 className="text-lg sm:text-xl font-bold text-[#081838]">
                  নির্বাচিত প্রশিক্ষণ কোর্সসমূহ
                </h3>
                <span className="text-xs sm:text-sm text-[#596775] font-medium">
                  সিলেবাস ও আগ্রহ নিবন্ধন
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredCourses.map((course) => (
                  <CourseCard
                    key={course.slug}
                    course={course}
                    verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                    canonicalBaseUrl={canonicalBaseUrl}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4. PILLAR 02 — SERVICES (Consultancy & Compliance Showcase + Licensing & Consultancy Gateway) */}
        <section
          id="pillar-services"
          data-home-pillar="services"
          aria-label="02. Services — আমাদের সকল সেবাসমূহ"
          className="py-10 sm:py-14 bg-white border-b border-[#D4CCE3]"
        >
          <div className="ps-container space-y-8">
            <div className="rounded-[18px] bg-[#F2EFF8]/75 border border-[#D4CCE3] p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-[12px] bg-[#00865A] text-white shrink-0">
                  <BriefcaseBusiness className="w-6 h-6" aria-hidden="true" />
                </span>
                <SectionHeading
                  eyebrowEn="02 · Services · Professional Assistance"
                  titleBn="Services — আমাদের সকল সেবাসমূহ"
                  descriptionBn="ব্যবসার প্রয়োজনীয় পেশাদার সহায়তা ও সমাধান নিন। আয়কর, ভ্যাট, কোম্পানি সেক্রেটারিয়াল, লাইসেন্সিং ও কনসালটেন্সি।"
                />
              </div>
              <Link
                href="/services"
                className="ps-primary-button shrink-0 whitespace-nowrap"
              >
                <span className="font-en" lang="en">
                  Explore Services
                </span>
                <span aria-hidden="true">·</span>
                <span>সকল সেবা দেখুন</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Associated Services Solutions: Licensing & Consultancy */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/licensing"
                className="group rounded-[14px] border border-[#D4CCE3] bg-white hover:bg-[#F2EFF8] p-5 flex items-center justify-between gap-4 transition-colors shadow-xs"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#DDD6EB] text-[#51406F] shrink-0">
                    <FileCheck2 className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-en font-semibold uppercase tracking-wider text-[#51406F]">
                      Services Extension · Licensing
                    </p>
                    <p className="text-base font-bold text-[#081838]">
                      ব্যবসায়িক লাইসেন্সিং ও নিবন্ধন সহায়তা
                    </p>
                    <p className="text-xs text-[#596775]">
                      ট্রেড লাইসেন্স, Smart RJSC, DIFE, ফায়ার, IRC ও ERC নির্দেশিকা
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-[#51406F] shrink-0 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/consultancy"
                className="group rounded-[14px] border border-[#D4CCE3] bg-white hover:bg-[#F2EFF8] p-5 flex items-center justify-between gap-4 transition-colors shadow-xs"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#DDD6EB] text-[#51406F] shrink-0">
                    <MessageSquareText className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-en font-semibold uppercase tracking-wider text-[#51406F]">
                      Services Extension · Advisory
                    </p>
                    <p className="text-base font-bold text-[#081838]">
                      বিশেষজ্ঞ কনসালটেন্সি ও কাস্টম সমাধান
                    </p>
                    <p className="text-xs text-[#596775]">
                      আপনার ব্যবসার নির্দিষ্ট জটিলতায় সরাসরি পরামর্শ ও WhatsApp সহায়তা
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className="w-4 h-4 text-[#51406F] shrink-0 group-hover:translate-x-0.5 transition-transform"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-bold text-[#081838]">
                  ব্যবসায়িক ও কমপ্লায়েন্স সেবা বিভাগসমূহ
                </h3>
                <Link
                  href="/services"
                  className="text-xs sm:text-sm font-semibold text-[#51406F] hover:underline underline-offset-4 whitespace-nowrap"
                >
                  সকল ১১টি বিভাগ →
                </Link>
              </div>
              <MotionReveal>
                <CategoryGrid
                  categories={topServiceCategories}
                  basePath="/services"
                  ariaLabel="জনপ্রিয় সেবা বিভাগ"
                  accent="lavender"
                  columns={3}
                />
              </MotionReveal>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 border-b border-[#D4CCE3] pb-3">
                <h3 className="text-lg sm:text-xl font-bold text-[#081838]">
                  প্রধান পেশাদার ও কমপ্লায়েন্স সেবাসমূহ
                </h3>
                <span className="text-xs sm:text-sm text-[#00865A] font-semibold">
                  সরাসরি WhatsApp সহায়তাসহ
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredServices.map((svc) => (
                  <ServiceCard
                    key={svc.slug}
                    service={svc}
                    verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                    canonicalBaseUrl={canonicalBaseUrl}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. PILLAR 03 — BOOKS (Equal-Weight Editorial Publication Storefront) */}
        <section
          id="pillar-books"
          data-home-pillar="books"
          aria-label="03. Books — আমাদের সকল বইসমূহ"
          className="py-10 sm:py-14 bg-[#F2EFF8]/65 border-b border-[#D4CCE3]"
        >
          <div className="ps-container space-y-8">
            <div className="rounded-[18px] bg-white border border-[#D4CCE3] p-6 sm:p-7 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
              <div className="flex items-start gap-4">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-[12px] bg-[#51406F] text-white shrink-0">
                  <BookOpen className="w-6 h-6" aria-hidden="true" />
                </span>
                <SectionHeading
                  eyebrowEn="03 · Books · Practical Knowledge & Publications"
                  titleBn="Books — আমাদের সকল বইসমূহ"
                  descriptionBn="প্রয়োজনীয় বই ও প্রকাশনার মাধ্যমে জ্ঞান সমৃদ্ধ করুন। কোর্স ও সেবার সাথে সামঞ্জস্যপূর্ণ কমপ্লায়েন্স হ্যান্ডবুক প্রিভিউ (মূল্য ও প্রকাশনার তারিখ অনুমোদন সাপেক্ষে প্রকাশিত হবে)।"
                />
              </div>
              <Link
                href="/books"
                className="ps-primary-button shrink-0 whitespace-nowrap"
              >
                <span className="font-en" lang="en">
                  Explore Books
                </span>
                <span aria-hidden="true">·</span>
                <span>সকল বই দেখুন</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>

            {/* 9 Compliance Book Domains Quick Index */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-[#51406F]">
                প্রকাশনা বিভাগ:
              </span>
              {booksData.categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/books?category=${encodeURIComponent(cat.slug)}`}
                  className="inline-flex items-center gap-1.5 rounded-[8px] border border-[#D4CCE3] bg-white px-3 py-1.5 font-semibold text-[#081838] hover:border-[#51406F] hover:bg-[#DDD6EB] transition-colors"
                >
                  <span>{cat.nameBn}</span>
                  <span className="text-[#596775] tabular-nums">
                    ({cat.previewCount})
                  </span>
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBooks.map((book) => (
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

        {/* 6. Connected Business Ecosystem + Interactive 3D + Counters */}
        <section className="bg-surface-canvas border-b border-border-subtle">
          <StatCounters
            documentedTotal={437}
            categoryCount={27}
            publishedCount={
              coursesData.items.length +
              servicesData.items.length +
              licensingData.items.length
            }
            divisionCount={4}
          />

          <div className="bg-gradient-to-b from-surface-lavender/80 to-surface-canvas">
            <div className="ps-container py-12 sm:py-14 space-y-10">
              <ConnectedEcosystemShowcase />

              <StickyNarrativeSection
                stickyContent={
                  <>
                    <p className="inline-flex items-center gap-2 text-xs font-en font-semibold uppercase tracking-[0.16em] text-text-accent">
                      <ShieldCheck
                        className="w-4 h-4 text-text-accent"
                        aria-hidden="true"
                      />
                      <span>About Business Compliance Partner</span>
                    </p>
                    <h2 className="text-2xl sm:text-3xl font-bold leading-snug text-text-primary">
                      স্বচ্ছ প্রক্রিয়া, সঠিক তথ্যসূত্র ও বাস্তবভিত্তিক সহায়তা
                    </h2>
                    <p className="text-sm sm:text-base text-text-body/85 leading-relaxed">
                      Business Compliance Partner (BCP) বাংলাদেশের উদ্যোক্তা, এসএমই ও
                      পেশাজীবীদের জন্য{" "}
                      <span className="font-en font-semibold" lang="en">
                        Courses · Services · Books
                      </span>{" "}
                      ভিত্তিক একটি স্বাধীন ব্যবসায়িক শিক্ষা, কমপ্লায়েন্স সেবা এবং
                      প্রকাশনা প্ল্যাটফর্ম।
                    </p>
                    <ul className="space-y-2.5 text-sm text-text-body/90">
                      {[
                        "Smart RJSC, NBR, BPPA (e-GP), DIFE LIMA ও ফায়ার সার্ভিসের সঠিক রেফারেন্স",
                        "কাল্পনিক অফার বা অবাস্তব সরকারি অনুমোদনের নিশ্চয়তা ছাড়াই স্বচ্ছ তথ্য",
                        "Courses, Services এবং Books—একই প্রতিষ্ঠানের অধীনে সমন্বিত সমাধান কাঠামো",
                      ].map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle2
                            className="w-4 h-4 text-action-whatsapp shrink-0 mt-1"
                            aria-hidden="true"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-1">
                      <Link
                        href="/about"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-text-accent hover:text-action-primary-hover hover:underline underline-offset-4"
                      >
                        <span>আমাদের সম্পর্কে বিস্তারিত জানুন</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </>
                }
              >
                <LazyCompliance3D />
              </StickyNarrativeSection>

              <AuthorityNote limitationsBn={siteConfig.legalDisclaimerBn} />
            </div>
          </div>
        </section>

        {/* 7. Unified Search (All | Courses | Services | Books), Guided Discovery & Licensing Spotlight */}
        <section className="py-10 sm:py-14 bg-[#F2EFF8]/55 border-b border-[#D4CCE3]">
          <div className="ps-container space-y-12">
            <UnifiedSearchSection />

            <div id="solution-finder" className="scroll-mt-24">
              <BusinessSolutionFinder />
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <SectionHeading
                  eyebrowEn="Services Extension · Licensing & Registration"
                  titleBn="প্রয়োজনীয় লাইসেন্সিং ও নিবন্ধন সহায়তা"
                  descriptionBn="ট্রেড লাইসেন্স, Smart RJSC, DIFE ও ফায়ার লাইসেন্স সংক্রান্ত নির্দেশিকা।"
                />
                <Link href="/licensing" className="ps-secondary-button shrink-0">
                  সব লাইসেন্সিং দেখুন
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredLicensing.map((entry) => (
                  <LicensingCard
                    key={entry.slug}
                    entry={entry}
                    verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                    canonicalBaseUrl={canonicalBaseUrl}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 8. 4-Step Client Journey */}
        <section className="py-10 sm:py-12 bg-white border-b border-[#D4CCE3]">
          <div className="ps-container space-y-6">
            <SectionHeading
              eyebrowEn="How BCP Works"
              titleBn="চারটি সহজ ধাপে আপনার ব্যবসার সমাধান"
              descriptionBn="অযথা জটিলতা ছাড়াই সঠিক কোর্স, পেশাদার সেবা বা বইয়ের প্রিভিউয়ে পৌঁছানোর সুশৃঙ্খল প্রক্রিয়া।"
            />
            <ProcessSteps steps={CLIENT_JOURNEY_STEPS} columns={4} />
          </div>
        </section>

        {/* 9. Consultancy Split Block */}
        <section className="py-12 sm:py-14 bg-[#F2EFF8] border-b border-[#D4CCE3]">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-5">
              <SectionHeading
                eyebrowEn="Consultancy & Advisory"
                titleBn="আপনার ব্যবসার সমস্যাটি জানান"
                descriptionBn="সংক্ষেপে আপনার প্রয়োজন লিখে পাঠান অথবা সরাসরি WhatsApp-এ যোগাযোগ করুন।"
              />
              <WhatsAppEnquiryButton
                verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                serviceName="ব্যবসায়িক কনসালটেন্সি ও পরামর্শ"
                servicePath="/consultancy"
                canonicalBaseUrl={canonicalBaseUrl}
                fallbackHref="/consultancy"
                fallbackLabelBn="বিস্তারিত কনসালটেন্সি ফর্মে যান"
                size="lg"
              />
            </div>
            <div className="lg:col-span-7">
              <ConsultancyForm
                compact
                defaultPillar="CONSULTANCY"
                sourcePage="/"
                verifiedWhatsapp={siteConfig.verifiedWhatsapp}
              />
            </div>
          </div>
        </section>

        {/* 10. FAQ Section */}
        <section className="py-10 sm:py-14 bg-white">
          <div className="ps-container space-y-6 max-w-4xl">
            <SectionHeading
              eyebrowEn="Frequently Asked Questions"
              titleBn="সচরাচর জিজ্ঞাসা"
              descriptionBn="Courses, Services এবং Books—তিনটি প্রধান বিভাগ ও সহায়তা প্রক্রিয়া সম্পর্কে সাধারণ প্রশ্নোত্তর।"
            />
            <FAQAccordion items={faqs} />
            <div>
              <Link href="/faq" className="ps-secondary-button">
                সকল প্রশ্নোত্তর দেখুন
              </Link>
            </div>
          </div>
        </section>

        {/* 11. Three-Pillar Closing CTA: Explore Courses | Explore Services | Explore Books */}
        <CTASection
          eyebrowEn="Courses · Services · Books"
          titleBn="আপনার ব্যবসা ও পেশাদার প্রবৃদ্ধির সঠিক পথ বেছে নিন"
          descriptionBn="দক্ষতা অর্জনের জন্য Courses, ব্যবসার পেশাদার সহায়তার জন্য Services অথবা প্র্যাকটিক্যাল জ্ঞানের জন্য Books—আপনার পরবর্তী ধাপ শুরু করুন।"
          primaryHref="/courses"
          primaryLabelBn="Explore Courses · কোর্সসমূহ"
          secondaryHref="/services"
          secondaryLabelBn="Explore Services · সেবাসমূহ"
          tertiaryHref="/books"
          tertiaryLabelBn="Explore Books · বইসমূহ"
        />
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
