import type { Metadata } from "next";
import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { getPublicSiteConfig } from "@/lib/config/site";
import { listPublishedLicensing } from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { AuthorityNote } from "@/components/shared/AuthorityNote";
import { EmptyState } from "@/components/shared/EmptyState";
import { LicensingCard } from "@/components/shared/LicensingCard";
import { SearchBox } from "@/components/shared/SearchBox";
import { CTASection } from "@/components/shared/CTASection";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "লাইসেন্সিং ও নিবন্ধন নির্দেশিকা",
  description:
    "ট্রেড লাইসেন্স, Smart RJSC, NBR e-TIN/BIN, DIFE LIMA, ফায়ার সার্ভিস e-Fire লাইসেন্স এবং IRC/ERC নিবন্ধন সহায়তা নির্দেশিকা।",
  alternates: { canonical: "/licensing" },
};

interface LicensingPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function LicensingPage({
  searchParams,
}: LicensingPageProps) {
  const { category = "", q = "" } = await searchParams;
  const [siteConfig, { categories, items }] = await Promise.all([
    getPublicSiteConfig(),
    listPublishedLicensing({
      categorySlug: category || undefined,
      q: q || undefined,
    }),
  ]);

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
                { labelBn: "লাইসেন্সিং ও নিবন্ধন" },
              ]}
            />
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-ps-gold/40 bg-ps-navy px-3 py-1 text-xs font-medium text-ps-ivory">
                <FileCheck2 className="w-3.5 h-3.5 text-ps-gold" aria-hidden="true" />
                <span lang="en">Licensing &amp; Registration Directory</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold leading-snug">
                ব্যবসায়িক লাইসেন্সিং ও নিবন্ধন সহায়তা
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                সংশ্লিষ্ট সরকারি কর্তৃপক্ষের সঠিক তথ্যসূত্র, প্রাথমিক নথিপত্র এবং
                আবেদন প্রস্তুতির নির্দেশিকা।
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="ps-container space-y-8">
            <AuthorityNote limitationsBn={siteConfig.legalDisclaimerBn} />

            <div className="rounded-[16px] bg-ps-white border border-ps-border p-5 sm:p-6 space-y-5 shadow-sm">
              <SearchBox
                action="/licensing"
                defaultValue={q}
                categoryHiddenValue={category || undefined}
                labelBn="লাইসেন্স বা নিবন্ধন খুঁজুন"
                placeholderBn="যেমন: Trade Licence, RJSC, DIFE, Fire, IRC, ERC..."
              />

              <div className="flex flex-wrap gap-2" role="navigation" aria-label="লাইসেন্সিং বিভাগ">
                <Link
                  href={q ? `/licensing?q=${encodeURIComponent(q)}` : "/licensing"}
                  className={cn(
                    "inline-flex items-center min-h-10 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors",
                    !category
                      ? "bg-ps-navy text-ps-white border-ps-navy"
                      : "bg-ps-cool text-ps-navy border-ps-border hover:bg-ps-white",
                  )}
                >
                  সব বিভাগ
                </Link>
                {categories.map((cat) => {
                  const active = cat.slug === category;
                  const href = q
                    ? `/licensing?category=${encodeURIComponent(cat.slug)}&q=${encodeURIComponent(q)}`
                    : `/licensing?category=${encodeURIComponent(cat.slug)}`;
                  return (
                    <Link
                      key={cat.slug}
                      href={href}
                      className={cn(
                        "inline-flex items-center min-h-10 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors",
                        active
                          ? "bg-ps-navy text-ps-white border-ps-navy"
                          : "bg-ps-white text-ps-navy border-ps-border hover:bg-ps-cool",
                      )}
                    >
                      {cat.nameBn}
                    </Link>
                  );
                })}
              </div>
            </div>

            {items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.map((entry) => (
                  <LicensingCard key={entry.slug} entry={entry} />
                ))}
              </div>
            ) : (
              <EmptyState
                titleBn="এই বিভাগে প্রকাশিত কোনো লাইসেন্সিং তথ্য পাওয়া যায়নি"
                descriptionBn="অন্যান্য বিভাগ দেখুন অথবা আপনার প্রয়োজনীয় অনুমোদনের বিষয়ে সরাসরি পরামর্শের অনুরোধ পাঠান।"
                resetHref="/licensing"
                resetLabelBn="সব লাইসেন্সিং দেখুন"
              />
            )}
          </div>
        </section>

        <CTASection
          titleBn="আপনার ব্যবসার জন্য কোন লাইসেন্সগুলো প্রযোজ্য তা নিশ্চিত হতে চান?"
          descriptionBn="ব্যবসার ধরন ও অবস্থান লিখে পাঠালে আমাদের টিম প্রযোজ্য নিবন্ধন তালিকা পর্যালোচনা করে যোগাযোগ করবে।"
          primaryHref="/consultancy?pillar=LICENSING"
          primaryLabelBn="সহায়তা চাই"
        />
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
