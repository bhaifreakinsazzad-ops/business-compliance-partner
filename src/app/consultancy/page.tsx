import type { Metadata } from "next";
import { Lock, MessageSquareText, ShieldCheck } from "lucide-react";
import type { Pillar } from "@/types/domain";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { ConsultancyForm } from "@/components/forms/ConsultancyForm";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";

export const metadata: Metadata = {
  title: "কনসালটেন্সি ও পরামর্শ অনুরোধ",
  description:
    "আপনার ব্যবসার সমস্যাটি সংক্ষেপে লিখে পাঠান। আমাদের টিম তথ্য পর্যালোচনা করে উপযুক্ত সময়ে আপনার সঙ্গে যোগাযোগ করবে।",
  alternates: { canonical: "/consultancy" },
};

const VALID_PILLARS: ReadonlySet<Pillar> = new Set([
  "COURSES",
  "SERVICES",
  "LICENSING",
  "CONSULTANCY",
]);

interface ConsultancyPageProps {
  searchParams: Promise<{
    pillar?: string;
    slug?: string;
    topic?: string;
  }>;
}

export default async function ConsultancyPage({
  searchParams,
}: ConsultancyPageProps) {
  const { pillar, slug, topic } = await searchParams;
  const siteConfig = await getPublicSiteConfig();
  const canonicalBaseUrl = getCanonicalBaseUrl();

  const resolvedPillar: Pillar =
    pillar && VALID_PILLARS.has(pillar as Pillar)
      ? (pillar as Pillar)
      : "CONSULTANCY";

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
                { labelBn: "কনসালটেন্সি ও পরামর্শ" },
              ]}
            />
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-ps-gold/40 bg-ps-navy px-3 py-1 text-xs font-medium text-ps-ivory">
                <MessageSquareText className="w-3.5 h-3.5 text-ps-gold" aria-hidden="true" />
                <span lang="en">Consultancy &amp; Business Advisory</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold leading-snug">
                আপনার ব্যবসার সমস্যাটি জানান
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                আপনার প্রয়োজন সংক্ষেপে লিখুন। আমাদের টিম তথ্য পর্যালোচনা করে উপযুক্ত
                সময়ে আপনার সঙ্গে যোগাযোগ করবে।
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              <ConsultancyForm
                defaultPillar={resolvedPillar}
                targetSlug={slug ?? null}
                targetTitle={topic ?? null}
                sourcePage="/consultancy"
              />
            </div>

            <aside className="lg:col-span-4 space-y-5">
              {siteConfig.verifiedWhatsapp ? (
                <div className="rounded-[16px] border-2 border-ps-success/35 bg-ps-white p-6 space-y-3 shadow-sm">
                  <h2 className="text-lg font-bold text-ps-navy">
                    সরাসরি WhatsApp-এ কথা বলুন
                  </h2>
                  <p className="text-xs sm:text-sm text-ps-muted leading-relaxed">
                    ফর্ম পূরণের পাশাপাশি চাইলে সরাসরি WhatsApp-এ আপনার প্রয়োজনের কথা জানাতে পারেন।
                  </p>
                  <WhatsAppEnquiryButton
                    verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                    serviceName={topic ?? "ব্যবসায়িক কনসালটেন্সি"}
                    servicePath="/consultancy"
                    canonicalBaseUrl={canonicalBaseUrl}
                    fallbackHref="/consultancy"
                    fullWidth
                  />
                </div>
              ) : null}

              <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-4">
                <h2 className="text-lg font-bold text-ps-navy">
                  জমা দেওয়ার পরবর্তী ধাপ
                </h2>
                <ol className="space-y-3 text-sm text-ps-ink/90 list-decimal list-inside">
                  <li>
                    অনুরোধ জমা হলে সার্ভার থেকে একটি স্থায়ী রেফারেন্স নম্বর (
                    <span lang="en">BCP-YYYY-XXXXXXXX</span>) পাবেন।
                  </li>
                  <li>আমাদের সংশ্লিষ্ট টিম আপনার বিষয়টি প্রাথমিক পর্যালোচনা করবে।</li>
                  <li>টিম উপযুক্ত সময়ে আপনার প্রদত্ত মাধ্যমে যোগাযোগ করবে।</li>
                </ol>
              </div>

              <div className="rounded-[16px] border border-ps-gold/50 bg-ps-ivory p-6 space-y-3">
                <div className="flex items-center gap-2 text-ps-navy font-bold text-sm">
                  <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>সংবেদনশীল নথি আপলোড নিষেধ</span>
                </div>
                <p className="text-xs sm:text-sm text-ps-ink/85 leading-relaxed">
                  প্রাথমিক অনুরোধে জাতীয় পরিচয়পত্র (NID), পাসপোর্ট, আয়কর নথি বা ব্যাংক
                  স্টেটমেন্ট পাঠাবেন না। প্রয়োজনীয় ডকুমেন্ট যাচাই পরবর্তী ধাপে টিমের
                  মাধ্যমে সমন্বয় করা হবে।
                </p>
              </div>

              <div className="rounded-[16px] border border-ps-border bg-ps-cool p-6 space-y-2">
                <div className="flex items-center gap-2 text-ps-navy font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>স্বাধীন পরামর্শ প্ল্যাটফর্ম</span>
                </div>
                <p className="text-xs text-ps-ink/85 leading-relaxed">
                  {siteConfig.legalDisclaimerBn}
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
