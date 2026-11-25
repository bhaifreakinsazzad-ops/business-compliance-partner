import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import {
  getPublishedLicensingBySlug,
  listRelatedLicensing,
} from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { AuthorityNote } from "@/components/shared/AuthorityNote";
import { VerificationMeta } from "@/components/shared/VerificationMeta";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";
import { DocumentReadinessWidget } from "@/components/shared/DocumentReadinessWidget";
import { LicensingCard } from "@/components/shared/LicensingCard";

interface LicensingDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: LicensingDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getPublishedLicensingBySlug(slug);
  if (!entry) {
    return { title: "তথ্য পাওয়া যায়নি" };
  }
  return {
    title: entry.seoTitle || entry.titleBn,
    description: entry.seoDescription || entry.summaryBn,
    alternates: { canonical: `/licensing/${entry.slug}` },
  };
}

export default async function LicensingDetailPage({
  params,
}: LicensingDetailProps) {
  const { slug } = await params;
  const [siteConfig, entry] = await Promise.all([
    getPublicSiteConfig(),
    getPublishedLicensingBySlug(slug),
  ]);

  if (!entry) {
    notFound();
  }

  const canonicalBaseUrl = getCanonicalBaseUrl();
  const relatedLicensing = await listRelatedLicensing(
    entry.categorySlug,
    entry.slug,
    2,
  );
  const enquiryHref = `/consultancy?pillar=LICENSING&slug=${encodeURIComponent(
    entry.slug,
  )}&topic=${encodeURIComponent(entry.titleBn)}`;

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
                { labelBn: "লাইসেন্সিং", href: "/licensing" },
                { labelBn: entry.titleBn },
              ]}
            />
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="outline">{entry.categoryNameBn}</Badge>
                <StatusBadge status={entry.availabilityStatus} />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold leading-snug">
                {entry.titleBn}
              </h1>
              {entry.titleEn ? (
                <p className="font-en text-sm text-ps-gold" lang="en">
                  {entry.titleEn}
                </p>
              ) : null}
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                {entry.summaryBn}
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <VerificationMeta
                lastVerifiedAt={entry.lastVerifiedAt}
                verifiedBy={entry.verifiedBy}
              />

              <AuthorityNote
                authorityName={entry.authorityName}
                officialSourceLabel={entry.officialSourceLabel}
                officialSourceUrl={entry.officialSourceUrl}
                limitationsBn={entry.limitationsBn}
              />

              <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-3">
                <h2 className="text-xl font-bold text-ps-navy">
                  ডকুমেন্টেশন ও সহায়তার পরিধি
                </h2>
                <p className="text-sm sm:text-base text-ps-ink/90 leading-relaxed">
                  {entry.serviceScopeBn}
                </p>
              </div>

              <DocumentReadinessWidget
                documents={entry.documentsSummary}
                headingBn="প্রাথমিক নথিপত্র (পেশাদার পর্যালোচনা সাপেক্ষ)"
              />

              <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-3">
                <h2 className="text-xl font-bold text-ps-navy">
                  প্রক্রিয়ার সংক্ষিপ্ত ধাপ
                </h2>
                <p className="text-sm sm:text-base text-ps-ink/90 leading-relaxed">
                  {entry.processSummaryBn}
                </p>
              </div>
            </div>

            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              <div className="rounded-[16px] border-2 border-ps-navy/15 bg-ps-white p-6 space-y-5 shadow-sm">
                <h2 className="text-lg font-bold text-ps-navy">
                  এই লাইসেন্সিং বিষয়ে সহায়তা নিন
                </h2>
                <p className="text-xs sm:text-sm text-ps-muted leading-relaxed">
                  আপনার প্রতিষ্ঠানের ধরন ও বর্তমান অবস্থা জানিয়ে অনুরোধ পাঠান—আমাদের টিম
                  তথ্য যাচাই করে যোগাযোগ করবে।
                </p>
                <WhatsAppEnquiryButton
                  verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                  serviceName={entry.titleBn}
                  servicePath={`/licensing/${entry.slug}`}
                  canonicalBaseUrl={canonicalBaseUrl}
                  fallbackHref={enquiryHref}
                  fallbackLabelBn="সহায়তা চাই"
                  fullWidth
                  size="lg"
                />

                <Link href={enquiryHref} className="ps-secondary-button w-full">
                  <span>ফর্মের মাধ্যমে সহায়তা চাই</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {relatedLicensing.length > 0 ? (
          <section className="py-10 sm:py-12 bg-ps-white border-t border-ps-border">
            <div className="ps-container space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-ps-navy">
                  সম্পর্কিত অন্যান্য লাইসেন্সিং
                </h2>
                <Link
                  href={`/licensing?category=${encodeURIComponent(entry.categorySlug)}`}
                  className="text-sm font-semibold text-ps-navy hover:underline underline-offset-4"
                >
                  এই বিভাগের সব লাইসেন্সিং →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedLicensing.map((item) => (
                  <LicensingCard
                    key={item.slug}
                    entry={item}
                    verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                    canonicalBaseUrl={canonicalBaseUrl}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
