import type { Metadata } from "next";
import { getPublicSiteConfig } from "@/lib/config/site";
import { listPublishedFaqs } from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { CTASection } from "@/components/shared/CTASection";

export const metadata: Metadata = {
  title: "সচরাচর জিজ্ঞাসা (FAQ)",
  description:
    "Paperwork Squad-এর কোর্স, পেশাদার সেবা, লাইসেন্সিং ও কনসালটেন্সি প্রক্রিয়া সম্পর্কে সচরাচর জিজ্ঞাসিত প্রশ্নোত্তর।",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const [siteConfig, faqs] = await Promise.all([
    getPublicSiteConfig(),
    listPublishedFaqs(),
  ]);

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bg-ps-midnight text-ps-white py-12 sm:py-14 border-b border-ps-gold/30">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              dark
              items={[{ labelBn: "হোম", href: "/" }, { labelBn: "সচরাচর জিজ্ঞাসা" }]}
            />
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold leading-snug">
                সচরাচর জিজ্ঞাসা (FAQ)
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                আমাদের প্ল্যাটফর্ম, অনুরোধ প্রক্রিয়া এবং রেগুলেটরি সীমাবদ্ধতা সম্পর্কে
                গুরুত্বপূর্ণ প্রশ্ন ও উত্তর।
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="ps-container max-w-4xl">
            <FAQAccordion items={faqs} />
          </div>
        </section>

        <CTASection
          titleBn="আরও কোনো নির্দিষ্ট প্রশ্ন রয়েছে?"
          descriptionBn="আপনার ব্যবসার পরিস্থিতি লিখে পরামর্শের অনুরোধ পাঠান।"
          primaryHref="/consultancy"
          primaryLabelBn="পরামর্শের অনুরোধ করুন"
        />
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
