import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  FileCheck2,
  MessageSquareText,
} from "lucide-react";
import { getPublicSiteConfig } from "@/lib/config/site";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { AuthorityNote } from "@/components/shared/AuthorityNote";
import { CTASection } from "@/components/shared/CTASection";
import { StatCounters } from "@/components/ui/StatCounters";
import { EcosystemInfographics } from "@/components/home/EcosystemInfographics";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে",
  description:
    "Business Compliance Partner-এর লক্ষ্য, চারটি মূল স্তম্ভ এবং স্বচ্ছ প্রক্রিয়া সম্পর্কে জানুন।",
  alternates: { canonical: "/about" },
};

const PILLARS = [
  {
    titleBn: "১. কোর্স ও প্রশিক্ষণ (Learn)",
    descBn:
      "Tax, VAT, e-GP, E-commerce ও RJSC সহ ১০টি ব্যবহারিক প্রশিক্ষণ ট্র্যাক।",
    href: "/courses",
    ctaBn: "সকল কোর্স দেখুন",
    icon: BookOpen,
  },
  {
    titleBn: "২. পেশাদার সেবা (Services)",
    descBn:
      "আয়কর, ভ্যাট, কর্পোরেট সেক্রেটারিয়াল, কাস্টমস ও অ্যাকাউন্টিংয়ে ১১টি সেবা বিভাগ।",
    href: "/services",
    ctaBn: "সকল সেবা দেখুন",
    icon: BriefcaseBusiness,
  },
  {
    titleBn: "৩. লাইসেন্সিং ও নিবন্ধন (Licensing)",
    descBn:
      "ট্রেড লাইসেন্স, Smart RJSC, DIFE, ফায়ার ও IRC/ERC নিবন্ধন নির্দেশিকা।",
    href: "/licensing",
    ctaBn: "লাইসেন্সিং দেখুন",
    icon: FileCheck2,
  },
  {
    titleBn: "৪. বিশেষজ্ঞ পরামর্শ (Consultancy)",
    descBn:
      "ব্যক্তিগত বা প্রাতিষ্ঠানিক সমস্যা পর্যালোচনা ও সরাসরি WhatsApp বা ফর্ম সহায়তা।",
    href: "/consultancy",
    ctaBn: "পরামর্শ চান",
    icon: MessageSquareText,
  },
];

export default async function AboutPage() {
  const siteConfig = await getPublicSiteConfig();

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bg-ps-midnight text-ps-white py-12 sm:py-14 border-b border-ps-gold/30">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              dark
              items={[{ labelBn: "হোম", href: "/" }, { labelBn: "আমাদের সম্পর্কে" }]}
            />
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold leading-snug">
                ব্যবসায়িক শিক্ষা ও কমপ্লায়েন্স সহায়তার একটি সুসংগঠিত প্ল্যাটফর্ম
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                বাংলাদেশের উদ্যোক্তা, এসএমই প্রতিষ্ঠান ও পেশাজীবীদের জন্য প্রয়োজনীয় জ্ঞান
                এবং নথিপত্র-সংক্রান্ত সহায়তাকে সহজ বাংলায় উপস্থাপন করাই আমাদের মূল
                উদ্দেশ্য।
              </p>
            </div>
          </div>
          <div className="mt-10">
            <StatCounters />
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="ps-container max-w-5xl space-y-10">
            <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 sm:p-8 space-y-4">
              <h2 className="text-2xl font-bold text-ps-navy">
                আমাদের দৃষ্টিভঙ্গি: স্বচ্ছতা ও বাস্তবতা
              </h2>
              <p className="text-sm sm:text-base text-ps-ink/90 leading-relaxed">
                ব্যবসা নিবন্ধন, আয়কর, ভ্যাট, টেন্ডার বা শ্রম আইন কমপ্লায়েন্স—এসব
                বিষয় প্রায়ই জটিল ও বিচ্ছিন্ন তথ্যের কারণে উদ্যোক্তাদের জন্য কঠিন হয়ে
                ওঠে। আমাদের লক্ষ্য হলো শেখা (Courses), পেশাদার সহায়তা (Services),
                লাইসেন্সিং নির্দেশিকা (Licensing) এবং পরামর্শ (Consultancy)—এই চারটি
                স্তম্ভকে একত্রিত করে পরিষ্কার পথনির্দেশ দেওয়া।
              </p>
              <p className="text-sm sm:text-base text-ps-ink/90 leading-relaxed">
                আমরা কোনো অতিরঞ্জিত দাবি বা কাল্পনিক পরিসংখ্যান প্রকাশ করি না; বরং
                প্রত্যেকটি ধাপে কাজের পরিধি, সীমাবদ্ধতা এবং সংশ্লিষ্ট সরকারি কর্তৃপক্ষের
                সঠিক ভূমিকা স্পষ্টভাবে তুলে ধরি।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {PILLARS.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <article
                    key={pillar.href}
                    className="rounded-[16px] border border-ps-border bg-ps-white p-6 flex flex-col justify-between gap-4 shadow-xs"
                  >
                    <div className="space-y-2.5">
                      <span className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] bg-ps-navy/10 text-ps-navy">
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </span>
                      <h3 className="text-lg font-bold text-ps-navy">
                        {pillar.titleBn}
                      </h3>
                      <p className="text-sm text-ps-ink/85 leading-relaxed">
                        {pillar.descBn}
                      </p>
                    </div>
                    <Link
                      href={pillar.href}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-ps-navy hover:underline underline-offset-4 self-start"
                    >
                      <span>{pillar.ctaBn}</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>

            <AuthorityNote limitationsBn={siteConfig.legalDisclaimerBn} />
          </div>
        </section>

        <EcosystemInfographics />

        <CTASection
          titleBn="আপনার ব্যবসার প্রয়োজন নিয়ে কথা বলতে চান?"
          descriptionBn="আমাদের ক্যাটালগ দেখুন অথবা কনসালটেন্সি ফর্মে আপনার প্রশ্ন পাঠান।"
          primaryHref="/consultancy"
          primaryLabelBn="পরামর্শের অনুরোধ করুন"
          secondaryHref="/courses"
          secondaryLabelBn="কোর্স দেখুন"
        />
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
