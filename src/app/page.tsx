import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  FileCheck2,
  Lock,
  MessageSquareText,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { getPublicSiteConfig } from "@/lib/config/site";
import {
  listPublishedCourses,
  listPublishedFaqs,
  listPublishedLicensing,
  listPublishedServices,
} from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Footer } from "@/components/layout/Footer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PillarCard } from "@/components/shared/PillarCard";
import { CourseCard } from "@/components/shared/CourseCard";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { LicensingCard } from "@/components/shared/LicensingCard";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { AuthorityNote } from "@/components/shared/AuthorityNote";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { CTASection } from "@/components/shared/CTASection";
import { HeroPillarExplorer } from "@/components/illustrations/HeroPillarExplorer";
import { StatCounters } from "@/components/ui/StatCounters";
import { InteractiveTracksExplorer } from "@/components/home/InteractiveTracksExplorer";
import { UnifiedSearchSection } from "@/components/home/UnifiedSearchSection";
import { BusinessSolutionFinder } from "@/components/home/BusinessSolutionFinder";
import { EcosystemInfographics } from "@/components/home/EcosystemInfographics";
import { ConsultancyForm } from "@/components/forms/ConsultancyForm";

const PROCESS_STEPS = [
  {
    stepNumber: 1,
    titleBn: "প্রয়োজন বুঝুন",
    descriptionBn:
      "আপনি দক্ষতা শিখতে চান নাকি ব্যবসার নিবন্ধন/কমপ্লায়েন্স সহায়তা প্রয়োজন—তা নির্বাচন করুন।",
  },
  {
    stepNumber: 2,
    titleBn: "সঠিক বিভাগ খুঁজুন",
    descriptionBn:
      "কোর্স, পেশাদার সেবা ও লাইসেন্সিং ক্যাটালগ থেকে প্রযোজ্য বিস্তারিত তথ্য ও নথির ধারণা দেখুন।",
  },
  {
    stepNumber: 3,
    titleBn: "অনুরোধ পাঠান",
    descriptionBn:
      "সংক্ষেপে আপনার নাম, মোবাইল নম্বর, এলাকা ও সমস্যাটি লিখে নিরাপদ ফর্মের মাধ্যমে জমা দিন।",
  },
  {
    stepNumber: 4,
    titleBn: "টিম যোগাযোগ করবে",
    descriptionBn:
      "তথ্য পর্যালোচনা শেষে আমাদের টিম উপযুক্ত সময়ে আপনার সাথে যোগাযোগ করে পরবর্তী নির্দেশনা দেবে।",
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

  const featuredCourses = coursesData.items.slice(0, 6);
  const featuredServices = servicesData.items.slice(0, 6);
  const featuredLicensing = licensingData.items.slice(0, 4);

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* 3. Asymmetric Editorial Hero — Deep Navy Quiet Confidence */}
        <section className="bg-ps-midnight text-ps-white py-12 sm:py-16 lg:py-20 border-b border-ps-gold/30">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-ps-gold/40 bg-ps-navy px-3.5 py-1 text-xs font-medium text-ps-ivory">
                <span className="w-1.5 h-1.5 rounded-full bg-ps-gold" aria-hidden="true" />
                <span lang="en">One Partner • Complete Solutions • Confident Growth</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold leading-snug text-ps-white">
                ব্যবসা শুরু থেকে সফল পরিচালনা—সব সমাধান এক জায়গায়।
              </h1>

              <p className="text-base sm:text-lg text-white/85 leading-relaxed max-w-xl">
                পেশাদার প্রশিক্ষণ, ব্যবসায়িক সেবা, লাইসেন্স ও নিবন্ধন এবং বিশেষজ্ঞ
                পরামর্শের জন্য একটি সমন্বিত প্ল্যাটফর্ম।
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 pt-1">
                <Link
                  href="#solution-finder"
                  className="inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3 rounded-[12px] bg-ps-ivory text-ps-midnight font-semibold hover:bg-ps-white transition-colors"
                >
                  <span>আপনার ব্যবসার সমাধান খুঁজুন</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center min-h-12 px-6 py-3 rounded-[12px] border border-ps-gold text-ps-white font-semibold hover:bg-ps-navy transition-colors"
                >
                  সেবা খুঁজুন
                </Link>
                <Link
                  href="/consultancy"
                  className="inline-flex items-center justify-center min-h-12 px-4 py-3 text-sm font-semibold text-ps-gold underline underline-offset-4 hover:text-ps-ivory"
                >
                  পরামর্শ চাই
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <HeroPillarExplorer disclaimerBn={siteConfig.legalDisclaimerBn} />
            </div>
          </div>
        </section>

        {/* Dynamic Animated Metrics Strip powered by Anime.js */}
        <StatCounters />

        {/* Truthful Trust Strip (Inspired by Reference Mockups, Zero Fake Claims) */}
        <section
          aria-label="প্ল্যাটফর্মের মূল নীতিমালা"
          className="bg-ps-white border-b border-ps-border"
        >
          <div className="ps-container py-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-3 p-2">
              <BookOpen className="w-5 h-5 text-ps-navy shrink-0" aria-hidden="true" />
              <span className="font-medium text-ps-navy">
                ব্যবহারিক ও বাস্তবভিত্তিক পাঠ্যক্রম কাঠামো
              </span>
            </div>
            <div className="flex items-center gap-3 p-2">
              <Scale className="w-5 h-5 text-ps-navy shrink-0" aria-hidden="true" />
              <span className="font-medium text-ps-navy">
                বাংলাদেশি আইন ও কর্তৃপক্ষের তথ্যসূত্র
              </span>
            </div>
            <div className="flex items-center gap-3 p-2">
              <ShieldCheck className="w-5 h-5 text-ps-navy shrink-0" aria-hidden="true" />
              <span className="font-medium text-ps-navy">
                স্বাধীন সহায়তা — সরকারি অনুমোদনের ভুয়া দাবি নয়
              </span>
            </div>
            <div className="flex items-center gap-3 p-2">
              <Lock className="w-5 h-5 text-ps-navy shrink-0" aria-hidden="true" />
              <span className="font-medium text-ps-navy">
                তথ্য সুরক্ষা ও সম্মতি-ভিত্তিক অনুসন্ধান
              </span>
            </div>
          </div>
        </section>

        <section id="solution-finder" className="scroll-mt-24 py-12 sm:py-16 bg-ps-cool border-b border-ps-border">
          <div className="ps-container">
            <BusinessSolutionFinder />
          </div>
        </section>

        {/* Master Infographic Ecosystem Gallery */}
        <EcosystemInfographics />

        {/* 4. Four-Pillar Priority Grid (Courses & Services Visually Dominant) */}
        <section className="py-12 sm:py-16">
          <div className="ps-container space-y-8">
            <SectionHeading
              eyebrowEn="Four Core Pillars"
              titleBn="আপনার ব্যবসার প্রয়োজন অনুযায়ী সঠিক স্তম্ভ বেছে নিন"
              descriptionBn="পেশাদার শিক্ষা এবং কমপ্লায়েন্স সেবাকে সর্বোচ্চ গুরুত্ব দিয়ে সাজানো আমাদের চারটি মূল বিভাগ।"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PillarCard
                priority="primary"
                badgeTextBn="প্রাথমিক স্তম্ভ ০১"
                subtitleEn="Courses & Learning"
                titleBn="কোর্স ও পেশাদার প্রশিক্ষণ"
                descriptionBn="পেশাদার দক্ষতা ও ব্যবসায়িক শেখার কোর্স — Income Tax, VAT & Mushak, e-GP, Customs ও Accounting-এর সুসংগঠিত সিলেবাস ও আগ্রহ নিবন্ধন।"
                href="/courses"
                ctaLabelBn="কোর্স সম্পর্কে জানুন"
                icon={BookOpen}
              />
              <PillarCard
                priority="primary"
                badgeTextBn="প্রাথমিক স্তম্ভ ০২"
                subtitleEn="Professional Services"
                titleBn="পেশাদার ব্যবসায়িক সেবা"
                descriptionBn="Tax, VAT, e-GP, Smart RJSC, Accounting ও কর্পোরেট কমপ্লায়েন্স বিষয়ে নথিপত্র প্রস্তুতি, কাজের পরিধি ও স্বচ্ছ সহায়তা।"
                href="/services"
                ctaLabelBn="সেবার অনুরোধ করুন"
                icon={BriefcaseBusiness}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PillarCard
                priority="secondary"
                badgeTextBn="স্তম্ভ ০৩"
                subtitleEn="Licensing & Registration"
                titleBn="লাইসেন্সিং ও নিবন্ধন সহায়তা"
                descriptionBn="ব্যবসা, কারখানা ও প্রয়োজনীয় অনুমোদন (ট্রেড লাইসেন্স, RJSC, DIFE, ফায়ার, IRC/ERC) বিষয়ে কর্তৃপক্ষভিত্তিক নির্দেশিকা।"
                href="/licensing"
                ctaLabelBn="সহায়তা চাই"
                icon={FileCheck2}
              />
              <PillarCard
                priority="secondary"
                badgeTextBn="স্তম্ভ ০৪"
                subtitleEn="Consultancy & Advisory"
                titleBn="ব্যবসায়িক কনসালটেন্সি"
                descriptionBn="আপনার সমস্যা সংক্ষেপে লিখে পাঠান—আমাদের টিম তথ্য পর্যালোচনা করে উপযুক্ত সময়ে আপনার সঙ্গে যোগাযোগ করবে।"
                href="/consultancy"
                ctaLabelBn="পরামর্শের অনুরোধ করুন"
                icon={MessageSquareText}
              />
            </div>
          </div>
        </section>

        {/* Interactive Category Tracks Explorer (10 Courses + 11 Services + 6 Licensing) */}
        <section className="py-12 sm:py-16 bg-ps-white border-y border-ps-border">
          <div className="ps-container space-y-8">
            <SectionHeading
              eyebrowEn="Structured Taxonomy"
              titleBn="প্রশিক্ষণ ট্র্যাক, সার্ভিস ও লাইসেন্সিং বিভাগসমূহ"
              descriptionBn="ক্যাটাগরি নির্বাচন করে অথবা কীওয়ার্ড লিখে আপনার প্রয়োজনীয় বিভাগ খুঁজে নিন।"
            />
            <InteractiveTracksExplorer
              courseCategories={coursesData.categories}
              serviceCategories={servicesData.categories}
              licensingCategories={licensingData.categories}
            />
          </div>
        </section>

        {/* 5. Featured Courses (Mode A Truthful Catalogue) */}
        <section className="py-12 sm:py-16">
          <div className="ps-container space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <SectionHeading
                eyebrowEn="Priority 01 • Course Catalogue"
                titleBn="প্রস্তাবিত প্রধান প্রশিক্ষণ কোর্সসমূহ"
                descriptionBn="ব্যাচ, প্রশিক্ষক ও ফি চূড়ান্ত হলেই কেবল প্রকাশ করা হয়। এখনই সিলেবাস দেখে আগ্রহ জানাতে পারেন।"
              />
              <Link href="/courses" className="ps-secondary-button shrink-0">
                সব কোর্স দেখুন
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.slug} course={course} />
              ))}
            </div>
          </div>
        </section>

        {/* 6. Featured Professional Services */}
        <section className="py-12 sm:py-16 bg-ps-cool border-y border-ps-border">
          <div className="ps-container space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <SectionHeading
                eyebrowEn="Priority 01 • Professional Services"
                titleBn="প্রধান ব্যবসায়িক ও কমপ্লায়েন্স সেবাসমূহ"
                descriptionBn="প্রতিটি সেবায় কাজের পরিধি, প্রয়োজনীয় নথি ও সীমাবদ্ধতা পরিষ্কারভাবে উল্লেখ রয়েছে।"
              />
              <Link href="/services" className="ps-secondary-button shrink-0">
                সব সেবা দেখুন
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredServices.map((svc) => (
                <ServiceCard key={svc.slug} service={svc} />
              ))}
            </div>
          </div>
        </section>

        {/* 7. Unified Live Search Across All Pillars */}
        <section className="py-12 sm:py-14">
          <div className="ps-container">
            <UnifiedSearchSection />
          </div>
        </section>

        {/* 8. How BCP Helps */}
        <section className="py-12 sm:py-16 bg-ps-white border-y border-ps-border">
          <div className="ps-container space-y-8">
            <SectionHeading
              eyebrowEn="How It Works"
              titleBn="Business Compliance Partner কীভাবে সহায়তা করে"
              descriptionBn="জটিলতা কমিয়ে চারটি স্পষ্ট ধাপে আপনার প্রয়োজন অনুযায়ী সহায়তা।"
            />
            <ProcessSteps steps={PROCESS_STEPS} columns={4} />
          </div>
        </section>

        {/* 9. Licensing Spotlight + Independent Disclaimer */}
        <section className="py-12 sm:py-16">
          <div className="ps-container space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <SectionHeading
                eyebrowEn="Licensing & Registration"
                titleBn="প্রয়োজনীয় লাইসেন্সিং ও নিবন্ধন নির্দেশিকা"
                descriptionBn="সরকারি পোর্টাল ও কর্তৃপক্ষের সঠিক নাম উল্লেখপূর্বক আমাদের সহায়তা প্রক্রিয়া।"
              />
              <Link href="/licensing" className="ps-secondary-button shrink-0">
                সব লাইসেন্সিং দেখুন
              </Link>
            </div>

            <AuthorityNote limitationsBn={siteConfig.legalDisclaimerBn} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredLicensing.map((entry) => (
                <LicensingCard key={entry.slug} entry={entry} />
              ))}
            </div>
          </div>
        </section>

        {/* 10. Dark-Navy Consultancy Conversion Block (Split Layout Inspired by Reference Mockups) */}
        <section className="py-14 sm:py-16 bg-ps-navy text-ps-white border-y border-ps-gold/30">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-6">
              <SectionHeading
                dark
                eyebrowEn="Consultancy & Advisory"
                titleBn="আপনার ব্যবসার সমস্যাটি জানান"
                descriptionBn="আপনার প্রয়োজন সংক্ষেপে লিখুন। আমাদের টিম তথ্য পর্যালোচনা করে উপযুক্ত সময়ে আপনার সঙ্গে যোগাযোগ করবে।"
              />

              <ul className="space-y-3 text-sm sm:text-base text-white/90">
                {[
                  "বাংলাদেশের প্রচলিত আইন ও বিধিমালা অনুযায়ী বাস্তবসম্মত দিকনির্দেশনা",
                  "কোর্স, সেবা কিংবা লাইসেন্সিং—কোন পথটি আপনার জন্য প্রযোজ্য তা বুঝতে সহায়তা",
                  "প্রাথমিক পর্যায়ে NID বা ব্যাংক স্টেটমেন্টের মতো সংবেদনশীল ফাইল চাওয়া হয় না",
                  "অনুরোধ জমা হলে ডাটাবেজে সংরক্ষিত স্থায়ী রেফারেন্স নম্বর প্রদান",
                ].map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-5 h-5 text-ps-gold shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-2">
                <Link
                  href="/consultancy"
                  className="text-sm font-semibold text-ps-gold underline underline-offset-4 hover:text-ps-ivory"
                >
                  বিস্তারিত কনসালটেন্সি ফর্ম পাতায় যান →
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ConsultancyForm
                compact
                defaultPillar="CONSULTANCY"
                sourcePage="/"
              />
            </div>
          </div>
        </section>

        {/* 11. Evidence-Based Trust Section */}
        <section className="py-12 sm:py-16">
          <div className="ps-container space-y-8">
            <SectionHeading
              eyebrowEn="Quiet Confidence • Transparency"
              titleBn="ভুয়া প্রতিশ্রুতি নয়, স্বচ্ছ প্রক্রিয়া ও নির্ভরযোগ্য তথ্য"
              descriptionBn="আমরা কেবল যাচাইকৃত তথ্য, স্পষ্ট সীমাবদ্ধতা এবং সম্মতি-ভিত্তিক যোগাযোগে বিশ্বাস করি।"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <article className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-2.5">
                <h3 className="text-lg font-bold text-ps-navy">
                  কর্তৃপক্ষের সঠিক তথ্যসূত্র
                </h3>
                <p className="text-sm text-ps-ink/85 leading-relaxed">
                  Smart RJSC, NBR, BPPA (PPR 2025), DIFE LIMA এবং ফায়ার সার্ভিস
                  e-Fire পোর্টালের সঠিক রেফারেন্স ও সর্বশেষ পর্যালোচনার তারিখ উল্লেখ থাকে।
                </p>
              </article>
              <article className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-2.5">
                <h3 className="text-lg font-bold text-ps-navy">
                  কোনো কাল্পনিক পরিসংখ্যান নেই
                </h3>
                <p className="text-sm text-ps-ink/85 leading-relaxed">
                  বানোয়াট ক্লায়েন্ট সংখ্যা, ভুয়া ৫-স্টার রিভিউ বা “১০০% অনুমোদনের নিশ্চয়তা”
                  এখানে ব্যবহার করা হয় না।
                </p>
              </article>
              <article className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-2.5">
                <h3 className="text-lg font-bold text-ps-navy">
                  গোপনীয়তা ও তথ্য সুরক্ষা
                </h3>
                <p className="text-sm text-ps-ink/85 leading-relaxed">
                  লিড ডাটাবেজে নিরাপদ সংরক্ষণ, সম্মতি টাইমস্ট্যাম্প লগিং এবং অ্যানালিটিক্সে
                  ব্যক্তিগত তথ্য সম্পূর্ণ বাদ রাখা হয়।
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* 12. FAQ Section */}
        <section className="py-12 sm:py-16 bg-ps-white border-t border-ps-border">
          <div className="ps-container space-y-8 max-w-4xl">
            <SectionHeading
              eyebrowEn="Frequently Asked Questions"
              titleBn="সচরাচর জিজ্ঞাসা"
              descriptionBn="কোর্স, সেবা, লাইসেন্সিং ও কনসালটেন্সি প্রক্রিয়া সম্পর্কে সাধারণ প্রশ্নোত্তর।"
            />
            <FAQAccordion items={faqs} />
            <div className="pt-2">
              <Link href="/faq" className="ps-secondary-button">
                সকল প্রশ্নোত্তর দেখুন
              </Link>
            </div>
          </div>
        </section>

        {/* 13. Final Dual CTA */}
        <CTASection
          titleBn="আপনার ব্যবসা বা পেশাদার দক্ষতার পরবর্তী ধাপ শুরু করুন"
          descriptionBn="প্রয়োজনীয় সেবা খুঁজে নিন অথবা সরাসরি আপনার প্রশ্নটি পাঠান—আমাদের টিম পর্যালোচনা করে যোগাযোগ করবে।"
          primaryHref="/services"
          primaryLabelBn="সেবা খুঁজুন"
          secondaryHref="/consultancy"
          secondaryLabelBn="পরামর্শের অনুরোধ করুন"
        />
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
