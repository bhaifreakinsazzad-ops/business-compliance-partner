import type { Metadata } from "next";
import { Lock, MessageSquareText, ShieldCheck } from "lucide-react";
import type { Pillar } from "@/types/domain";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import { formatWhatsAppDisplay } from "@/lib/contact/whatsapp";
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
  const whatsappDisplay = formatWhatsAppDisplay(siteConfig.verifiedWhatsapp);

  const resolvedPillar: Pillar =
    pillar && VALID_PILLARS.has(pillar as Pillar)
      ? (pillar as Pillar)
      : "CONSULTANCY";

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bcp-periwinkle-contact-header text-[#081838] py-10 sm:py-12 border-b border-[#E1E4F2]">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              items={[
                { labelBn: "হোম", href: "/" },
                { labelBn: "কনসালটেন্সি ও পরামর্শ" },
              ]}
            />
            <div className="max-w-3xl space-y-3">
              <p className="inline-flex items-center gap-2 text-xs font-en font-semibold uppercase tracking-[0.14em] text-[#243FBA]">
                <MessageSquareText className="w-4 h-4 text-[#243FBA]" aria-hidden="true" />
                <span>Consultancy &amp; Business Advisory</span>
              </p>
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-snug text-[#081838]">
                আপনার ব্যবসার সমস্যাটি জানান
              </h1>
              <p className="text-sm sm:text-base text-[#181D26]/85 leading-relaxed">
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
                verifiedWhatsapp={siteConfig.verifiedWhatsapp}
              />
            </div>

            <aside className="lg:col-span-4 space-y-5">
              {siteConfig.verifiedWhatsapp ? (
                <div className="rounded-[16px] border border-[#00865A]/40 bg-white p-6 space-y-3 shadow-sm">
                  <h2 className="text-lg font-bold text-[#081838]">
                    সরাসরি WhatsApp-এ কথা বলুন
                  </h2>
                  <p className="text-xs sm:text-sm text-[#596775] leading-relaxed">
                    ফর্ম পূরণের পাশাপাশি চাইলে সরাসরি আমাদের অফিশিয়াল WhatsApp নম্বরে{" "}
                    {whatsappDisplay ? (
                      <span className="font-en font-semibold text-[#081838]" dir="ltr">
                        ({whatsappDisplay})
                      </span>
                    ) : null}{" "}
                    আপনার প্রয়োজনের কথা জানাতে পারেন।
                  </p>
                  <WhatsAppEnquiryButton
                    verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                    serviceName={topic ?? "ব্যবসায়িক কনসালটেন্সি"}
                    servicePath="/consultancy"
                    canonicalBaseUrl={canonicalBaseUrl}
                    fallbackHref="/consultancy"
                    labelBn="WhatsApp-এ অ্যাডমিনের সাথে কথা বলুন"
                    fullWidth
                  />
                </div>
              ) : null}

              <div className="rounded-[16px] border border-[#E1E4F2] bg-white p-6 space-y-4">
                <h2 className="text-lg font-bold text-[#081838]">
                  জমা দেওয়ার পরবর্তী ধাপ
                </h2>
                <ol className="space-y-3 text-sm text-[#181D26]/90 list-decimal list-inside">
                  <li>
                    অনুরোধ জমা হলে সার্ভার থেকে একটি স্থায়ী রেফারেন্স নম্বর (
                    <span lang="en">BCP-YYYY-XXXXXXXX</span>) পাবেন।
                  </li>
                  <li>আমাদের সংশ্লিষ্ট টিম আপনার বিষয়টি প্রাথমিক পর্যালোচনা করবে।</li>
                  <li>টিম উপযুক্ত সময়ে আপনার প্রদত্ত মাধ্যমে যোগাযোগ করবে।</li>
                </ol>
              </div>

              <div className="rounded-[16px] border border-[#E1E4F2] bg-[#FBFAFF] p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#081838] font-bold text-sm">
                  <Lock className="w-4 h-4 text-[#243FBA] shrink-0" aria-hidden="true" />
                  <span>সংবেদনশীল নথি আপলোড নিষেধ</span>
                </div>
                <p className="text-xs sm:text-sm text-[#181D26]/85 leading-relaxed">
                  প্রাথমিক অনুরোধে জাতীয় পরিচয়পত্র (NID), পাসপোর্ট, আয়কর নথি বা ব্যাংক
                  স্টেটমেন্ট পাঠাবেন না। প্রয়োজনীয় ডকুমেন্ট যাচাই পরবর্তী ধাপে টিমের
                  মাধ্যমে সমন্বয় করা হবে।
                </p>
              </div>

              <div className="rounded-[16px] border border-[#E1E4F2] bg-white p-6 space-y-2">
                <div className="flex items-center gap-2 text-[#081838] font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#243FBA] shrink-0" aria-hidden="true" />
                  <span>স্বাধীন পরামর্শ প্ল্যাটফর্ম</span>
                </div>
                <p className="text-xs text-[#596775] leading-relaxed">
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
