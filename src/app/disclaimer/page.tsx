import type { Metadata } from "next";
import { getPublicSiteConfig } from "@/lib/config/site";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { AuthorityNote } from "@/components/shared/AuthorityNote";

export const metadata: Metadata = {
  title: "আইনি ও রেগুলেটরি ডিসক্লেইমার",
  description:
    "Paperwork Squad-এর স্বাধীন প্ল্যাটফর্ম অবস্থান ও বাংলাদেশি সরকারি কর্তৃপক্ষ সংক্রান্ত ডিসক্লেইমার।",
  alternates: { canonical: "/disclaimer" },
};

export default async function DisclaimerPage() {
  const siteConfig = await getPublicSiteConfig();

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bg-ps-midnight text-ps-white py-12 sm:py-14 border-b border-ps-gold/30">
          <div className="ps-container space-y-4">
            <Breadcrumbs
              dark
              items={[{ labelBn: "হোম", href: "/" }, { labelBn: "ডিসক্লেইমার" }]}
            />
            <h1 className="text-3xl sm:text-4xl font-bold">
              আইনি ও রেগুলেটরি ডিসক্লেইমার
            </h1>
          </div>
        </section>

        <section className="py-12">
          <div className="ps-container max-w-4xl space-y-6">
            <AuthorityNote limitationsBn={siteConfig.legalDisclaimerBn} />

            <article className="rounded-[16px] border border-ps-border bg-ps-white p-6 sm:p-8 space-y-4 text-sm sm:text-base text-ps-ink/90 leading-relaxed">
              <p>
                Smart RJSC, জাতীয় রাজস্ব বোর্ড (NBR), বাংলাদেশ পাবলিক প্রকিউরমেন্ট
                অথরিটি (BPPA / e-GP), কলকারখানা ও প্রতিষ্ঠান পরিদর্শন অধিদপ্তর (DIFE),
                বাংলাদেশ ফায়ার সার্ভিস ও সিভিল ডিফেন্স, পরিবেশ অধিদপ্তর (DoE), CCI&amp;E
                এবং BIDA—প্রত্যেকটি স্ব-স্ব সরকারি সংস্থা ও নিজস্ব অফিসিয়াল পোর্টাল
                পরিচালনা করে।
              </p>
              <p>
                Paperwork Squad এসব সংস্থার কোনো প্রতিনিধি, এজেন্ট বা সরকারি পোর্টাল
                নয়। আমরা কখনোই কোনো অনুমোদন, লাইসেন্স বা টেন্ডার সাফল্যের নিশ্চয়তা
                প্রদান করি না।
              </p>
            </article>
          </div>
        </section>
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
