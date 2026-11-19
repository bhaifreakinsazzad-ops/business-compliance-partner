import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { getPublicSiteConfig } from "@/lib/config/site";
import { getPublishedServiceBySlug } from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { AuthorityNote } from "@/components/shared/AuthorityNote";
import { ProcessSteps } from "@/components/shared/ProcessSteps";
import { VerificationMeta } from "@/components/shared/VerificationMeta";

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
  const [siteConfig, service] = await Promise.all([
    getPublicSiteConfig(),
    getPublishedServiceBySlug(slug),
  ]);

  if (!service) {
    notFound();
  }

  const enquiryHref = `/consultancy?pillar=SERVICES&slug=${encodeURIComponent(
    service.slug,
  )}&topic=${encodeURIComponent(service.titleBn)}`;

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
                { labelBn: "পেশাদার সেবা", href: "/services" },
                { labelBn: service.titleBn },
              ]}
            />
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="outline">{service.categoryNameBn}</Badge>
                <StatusBadge status={service.availabilityStatus} />
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold leading-snug">
                {service.titleBn}
              </h1>
              {service.titleEn ? (
                <p className="font-en text-sm text-ps-gold" lang="en">
                  {service.titleEn}
                </p>
              ) : null}
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
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

              <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-3">
                <h2 className="text-xl font-bold text-ps-navy">
                  এই সেবাটি কাদের প্রয়োজন
                </h2>
                <p className="text-sm sm:text-base text-ps-ink/90 leading-relaxed">
                  {service.whoNeedsItBn}
                </p>
              </div>

              <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-3">
                <h2 className="text-xl font-bold text-ps-navy">
                  আমাদের সহায়তার পরিধি
                </h2>
                <p className="text-sm sm:text-base text-ps-ink/90 leading-relaxed">
                  {service.assistanceScopeBn}
                </p>
              </div>

              <AuthorityNote
                authorityName={service.authorityName}
                officialSourceLabel={service.officialSourceLabel}
                officialSourceUrl={service.officialSourceUrl}
                limitationsBn={service.limitationsBn}
              />

              <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-ps-navy inline-flex items-center gap-2">
                    <FileText className="w-5 h-5 text-ps-navy" aria-hidden="true" />
                    <span>প্রাথমিক প্রয়োজনীয় নথিপত্র (পেশাদার পর্যালোচনা সাপেক্ষ)</span>
                  </h2>
                  <p className="text-xs text-ps-muted">
                    ব্যবসার ধরন ও সর্বশেষ সরকারি নির্দেশনা অনুযায়ী নথির তালিকা পরিবর্তিত হতে পারে।
                  </p>
                </div>
                <ul className="space-y-2.5">
                  {service.documentsSummary.map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-ps-ink/90">
                      <CheckCircle2
                        className="w-4 h-4 text-ps-navy shrink-0 mt-1"
                        aria-hidden="true"
                      />
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {service.processSteps.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-ps-navy">কার্যপ্রক্রিয়া</h2>
                  <ProcessSteps
                    steps={service.processSteps}
                    columns={service.processSteps.length <= 3 ? 3 : 4}
                  />
                </div>
              ) : null}
            </div>

            <aside className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              <div className="rounded-[16px] border-2 border-ps-navy/15 bg-ps-white p-6 space-y-5 shadow-sm">
                <h2 className="text-lg font-bold text-ps-navy">
                  এই সেবাটি সম্পর্কে পরামর্শ নিন
                </h2>
                <p className="text-xs sm:text-sm text-ps-muted leading-relaxed">
                  আপনার ব্যবসার অবস্থা ও প্রয়োজন সংক্ষেপে পাঠালে আমাদের টিম যোগাযোগ করবে।
                </p>

                {(service.serviceFeeNoteBn || service.govtFeeNoteBn) ? (
                  <div className="space-y-2 rounded-[12px] bg-ps-cool p-4 text-xs">
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

                <Link href={enquiryHref} className="ps-primary-button w-full">
                  <span>সেবার অনুরোধ করুন</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
