import type { Metadata } from "next";
import { getPublicSiteConfig } from "@/lib/config/site";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { AuthorityNote } from "@/components/shared/AuthorityNote";
import { CTASection } from "@/components/shared/CTASection";

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে",
  description:
    "Paperwork Squad-এর লক্ষ্য, চারটি মূল স্তম্ভ এবং স্বচ্ছ প্রক্রিয়া সম্পর্কে জানুন।",
  alternates: { canonical: "/about" },
};

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
        </section>

        <section className="py-12 sm:py-16">
          <div className="ps-container max-w-4xl space-y-8">
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

            <AuthorityNote limitationsBn={siteConfig.legalDisclaimerBn} />
          </div>
        </section>

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
