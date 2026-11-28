import type { Metadata } from "next";
import { getPublicSiteConfig } from "@/lib/config/site";
import { AppHeader } from "@/components/layout/AppHeader";
import { Footer } from "@/components/layout/Footer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ToolsHub } from "@/components/tools/ToolsHub";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/seo/structured-data";
import { getCanonicalBaseUrl } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "ইন্টারেক্টিভ ব্যবসায়িক টুলস — প্রস্তুতি, চেকলিস্ট ও রোডম্যাপ",
  description:
    "আপনার ব্যবসার কমপ্লায়েন্স প্রস্তুতি মূল্যায়ন করুন, প্রয়োজনীয় নথির স্মার্ট চেকলিস্ট তৈরি করুন এবং বাস্তবসম্মত ব্যবসায়িক রোডম্যাপ দেখুন।",
};

export default async function ToolsPage() {
  const siteConfig = await getPublicSiteConfig();
  const baseUrl = getCanonicalBaseUrl();

  const breadcrumbs = buildBreadcrumbJsonLd(baseUrl, [
    { name: "হোম", path: "/" },
    { name: "টুলস ও মূল্যায়ন", path: "/tools" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} id="tools-breadcrumbs-jsonld" />
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bcp-periwinkle-contact-header border-b border-[#E1E4F2] py-10 sm:py-12">
          <div className="ps-container">
            <SectionHeading
              eyebrowEn="Interactive Business Tools"
              titleBn="ব্যবসার সঠিক পথ ও প্রস্তুতি নির্ধারণ করুন"
              descriptionBn="কোনো ব্যক্তিগত তথ্য ছাড়াই আপনার ব্যবসার বর্তমান অবস্থা মূল্যায়ন করুন, দরকারি চেকলিস্ট গুছিয়ে রাখুন এবং যৌক্তিক ধারাবাহিকতা দেখুন।"
              align="center"
            />
          </div>
        </section>

        <section className="ps-container py-8 sm:py-10">
          <ToolsHub />
        </section>
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
