import Link from "next/link";
import { ArrowRight, FileCheck2, HelpCircle, PhoneCall } from "lucide-react";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import { loadBookCatalog } from "@/lib/books/catalog";
import {
  listPublishedCourses,
  listPublishedServices,
  sortCourseCategoriesByClientPriority,
} from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Footer } from "@/components/layout/Footer";
import { PromotionalHeroSlider } from "@/components/home/PromotionalHeroSlider";
import { PrimaryBusinessActions } from "@/components/home/PrimaryBusinessActions";
import { PopularCoursesSection } from "@/components/home/PopularCoursesSection";
import { ServicesGatewaySection } from "@/components/home/ServicesGatewaySection";
import { BooksShowcaseSection } from "@/components/home/BooksShowcaseSection";
import { InstitutionalProfileSection } from "@/components/home/InstitutionalProfileSection";
import { AuthorityNote } from "@/components/shared/AuthorityNote";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";

export default async function HomePage() {
  const [siteConfig, coursesData, servicesData, booksData] = await Promise.all([
    getPublicSiteConfig(),
    listPublishedCourses(),
    listPublishedServices(),
    loadBookCatalog(),
  ]);

  const canonicalBaseUrl = getCanonicalBaseUrl();
  const prioritizedCategories = sortCourseCategoriesByClientPriority(
    coursesData.categories,
  );

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1 bg-white">
        {/* 1. Compact Reference Hero Slideshow (AKIJ Periwinkle Mesh + 01—04 Bar) */}
        <PromotionalHeroSlider
          logoAssetPath={siteConfig.logoAssetPath}
          brandName={siteConfig.brandName}
        />

        {/* 2. Three Unified Periwinkle Gateway Buttons: 01. Courses -> 02. Services -> 03. Books */}
        <PrimaryBusinessActions />

        {/* 3. GATEWAY 01 — Popular Courses (আমাদের জনপ্রিয় কোর্সসমূহ) */}
        <PopularCoursesSection
          courses={coursesData.items}
          categories={prioritizedCategories}
        />

        {/* 4. GATEWAY 02 — Services & Quick Consultancy Intake (আমাদের পেশাদার সেবাসমূহ) */}
        <ServicesGatewaySection
          verifiedWhatsapp={siteConfig.verifiedWhatsapp}
          canonicalBaseUrl={canonicalBaseUrl}
        />

        {/* 5. GATEWAY 03 — Dedicated E-Commerce Books Storefront (আমাদের সকল বইসমূহ) */}
        <BooksShowcaseSection
          books={booksData.items}
          categories={booksData.categories}
        />

        {/* 6. Institutional Profile Section (Official BCP Badge + 1-4 Pillars) */}
        <InstitutionalProfileSection
          logoAssetPath={siteConfig.logoAssetPath}
          brandName={siteConfig.brandName}
          taglineBn={siteConfig.taglineBn}
        />

        {/* 7. Clean Contact & Regulatory Transparency Readiness Band */}
        <section
          aria-label="যোগাযোগ ও সহায়তা নির্দেশিকা"
          className="bcp-periwinkle-soft py-12 sm:py-14"
        >
          <div className="ps-container space-y-6">
            <div className="rounded-[20px] border border-[#B8BBFF]/80 bg-white p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <p className="font-en text-xs font-bold uppercase tracking-[0.16em] text-[#243FBA]">
                  Contact & Direct Support
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#202D72] leading-snug">
                  কোর্স, পেশাদার সেবা অথবা প্রকাশনা বিষয়ে সরাসরি যোগাযোগ করুন
                </h2>
                <p className="text-sm text-[#596775] leading-relaxed">
                  আমাদের টিম আপনার প্রশ্ন ও কমপ্লায়েন্স প্রয়োজন পর্যালোচনা করে যথাযথ
                  দিকনির্দেশনা প্রদান করবে।
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/contact"
                  className="ps-primary-button whitespace-nowrap"
                >
                  <PhoneCall className="w-4 h-4" aria-hidden="true" />
                  <span>যোগাযোগ পাতায় যান</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <WhatsAppEnquiryButton
                  verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                  serviceName="Business Compliance Partner সহায়তা"
                  servicePath="/contact"
                  canonicalBaseUrl={canonicalBaseUrl}
                  fallbackHref="/consultancy"
                  size="md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href="/licensing"
                className="rounded-[14px] border border-[#E1E4F2] bg-white hover:border-[#243FBA] hover:bg-[#FBFAFF] p-4 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#E2E3FF] text-[#243FBA] shrink-0">
                    <FileCheck2 className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#081838]">
                      লাইসেন্সিং ও নিবন্ধন নির্দেশিকা
                    </p>
                    <p className="text-xs text-[#596775] truncate">
                      ট্রেড লাইসেন্স, Smart RJSC, DIFE, ফায়ার ও IRC/ERC
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#243FBA] shrink-0" aria-hidden="true" />
              </Link>

              <Link
                href="/faq"
                className="rounded-[14px] border border-[#E1E4F2] bg-white hover:border-[#243FBA] hover:bg-[#FBFAFF] p-4 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#E2E3FF] text-[#243FBA] shrink-0">
                    <HelpCircle className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#081838]">
                      সচরাচর জিজ্ঞাসা ও চেকলিস্ট
                    </p>
                    <p className="text-xs text-[#596775] truncate">
                      Courses, Services ({servicesData.items.length}+) ও Books সম্পর্কে প্রশ্নোত্তর
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#243FBA] shrink-0" aria-hidden="true" />
              </Link>
            </div>

            <AuthorityNote limitationsBn={siteConfig.legalDisclaimerBn} />
          </div>
        </section>
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
