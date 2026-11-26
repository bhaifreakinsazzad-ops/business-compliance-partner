import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { getPublicSiteConfig } from "@/lib/config/site";
import {
  buildWhatsAppGeneralMessage,
  buildWhatsAppUrl,
  formatWhatsAppDisplay,
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
  const whatsappDisplay = formatWhatsAppDisplay(siteConfig.verifiedWhatsapp);

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
        <section className="bg-gradient-to-br from-[#F2EFF8] via-[#ECE7F5] to-[#E5DDF2] text-[#081838] py-10 sm:py-12 border-b border-[#D4CCE3]">
          <div className="ps-container space-y-5">
            <Breadcrumbs
              items={[{ labelBn: "হোম", href: "/" }, { labelBn: "যোগাযোগ" }]}
            />
            <div className="max-w-3xl space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-snug text-[#081838]">
                যোগাযোগ ও অনুসন্ধান
              </h1>
              <p className="text-sm sm:text-base text-[#181D26]/85 leading-relaxed">
                আপনার যেকোনো প্রশ্ন বা প্রয়োজনের জন্য নিচের ফর্ম ব্যবহার করুন—আমাদের টিম
                পর্যালোচনা করে যোগাযোগ করবে।
              </p>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-[16px] border border-[#D4CCE3] bg-white p-6 space-y-4">
                <h2 className="text-xl font-bold text-[#081838]">
                  যাচাইকৃত যোগাযোগ তথ্য
                </h2>

                {hasVerifiedContacts ? (
                  <ul className="space-y-3 text-sm text-[#181D26]">
                    {siteConfig.verifiedPhone ? (
                      <li className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-[#51406F] shrink-0" aria-hidden="true" />
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
                      <li className="space-y-3">
                        <div className="flex items-center gap-3">
                          <MessageCircle className="w-4 h-4 text-[#00865A] shrink-0" aria-hidden="true" />
                          <a
                            href={whatsappHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-whatsapp-cta="true"
                            className="font-semibold text-[#081838] hover:underline"
                          >
                            WhatsApp অ্যাডমিন সহায়তা
                            {whatsappDisplay ? (
                              <span className="ms-1.5 font-en text-[#00865A]" dir="ltr">
                                ({whatsappDisplay})
                              </span>
                            ) : null}
                          </a>
                        </div>
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-whatsapp-cta="true"
                          className="inline-flex w-full items-center justify-center gap-2 min-h-12 px-5 py-2.5 rounded-[12px] bg-gradient-to-r from-[#00865a] to-[#009c68] text-white text-sm font-bold shadow-[0_4px_14px_rgba(0,134,90,0.22)] hover:from-[#006d49] hover:to-[#00865a] hover:-translate-y-0.5 transition-[transform,box-shadow,background-color] duration-200"
                        >
                          <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>
                            WhatsApp-এ সরাসরি বার্তা পাঠান
                            {whatsappDisplay ? ` (${whatsappDisplay})` : ""}
                          </span>
                        </a>
                      </li>
                    ) : null}
                    {siteConfig.verifiedEmail ? (
                      <li className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-[#51406F] shrink-0" aria-hidden="true" />
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
                        <MapPin className="w-4 h-4 text-[#51406F] shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{siteConfig.verifiedAddressBn}</span>
                      </li>
                    ) : null}
                  </ul>
                ) : (
                  <div className="rounded-[12px] bg-[#F2EFF8] border border-[#D4CCE3] p-4 space-y-2 text-sm text-[#181D26]/85">
                    <p>
                      সরাসরি অফিস ঠিকানা, ফোন নম্বর ও হোয়াটসঅ্যাপ চ্যানেল চূড়ান্ত
                      ক্লায়েন্ট অনুমোদনের পর এখানে প্রকাশিত হবে।
                    </p>
                    <p className="text-xs text-[#596775]">
                      বর্তমানে ডানপাশের অনলাইন অনুরোধ ফর্মের মাধ্যমে সকল অনুসন্ধান গ্রহণ করা
                      হচ্ছে।
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-[#D4CCE3] text-xs text-[#596775]">
                  <Link href="/faq" className="font-semibold text-[#51406F] underline underline-offset-4">
                    সচরাচর জিজ্ঞাসা দেখুন →
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ConsultancyForm
                defaultPillar="CONSULTANCY"
                sourcePage="/contact"
                verifiedWhatsapp={siteConfig.verifiedWhatsapp}
              />
            </div>
          </div>
        </section>
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
