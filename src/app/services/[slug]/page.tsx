import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getCanonicalBaseUrl, getPublicSiteConfig } from "@/lib/config/site";
import { loadBookCatalog } from "@/lib/books/catalog";
import { rankRelatedBooks } from "@/lib/recommendations/cross-division";
import {
  getPublishedServiceBySlug,
  listRelatedServices,
} from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { AuthorityNote } from "@/components/shared/AuthorityNote";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { VerificationMeta } from "@/components/shared/VerificationMeta";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";
import { DocumentReadinessWidget } from "@/components/shared/DocumentReadinessWidget";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { BookCard } from "@/components/books/BookCard";

interface ServiceDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  if (!service) {
    return { title: "সেবা পাওয়া যায়নি" };
  }
  return {
    title: service.seoTitle || service.titleBn,
    description: service.seoDescription || service.summaryBn,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

export default async function ServiceDetailPage({
  params,
}: ServiceDetailPageProps) {
  const { slug } = await params;
  const [siteConfig, service, allBooksRes] = await Promise.all([
    getPublicSiteConfig(),
    getPublishedServiceBySlug(slug),
    loadBookCatalog({ limit: 12 }),
  ]);

  if (!service) {
    notFound();
  }

  const canonicalBaseUrl = getCanonicalBaseUrl();
  const relatedServices = await listRelatedServices(
    service.categorySlug,
    service.slug,
    3,
  );
  const relatedBooks = rankRelatedBooks(
    allBooksRes.items,
    {
      titleBn: service.titleBn,
      titleEn: service.titleEn,
      categorySlug: service.categorySlug,
      categoryNameBn: service.categoryNameBn,
      summaryBn: service.summaryBn,
      topics: service.processSteps.map((s) => s.titleBn),
      relatedServiceCategorySlug: service.categorySlug,
    },
    undefined,
    2,
  );
  const enquiryHref = `/consultancy?pillar=SERVICES&slug=${encodeURIComponent(
    service.slug,
  )}&topic=${encodeURIComponent(service.titleBn)}`;

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bg-gradient-to-br from-[#F2EFF8] via-[#ECE7F5] to-[#E5DDF2] text-[#081838] py-10 sm:py-12 border-b border-[#D4CCE3]">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              items={[
                { labelBn: "হোম", href: "/" },
                { labelBn: "পেশাদার সেবা", href: "/services" },
                { labelBn: service.titleBn },
              ]}
            />
            <div className="max-w-3xl space-y-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="cool">{service.categoryNameBn}</Badge>
                <StatusBadge status={service.availabilityStatus} />
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold leading-snug text-[#081838]">
                {service.titleBn}
              </h1>
              {service.titleEn ? (
                <p className="font-en text-sm font-semibold text-[#51406F]" lang="en">
                  {service.titleEn}
                </p>
              ) : null}
              <p className="text-sm sm:text-base text-[#181D26]/85 leading-relaxed">
                {service.summaryBn}
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <VerificationMeta
                lastVerifiedAt={service.lastVerifiedAt}
                verifiedBy={service.verifiedBy}
              />

              <div className="rounded-[16px] border border-[#D4CCE3] bg-white p-6 space-y-3">
                <h2 className="text-xl font-bold text-[#081838]">
                  এই সেবাটি কাদের প্রয়োজন
                </h2>
                <p className="text-sm sm:text-base text-[#181D26]/90 leading-relaxed">
                  {service.whoNeedsItBn}
                </p>
              </div>

              <div className="rounded-[16px] border border-[#D4CCE3] bg-white p-6 space-y-3">
                <h2 className="text-xl font-bold text-[#081838]">
                  আমাদের সহায়তার পরিধি
                </h2>
                <p className="text-sm sm:text-base text-[#181D26]/90 leading-relaxed">
                  {service.assistanceScopeBn}
                </p>
              </div>

              <AuthorityNote
                authorityName={service.authorityName}
                officialSourceLabel={service.officialSourceLabel}
                officialSourceUrl={service.officialSourceUrl}
                limitationsBn={service.limitationsBn}
              />

              <DocumentReadinessWidget documents={service.documentsSummary} />

              {service.processSteps.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-[#081838]">কার্যপ্রক্রিয়া</h2>
                  <ProcessSteps
                    steps={service.processSteps}
                    columns={service.processSteps.length <= 3 ? 3 : 4}
                  />
                </div>
              ) : null}
            </div>

            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              <div className="rounded-[16px] border border-[#D4CCE3] bg-white p-6 space-y-5 shadow-sm">
                <h2 className="text-lg font-bold text-[#081838]">
                  এই সেবাটি সম্পর্কে পরামর্শ নিন
                </h2>
                <p className="text-xs sm:text-sm text-[#596775] leading-relaxed">
                  আপনার ব্যবসার অবস্থা ও প্রয়োজন সংক্ষেপে পাঠালে আমাদের টিম যোগাযোগ করবে।
                </p>

                {(service.serviceFeeNoteBn || service.govtFeeNoteBn) ? (
                  <div className="space-y-2 rounded-[12px] bg-[#F2EFF8] border border-[#D4CCE3] p-4 text-xs">
                    {service.serviceFeeNoteBn ? (
                      <p>
                        <strong>সার্ভিস চার্জ:</strong> {service.serviceFeeNoteBn}
                      </p>
                    ) : null}
                    {service.govtFeeNoteBn ? (
                      <p>
                        <strong>সরকারি ফি (পৃথক):</strong> {service.govtFeeNoteBn}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <WhatsAppEnquiryButton
                  verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                  serviceName={service.titleBn}
                  servicePath={`/services/${service.slug}`}
                  canonicalBaseUrl={canonicalBaseUrl}
                  fallbackHref={enquiryHref}
                  fullWidth
                  size="lg"
                />

                <Link href={enquiryHref} className="ps-secondary-button w-full">
                  <span>ফর্মের মাধ্যমে সেবার অনুরোধ</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* Cross-Division Books Discovery */}
        {relatedBooks.length > 0 ? (
          <section className="py-10 sm:py-12 bg-[#F2EFF8]/65 border-t border-[#D4CCE3]">
            <div className="ps-container space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
                  এই সেবার সাথে সম্পর্কিত প্রস্তাবিত বইসমূহ
                </h2>
                <Link
                  href="/books"
                  className="text-sm font-semibold text-[#51406F] hover:underline underline-offset-4"
                >
                  সব বই প্রিভিউ →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedBooks.map((book) => (
                  <BookCard
                    key={book.slug}
                    book={book}
                    verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                    canonicalBaseUrl={canonicalBaseUrl}
                  />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {relatedServices.length > 0 ? (
          <section className="py-10 sm:py-12 bg-white border-t border-[#D4CCE3]">
            <div className="ps-container space-y-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
                  সম্পর্কিত অন্যান্য সেবা
                </h2>
                <Link
                  href={`/services?category=${encodeURIComponent(service.categorySlug)}`}
                  className="text-sm font-semibold text-[#51406F] hover:underline underline-offset-4"
                >
                  এই বিভাগের সব সেবা →
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedServices.map((item) => (
                  <ServiceCard
                    key={item.slug}
                    service={item}
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
