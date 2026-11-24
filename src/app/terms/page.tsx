import type { Metadata } from "next";
import { getPublicSiteConfig } from "@/lib/config/site";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "ব্যবহারের শর্তাবলি (Terms of Use)",
  description: "Business Compliance Partner প্ল্যাটফর্ম ব্যবহারের সাধারণ শর্তাবলি।",
  alternates: { canonical: "/terms" },
};

export default async function TermsPage() {
  const siteConfig = await getPublicSiteConfig();

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bg-ps-midnight text-ps-white py-12 sm:py-14 border-b border-ps-gold/30">
          <div className="ps-container space-y-4">
            <Breadcrumbs
              dark
              items={[{ labelBn: "হোম", href: "/" }, { labelBn: "শর্তাবলি" }]}
            />
            <h1 className="text-3xl sm:text-4xl font-bold">
              ব্যবহারের শর্তাবলি
            </h1>
          </div>
        </section>

        <section className="py-12">
          <div className="ps-container max-w-4xl">
            <article className="rounded-[16px] border border-ps-border bg-ps-white p-6 sm:p-8 space-y-6 text-sm sm:text-base text-ps-ink/90 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-xl font-bold text-ps-navy">
                  ১. প্ল্যাটফর্মের প্রকৃতি
                </h2>
                <p>{siteConfig.legalDisclaimerBn}</p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-bold text-ps-navy">
                  ২. তথ্যের নির্ভুলতা ও সীমাবদ্ধতা
                </h2>
                <p>
                  ওয়েবসাইটে প্রদর্শিত কোর্স, সেবা ও লাইসেন্সিং সম্পর্কিত নথি ও প্রক্রিয়ার
                  তথ্য কেবল সাধারণ দিকনির্দেশনার জন্য। সরকারি বিধিমালা, ফর্ম এবং ফি
                  সময়ে সময়ে পরিবর্তিত হতে পারে।
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-bold text-ps-navy">
                  ৩. অনুরোধ দাখিল ও যোগাযোগ
                </h2>
                <p>
                  ফর্ম জমা দেওয়ার অর্থ কোনো চুক্তি স্বাক্ষর বা সরকারি আবেদন দাখিল নয়।
                  আমাদের টিম তথ্য পর্যালোচনা করে উপযুক্ত সময়ে পরবর্তী করণীয় সম্পর্কে
                  যোগাযোগ করবে।
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
