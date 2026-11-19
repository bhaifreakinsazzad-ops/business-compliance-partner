import type { Metadata } from "next";
import { getPublicSiteConfig } from "@/lib/config/site";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "গোপনীয়তা নীতি (Privacy Policy)",
  description:
    "Paperwork Squad-এর ব্যক্তিগত তথ্য সংগ্রহ, সম্মতি, ডেটা মিনিমাইজেশন ও সংরক্ষণ নীতি।",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const siteConfig = await getPublicSiteConfig();

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bg-ps-midnight text-ps-white py-12 sm:py-14 border-b border-ps-gold/30">
          <div className="ps-container space-y-4">
            <Breadcrumbs
              dark
              items={[{ labelBn: "হোম", href: "/" }, { labelBn: "গোপনীয়তা নীতি" }]}
            />
            <h1 className="text-3xl sm:text-4xl font-bold">
              গোপনীয়তা নীতি ও তথ্য সুরক্ষা
            </h1>
            <p className="text-xs sm:text-sm text-ps-gold" lang="en">
              Policy Version: {siteConfig.privacyPolicyVersion} • Subject to final legal counsel approval before production launch
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="ps-container max-w-4xl">
            <article className="rounded-[16px] border border-ps-border bg-ps-white p-6 sm:p-8 space-y-6 text-sm sm:text-base text-ps-ink/90 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-xl font-bold text-ps-navy">
                  ১. কোন তথ্য সংগ্রহ করা হয়
                </h2>
                <p>
                  আপনি যখন কনসালটেন্সি বা কোর্স/সেবা/লাইসেন্সিং অনুরোধ ফর্ম জমা দেন, তখন
                  কেবলমাত্র আপনার নাম, মোবাইল নম্বর, এলাকা/ঠিকানা, প্রয়োজনের বিভাগ এবং
                  সমস্যার বিবরণ (এবং ঐচ্ছিকভাবে ইমেইল বা WhatsApp) সংগ্রহ করা হয়।
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-bold text-ps-navy">
                  ২. সংবেদনশীল নথি সংগ্রহ না করার নীতি (Phase 1)
                </h2>
                <p>
                  এই প্ল্যাটফর্মের প্রাথমিক ধাপে জাতীয় পরিচয়পত্র (NID), পাসপোর্ট, আয়কর
                  নথি বা ব্যাংক স্টেটমেন্টের মতো সংবেদনশীল ফাইল পাবলিক ফর্মের মাধ্যমে সংগ্রহ
                  করা হয় না।
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-bold text-ps-navy">
                  ৩. তথ্য ব্যবহারের উদ্দেশ্য ও সম্মতি
                </h2>
                <p>
                  আপনার অনুরোধ পর্যালোচনা ও যোগাযোগের জন্যই কেবল এই তথ্য ব্যবহার করা
                  হয়। প্রতিটি অনুরোধের সাথে আপনার সুস্পষ্ট সম্মতির সময় (consent
                  timestamp) সংরক্ষিত থাকে। আমাদের অ্যানালিটিক্স সিস্টেমে কোনো ব্যক্তিগত
                  তথ্য (PII) পাঠানো হয় না।
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-bold text-ps-navy">
                  ৪. আইনগত ভিত্তি ও সংরক্ষণ মেয়াদ
                </h2>
                <p>
                  বাংলাদেশ পার্সোনাল ডেটা প্রোটেকশন অ্যাক্ট ২০২৬ (Personal Data
                  Protection Act 2026)-এর মৌলিক নীতিমালা অনুযায়ী ন্যূনতম প্রয়োজনীয় তথ্য
                  সংগ্রহ ও সংরক্ষণের নীতি অনুসরণ করা হয়েছে। চূড়ান্ত সংরক্ষণ সময়সীমা ও
                  মুছে ফেলার নীতিমালা প্রোডাকশন লঞ্চের পূর্বে আইনগত পরামর্শকের অনুমোদনের
                  অধীন।
                </p>
              </section>
            </article>
          </div>
        </section>
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
