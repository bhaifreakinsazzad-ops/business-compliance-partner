import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import { listBookCatalog } from "@/lib/books/catalog";
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
      "কোর্স শিখতে চান, ট্যাক্স-ভ্যাট সেবা নিতে চান নাকি বইয়ের প্রিভিউ দেখতে চান—তা বেছে নিন।",
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
  const [siteConfig, coursesData, servicesData, licensingData, faqs] =
    await Promise.all([
      getPublicSiteConfig(),
      listPublishedCourses(),
      listPublishedServices(),
      listPublishedLicensing(),
      listPublishedFaqs(),
    ]);

  const canonicalBaseUrl = getCanonicalBaseUrl();
  const prioritizedCourseCategories = sortCourseCategoriesByClientPriority(
    coursesData.categories,
  ).slice(0, 5);
  const topServiceCategories = servicesData.categories.slice(0, 6);
  const featuredCourses = coursesData.items.slice(0, 6);
  const featuredServices = servicesData.items.slice(0, 6);
  const featuredBooks = listBookCatalog()
    .items.filter((b) => b.featured)
    .slice(0, 6);
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

        {/* 2. Three Unified Flagship Navigation Buttons (Courses -> Services -> Books) */}
        <PrimaryBusinessActions />

        {/* 3. Popular Course Categories (Tax, VAT, e-GP, E-commerce, RJSC) */}
        <section className="py-10 sm:py-14 bg-[#F2EFF8]/65 border-b border-[#D4CCE3]">
          <div className="ps-container space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <SectionHeading
                eyebrowEn="Course Categories"
                titleBn="জনপ্রিয় কোর্স ক্যাটাগরি"
                descriptionBn="Tax, VAT, e-GP, E-commerce ও RJSC সহ ব্যবহারিক প্রশিক্ষণ ট্র্যাক বেছে নিন।"
              />
              <Link href="/courses" className="ps-secondary-button shrink-0">
                <span>সকল ১০টি কোর্স ক্যাটাগরি</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
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
        </section>

        {/* 4. Featured Courses */}
        <section className="py-10 sm:py-14 bg-white border-b border-[#D4CCE3]">
          <div className="ps-container space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <SectionHeading
                eyebrowEn="Featured Courses"
                titleBn="নির্বাচিত প্রশিক্ষণ কোর্সসমূহ"
                descriptionBn="সিলেবাস, লক্ষ্য দর্শক ও যাচাইকৃত কোর্স বিবরণ দেখে আগ্রহ নিবন্ধন করুন।"
              />
              <Link href="/courses" className="ps-secondary-button shrink-0">
                সব কোর্স দেখুন
              </Link>
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
        </section>

        {/* 5. Service Categories */}
        <section className="py-10 sm:py-14 bg-[#F2EFF8]/65 border-b border-[#D4CCE3]">
          <div className="ps-container space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <SectionHeading
                eyebrowEn="Professional Services"
                titleBn="ব্যবসায়িক ও কমপ্লায়েন্স সেবা বিভাগ"
                descriptionBn="ক্যাটাগরি নির্বাচন করে প্রাসঙ্গিক সেবা ও সরাসরি WhatsApp সহায়তা পান।"
              />
              <div className="flex flex-wrap gap-2.5 shrink-0">
                <Link href="/services" className="ps-secondary-button">
                  সকল সেবা বিভাগ
                </Link>
                <Link href="/licensing" className="ps-secondary-button">
                  লাইসেন্সিং
                </Link>
              </div>
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
        </section>

        {/* 6. Featured Services with Direct Emerald WhatsApp CTAs */}
        <section className="py-10 sm:py-14 bg-white border-b border-[#D4CCE3]">
          <div className="ps-container space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <SectionHeading
                eyebrowEn="Featured Services"
                titleBn="প্রধান পেশাদার ও কমপ্লায়েন্স সেবাসমূহ"
                descriptionBn="প্রতিটি সেবার বিবরণ দেখুন অথবা সরাসরি WhatsApp-এ যোগাযোগ করুন।"
              />
              <Link href="/services" className="ps-secondary-button shrink-0">
                সব সেবা দেখুন
              </Link>
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
        </section>

        {/* 7. Featured Upcoming Books Storefront Preview */}
        <section
          aria-label="প্রকাশনা ও বইসমূহ"
          className="py-10 sm:py-14 bg-[#F2EFF8]/65 border-b border-[#D4CCE3]"
        >
          <div className="ps-container space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <SectionHeading
                eyebrowEn="Our Books Preview"
                titleBn="প্রস্তাবিত কমপ্লায়েন্স ও ব্যবসায়িক বইসমূহ"
                descriptionBn="কোর্স ও সেবার সাথে সামঞ্জস্যপূর্ণ আসন্ন প্রকাশনা প্রিভিউ — মূল্য ও প্রকাশের তারিখ অনুমোদন সাপেক্ষে প্রকাশিত হবে।"
              />
              <Link href="/books" className="ps-primary-button shrink-0">
                <span>সব বই ও প্রিভিউ দেখুন</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
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

        {/* 8. Why BCP + Interactive 3D Ecosystem + Counters */}
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
                      পেশাজীবীদের জন্য একটি স্বাধীন ব্যবসায়িক শিক্ষা, কমপ্লায়েন্স সেবা এবং
                      প্রকাশনা সহায়তা প্ল্যাটফর্ম।
                    </p>
                    <ul className="space-y-2.5 text-sm text-text-body/90">
                      {[
                        "Smart RJSC, NBR, BPPA (e-GP), DIFE LIMA ও ফায়ার সার্ভিসের সঠিক রেফারেন্স",
                        "কাল্পনিক অফার বা অবাস্তব সরকারি অনুমোদনের নিশ্চয়তা ছাড়াই স্বচ্ছ তথ্য",
                        "কোর্স, পেশাদার সেবা, বই, লাইসেন্সিং ও কনসালটেন্সি—সমন্বিত সমাধান কাঠামো",
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

        {/* 9. Unified Search, Guided Discovery & Licensing Spotlight */}
        <section className="py-10 sm:py-14 bg-[#F2EFF8]/55 border-b border-[#D4CCE3]">
          <div className="ps-container space-y-12">
            <UnifiedSearchSection />

            <div id="solution-finder" className="scroll-mt-24">
              <BusinessSolutionFinder />
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <SectionHeading
                  eyebrowEn="Licensing & Registration"
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

        {/* 10. 4-Step Client Journey */}
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

        {/* 11. Consultancy Split Block */}
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

        {/* 12. FAQ Section */}
        <section className="py-10 sm:py-14 bg-white">
          <div className="ps-container space-y-6 max-w-4xl">
            <SectionHeading
              eyebrowEn="Frequently Asked Questions"
              titleBn="সচরাচর জিজ্ঞাসা"
              descriptionBn="কোর্স, সেবা, বই, লাইসেন্সিং ও কনসালটেন্সি প্রক্রিয়া সম্পর্কে সাধারণ প্রশ্নোত্তর।"
            />
            <FAQAccordion items={faqs} />
            <div>
              <Link href="/faq" className="ps-secondary-button">
                সকল প্রশ্নোত্তর দেখুন
              </Link>
            </div>
          </div>
        </section>

        <CTASection
          titleBn="আপনার ব্যবসা বা পেশাদার দক্ষতার পরবর্তী ধাপ শুরু করুন"
          descriptionBn="প্রয়োজনীয় কোর্স, পেশাদার সেবা বা বইয়ের প্রিভিউ দেখে নিন অথবা সরাসরি আপনার প্রশ্নটি পাঠান।"
          primaryHref="/courses"
          primaryLabelBn="সকল কোর্স দেখুন"
          secondaryHref="/services"
          secondaryLabelBn="সকল সেবা দেখুন"
        />
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
