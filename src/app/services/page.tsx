import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseBusiness } from "lucide-react";
import { getPublicSiteConfig } from "@/lib/config/site";
import { listPublishedServices } from "@/lib/services/catalogue";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { ServiceCard } from "@/components/shared/ServiceCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SearchBox } from "@/components/shared/SearchBox";
import { CTASection } from "@/components/shared/CTASection";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "পেশাদার ব্যবসায়িক সেবা ক্যাটালগ",
  description:
    "Tax, VAT, e-GP, Smart RJSC, কাস্টমস, অ্যাকাউন্টিং এবং HR কমপ্লায়েন্স বিষয়ক পেশাদার ব্যবসায়িক সহায়তা ক্যাটালগ।",
  alternates: { canonical: "/services" },
};

interface ServicesPageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const { category = "", q = "" } = await searchParams;
  const [siteConfig, { categories, items }] = await Promise.all([
    getPublicSiteConfig(),
    listPublishedServices({
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
              items={[{ labelBn: "হোম", href: "/" }, { labelBn: "পেশাদার সেবা" }]}
            />
            <div className="max-w-3xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-ps-gold/40 bg-ps-navy px-3 py-1 text-xs font-medium text-ps-ivory">
                <BriefcaseBusiness className="w-3.5 h-3.5 text-ps-gold" aria-hidden="true" />
                <span lang="en">Priority 01 • Professional Business Services</span>
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold leading-snug">
                পেশাদার ব্যবসায়িক ও কমপ্লায়েন্স সেবাসমূহ
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                ট্যাক্স, ভ্যাট, e-GP, কোম্পানি সেক্রেটারিয়াল, আমদানি-রপ্তানি এবং
                অ্যাকাউন্টিং বিষয়ে সুসংগঠিত ডকুমেন্টেশন ও সহায়তা সেবা।
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="ps-container space-y-8">
            <div className="rounded-[16px] bg-ps-white border border-ps-border p-5 sm:p-6 space-y-5 shadow-sm">
              <SearchBox
                action="/services"
                defaultValue={q}
                categoryHiddenValue={category || undefined}
                labelBn="পেশাদার সেবা খুঁজুন"
                placeholderBn="সেবার নাম বা বিষয় লিখুন (যেমন: e-TIN, BIN, RJSC, e-GP, Bookkeeping)..."
              />

              <div className="flex flex-wrap gap-2" role="navigation" aria-label="সেবা ক্যাটাগরি">
                <Link
                  href={q ? `/services?q=${encodeURIComponent(q)}` : "/services"}
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
                    ? `/services?category=${encodeURIComponent(cat.slug)}&q=${encodeURIComponent(q)}`
                    : `/services?category=${encodeURIComponent(cat.slug)}`;
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((svc) => (
                  <ServiceCard key={svc.slug} service={svc} />
                ))}
              </div>
            ) : (
              <EmptyState
                titleBn="এই বিভাগে প্রকাশিত কোনো সেবা পাওয়া যায়নি"
                descriptionBn="অন্যান্য বিভাগ দেখুন অথবা সরাসরি আপনার ব্যবসার প্রয়োজন লিখে আমাদের টিমের কাছে পাঠান।"
                resetHref="/services"
                resetLabelBn="সব সেবা দেখুন"
              />
            )}
          </div>
        </section>

        <CTASection
          titleBn="আপনার ব্যবসার প্রয়োজনীয় সেবাটি তালিকায় খুঁজে পাচ্ছেন না?"
          descriptionBn="সংক্ষেপে আপনার সমস্যাটি লিখে পাঠালে আমাদের টিম পর্যালোচনা করে উপযুক্ত সময়ে যোগাযোগ করবে।"
          primaryHref="/consultancy?pillar=SERVICES"
          primaryLabelBn="পরামর্শের অনুরোধ করুন"
        />
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
