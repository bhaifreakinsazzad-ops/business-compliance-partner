import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getPublicSiteConfig } from "@/lib/config/site";
import {
  buildWhatsAppGeneralMessage,
  buildWhatsAppUrl,
} from "@/lib/contact/whatsapp";
import { AppHeader } from "@/components/layout/AppHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Footer } from "@/components/layout/Footer";
import { ConsultancyForm } from "@/components/forms/ConsultancyForm";

export const metadata: Metadata = {
  title: "যোগাযোগ",
  description:
    "Business Compliance Partner-এর সাথে যোগাযোগ করুন অথবা সরাসরি আপনার প্রয়োজন লিখে পাঠান।",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const siteConfig = await getPublicSiteConfig();
  const whatsappHref = buildWhatsAppUrl(
    siteConfig.verifiedWhatsapp,
    buildWhatsAppGeneralMessage(),
  );

  const hasVerifiedContacts = Boolean(
    siteConfig.verifiedPhone ||
      whatsappHref ||
      siteConfig.verifiedEmail ||
      siteConfig.verifiedAddressBn,
  );

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <section className="bg-ps-midnight text-ps-white py-12 sm:py-14 border-b border-ps-gold/30">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              dark
              items={[{ labelBn: "হোম", href: "/" }, { labelBn: "যোগাযোগ" }]}
            />
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl sm:text-4xl font-bold leading-snug">
                যোগাযোগ ও অনুসন্ধান
              </h1>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                আপনার যেকোনো প্রশ্ন বা প্রয়োজনের জন্য নিচের ফর্ম ব্যবহার করুন—আমাদের টিম
                পর্যালোচনা করে যোগাযোগ করবে।
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-4">
                <h2 className="text-xl font-bold text-ps-navy">
                  যাচাইকৃত যোগাযোগ তথ্য
                </h2>

                {hasVerifiedContacts ? (
                  <ul className="space-y-3 text-sm text-ps-ink">
                    {siteConfig.verifiedPhone ? (
                      <li className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-ps-navy shrink-0" aria-hidden="true" />
                        <a
                          href={`tel:${siteConfig.verifiedPhone.replace(/\s+/g, "")}`}
                          className="font-medium hover:underline"
                          dir="ltr"
                        >
                          {siteConfig.verifiedPhone}
                        </a>
                      </li>
                    ) : null}
                    {whatsappHref ? (
                      <li className="flex items-center gap-3">
                        <MessageCircle className="w-4 h-4 text-ps-navy shrink-0" aria-hidden="true" />
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium hover:underline"
                        >
                          WhatsApp-এ বার্তা পাঠান
                        </a>
                      </li>
                    ) : null}
                    {siteConfig.verifiedEmail ? (
                      <li className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-ps-navy shrink-0" aria-hidden="true" />
                        <a
                          href={`mailto:${siteConfig.verifiedEmail}`}
                          className="font-medium hover:underline"
                          dir="ltr"
                        >
                          {siteConfig.verifiedEmail}
                        </a>
                      </li>
                    ) : null}
                    {siteConfig.verifiedAddressBn ? (
                      <li className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-ps-navy shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{siteConfig.verifiedAddressBn}</span>
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <div className="rounded-[12px] bg-ps-cool border border-ps-border p-4 space-y-2 text-sm text-ps-ink/85">
                    <p>
                      সরাসরি অফিস ঠিকানা, ফোন নম্বর ও হোয়াটসঅ্যাপ চ্যানেল চূড়ান্ত
                      ক্লায়েন্ট অনুমোদনের পর এখানে প্রকাশিত হবে।
                    </p>
                    <p className="text-xs text-ps-muted">
                      বর্তমানে ডানপাশের অনলাইন অনুরোধ ফর্মের মাধ্যমে সকল অনুসন্ধান গ্রহণ করা
                      হচ্ছে।
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-ps-border text-xs text-ps-muted">
                  <Link href="/faq" className="font-semibold text-ps-navy underline underline-offset-4">
                    সচরাচর জিজ্ঞাসা দেখুন →
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ConsultancyForm
                defaultPillar="CONSULTANCY"
                sourcePage="/contact"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
