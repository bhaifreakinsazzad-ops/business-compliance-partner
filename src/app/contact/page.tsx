import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  HelpCircle,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
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

  return (
    <>
      <AppHeader siteConfig={siteConfig} />

      <main id="main-content" tabIndex={-1} className="flex-1 bg-white">
        {/* Centered Reference-Style Contact Header */}
        <section className="bcp-periwinkle-contact-header text-[#081838] py-10 sm:py-14 border-b border-[#E1E4F2]">
          <div className="ps-container space-y-5">
            <div className="flex justify-center">
              <Breadcrumbs
                items={[{ labelBn: "হোম", href: "/" }, { labelBn: "যোগাযোগ" }]}
              />
            </div>
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold leading-snug text-[#202D72]">
                আমাদের সাথে যোগাযোগ করুন
              </h1>
              <p className="text-sm sm:text-base text-[#596775] leading-relaxed">
                আপনার যেকোনো প্রশ্ন, কোর্স সংক্রান্ত তথ্য, পেশাদার সেবা বা প্রকাশনার
                অনুসন্ধানের জন্য আমাদের টিমের সাথে যোগাযোগ করতে পারেন।
              </p>
            </div>
          </div>
        </section>

        {/* Reference Two-Column Split: Left Contact Info + #202D72 Quick Connect Card, Right Elevated White Form */}
        <section className="py-10 sm:py-16">
          <div className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start max-w-6xl mx-auto">
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#202D72]">
                যোগাযোগের তথ্য
              </h2>

              <div className="space-y-4">
                {whatsappHref ? (
                  <div className="flex items-start gap-3.5 rounded-[14px] border border-[#E1E4F2] bg-[#FBFAFF] p-4">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] bg-[#00865A] text-white shrink-0 shadow-xs">
                      <MessageCircle className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-bold text-[#202D72]">
                        অফিশিয়াল WhatsApp সহায়তা
                      </p>
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-whatsapp-cta="true"
                        className="inline-block font-en text-sm font-bold text-[#00865A] hover:underline"
                        dir="ltr"
                      >
                        {whatsappDisplay}
                      </a>
                      <p className="text-xs text-[#596775]">
                        সরাসরি বার্তা পাঠাতে নম্বরটিতে ক্লিক করুন।
                      </p>
                    </div>
                  </div>
                ) : null}

                {siteConfig.verifiedPhone ? (
                  <div className="flex items-start gap-3.5 rounded-[14px] border border-[#E1E4F2] bg-white p-4">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] bg-[#E2E3FF] text-[#243FBA] shrink-0">
                      <Phone className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-bold text-[#202D72]">ফোন নম্বর</p>
                      <a
                        href={`tel:${siteConfig.verifiedPhone.replace(/\s+/g, "")}`}
                        className="text-sm font-medium text-[#181D26] hover:underline"
                        dir="ltr"
                      >
                        {siteConfig.verifiedPhone}
                      </a>
                    </div>
                  </div>
                ) : null}

                {siteConfig.verifiedEmail ? (
                  <div className="flex items-start gap-3.5 rounded-[14px] border border-[#E1E4F2] bg-white p-4">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] bg-[#E2E3FF] text-[#243FBA] shrink-0">
                      <Mail className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-bold text-[#202D72]">ইমেইল</p>
                      <a
                        href={`mailto:${siteConfig.verifiedEmail}`}
                        className="text-sm font-medium text-[#181D26] hover:underline break-all"
                        dir="ltr"
                      >
                        {siteConfig.verifiedEmail}
                      </a>
                    </div>
                  </div>
                ) : null}

                {siteConfig.verifiedAddressBn ? (
                  <div className="flex items-start gap-3.5 rounded-[14px] border border-[#E1E4F2] bg-white p-4">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] bg-[#E2E3FF] text-[#243FBA] shrink-0">
                      <MapPin className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-sm font-bold text-[#202D72]">অফিস ঠিকানা</p>
                      <p className="text-sm text-[#181D26]">
                        {siteConfig.verifiedAddressBn}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3.5 rounded-[14px] border border-[#E1E4F2] bg-white p-4">
                    <span className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] bg-[#E2E3FF] text-[#243FBA] shrink-0">
                      <MapPin className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-bold text-[#202D72]">
                        অফিস ঠিকানা ও অতিরিক্ত চ্যানেল
                      </p>
                      <p className="text-xs text-[#596775] leading-relaxed">
                        অফিস ঠিকানা, ল্যান্ডফোন ও ইমেইল চূড়ান্ত ক্লায়েন্ট অনুমোদনের পর
                        এখানে প্রকাশিত হবে। বর্তমানে অফিশিয়াল WhatsApp এবং ডানপাশের
                        অনলাইন ফর্মে সকল অনুসন্ধান গ্রহণ করা হচ্ছে।
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reference-Faithful #202D72 Quick Connect Card */}
              <div className="rounded-[18px] bg-[#202D72] text-white p-6 space-y-4 shadow-md">
                <div className="space-y-1">
                  <p className="text-base font-bold text-white">
                    সরাসরি ও দ্রুত যুক্ত থাকুন
                  </p>
                  <p className="text-xs text-[#CCCEFF]">
                    প্রধান গেটওয়ে ও অফিশিয়াল চ্যানেলসমূহ
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="WhatsApp-এ বার্তা পাঠান"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-white/12 text-white hover:bg-[#00865A] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    </a>
                  ) : null}
                  <Link
                    href="/courses"
                    aria-label="আমাদের সকল কোর্সসমূহ"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-white/12 text-white hover:bg-[#243FBA] transition-colors"
                  >
                    <GraduationCap className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/services"
                    aria-label="আমাদের সকল সেবাসমূহ"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-white/12 text-white hover:bg-[#243FBA] transition-colors"
                  >
                    <BriefcaseBusiness className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/books"
                    aria-label="আমাদের সকল বইসমূহ"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-white/12 text-white hover:bg-[#243FBA] transition-colors"
                  >
                    <BookOpen className="w-4 h-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/faq"
                    aria-label="সচরাচর জিজ্ঞাসা"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-white/12 text-white hover:bg-[#243FBA] transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" aria-hidden="true" />
                  </Link>
                </div>

                <div className="pt-2 border-t border-white/15 text-xs">
                  <Link
                    href="/faq"
                    className="font-semibold text-[#DFB15B] hover:text-white underline underline-offset-4"
                  >
                    সচরাচর জিজ্ঞাসা দেখুন →
                  </Link>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-[20px] border border-[#E1E4F2] bg-white p-1 shadow-[0_18px_48px_rgba(32,45,114,0.08)]">
                <ConsultancyForm
                  defaultPillar="CONSULTANCY"
                  sourcePage="/contact"
                  verifiedWhatsapp={siteConfig.verifiedWhatsapp}
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer siteConfig={siteConfig} />
    </>
  );
}
