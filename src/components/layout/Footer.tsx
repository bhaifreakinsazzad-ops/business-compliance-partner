import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { MASTER_THREE_PILLARS } from "@/lib/config/pillars";
import {
  buildWhatsAppGeneralMessage,
  buildWhatsAppUrl,
  formatWhatsAppDisplay,
} from "@/lib/contact/whatsapp";
import { FloatingConversionDock } from "@/components/layout/FloatingConversionDock";
import type { PublicSiteConfig } from "@/types/domain";

interface FooterProps {
  siteConfig: PublicSiteConfig;
}

export function Footer({ siteConfig }: FooterProps) {
  const whatsappHref = buildWhatsAppUrl(
    siteConfig.verifiedWhatsapp,
    buildWhatsAppGeneralMessage(),
  );
  const whatsappDisplay = formatWhatsAppDisplay(siteConfig.verifiedWhatsapp);
  const hasAnyVerifiedContact = Boolean(
    siteConfig.verifiedPhone ||
      whatsappHref ||
      siteConfig.verifiedEmail ||
      siteConfig.verifiedAddressBn,
  );

  return (
    <>
      <footer className="bg-surface-navy text-white/85 border-t border-bcp-dusty/30 pt-14 pb-24 sm:pb-12 text-sm">
        <div className="ps-container space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Column 1: Brand Identity */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                {siteConfig.logoAssetPath ? (
                  <Image
                    src={siteConfig.logoAssetPath}
                    alt={`${siteConfig.brandName} official badge`}
                    width={52}
                    height={52}
                    className="rounded-full border border-[#C59028]/60 object-contain shrink-0 bg-white shadow-md"
                  />
                ) : null}
                <div>
                  <p
                    className="font-editorial text-lg font-semibold tracking-wide text-white"
                    lang="en"
                  >
                    {siteConfig.brandDisplayName}
                  </p>
                  <p className="text-xs text-[#DFB15B] font-medium">
                    {siteConfig.taglineBn}
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/75 leading-relaxed">
                বাংলাদেশের উদ্যোক্তা, ব্যবসায়ী ও পেশাজীবীদের জন্য{" "}
                <span className="font-en font-semibold text-white" lang="en">
                  Courses · Services · Books
                </span>{" "}
                ভিত্তিক সুসংগঠিত শিক্ষা, কমপ্লায়েন্স সেবা ও প্রকাশনা প্ল্যাটফর্ম।
              </p>
              {siteConfig.isIdentityProvisional ? (
                <p className="text-[11px] text-white/60">
                  নোট: ব্র্যান্ড নাম ও লোগো কনসেপ্ট ক্লায়েন্টের চূড়ান্ত অনুমোদনের অপেক্ষায়
                  রয়েছে।
                </p>
              ) : null}
            </div>

            {/* Column 2: Primary Commercial Pillars strictly ordered: Courses -> Services -> Books */}
            <div className="lg:col-span-3 space-y-3">
              <h2 className="text-sm font-bold text-white tracking-wide">
                মূল ৩টি বিভাগ ·{" "}
                <span className="font-en text-[#DFB15B]" lang="en">
                  Courses · Services · Books
                </span>
              </h2>
              <ul className="space-y-2.5 text-white/85">
                {MASTER_THREE_PILLARS.map((pillar) => (
                  <li key={pillar.id}>
                    <Link
                      href={pillar.href}
                      data-footer-pillar={pillar.id}
                      className="group block hover:text-surface-lavender-muted"
                    >
                      <span
                        className="font-en font-bold text-white group-hover:text-[#DFB15B] group-hover:underline underline-offset-4"
                        lang="en"
                      >
                        {pillar.orderLabel}. {pillar.labelEn}
                      </span>{" "}
                      <span className="text-xs text-white/75">
                        — {pillar.labelBn}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="pt-3 border-t border-white/10 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
                  সহায়ক সমাধান
                </p>
                <ul className="space-y-1 text-xs text-white/75">
                  <li>
                    <Link
                      href="/licensing"
                      className="inline-flex items-center min-h-6 py-0.5 hover:text-surface-lavender-muted hover:underline underline-offset-4"
                    >
                      লাইসেন্সিং ও নিবন্ধন (Services)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/consultancy"
                      className="inline-flex items-center min-h-6 py-0.5 hover:text-surface-lavender-muted hover:underline underline-offset-4"
                    >
                      বিশেষজ্ঞ কনসালটেন্সি (Services)
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/tools"
                      className="inline-flex items-center min-h-6 py-0.5 hover:text-surface-lavender-muted hover:underline underline-offset-4"
                    >
                      প্রস্তুতি ও রোডম্যাপ টুলস
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 3: Company & Legal */}
            <div className="lg:col-span-2 space-y-3">
              <h2 className="text-sm font-bold text-white tracking-wide">
                তথ্য ও নীতিমালা
              </h2>
              <ul className="space-y-2 text-white/80">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-[#CCCEFF] hover:underline underline-offset-4"
                  >
                    আমাদের সম্পর্কে
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-[#CCCEFF] hover:underline underline-offset-4"
                  >
                    সচরাচর জিজ্ঞাসা (FAQ)
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-[#CCCEFF] hover:underline underline-offset-4"
                  >
                    যোগাযোগ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal"
                    className="hover:text-[#CCCEFF] hover:underline underline-offset-4"
                  >
                    কাস্টমার পোর্টাল
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-[#CCCEFF] hover:underline underline-offset-4"
                  >
                    গোপনীয়তা নীতি
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-[#CCCEFF] hover:underline underline-offset-4"
                  >
                    শর্তাবলি
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="hover:text-[#CCCEFF] hover:underline underline-offset-4"
                  >
                    আইনি ও রেগুলেটরি ডিসক্লেইমার
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Verified Contact Channels ONLY */}
            <div className="lg:col-span-3 space-y-3">
              <h2 className="text-sm font-bold text-white tracking-wide">
                যোগাযোগের মাধ্যম
              </h2>
              {hasAnyVerifiedContact ? (
                <ul className="space-y-2.5 text-white/80 text-xs sm:text-sm">
                  {siteConfig.verifiedPhone ? (
                    <li className="flex items-center gap-2">
                      <Phone
                        className="w-4 h-4 text-[#DFB15B] shrink-0"
                        aria-hidden="true"
                      />
                      <a
                        href={`tel:${siteConfig.verifiedPhone.replace(/\s+/g, "")}`}
                        className="hover:text-[#CCCEFF]"
                        dir="ltr"
                      >
                        {siteConfig.verifiedPhone}
                      </a>
                    </li>
                  ) : null}
                  {whatsappHref ? (
                    <li className="flex items-start gap-2">
                      <MessageCircle
                        className="w-4 h-4 text-[#5de2a5] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-whatsapp-cta="true"
                        className="hover:text-[#CCCEFF] transition-colors"
                      >
                        <span className="block font-semibold text-white">
                          WhatsApp সহায়তা
                        </span>
                        {whatsappDisplay ? (
                          <span className="block font-en text-[#5de2a5]" dir="ltr">
                            {whatsappDisplay}
                          </span>
                        ) : null}
                      </a>
                    </li>
                  ) : null}
                  {siteConfig.verifiedEmail ? (
                    <li className="flex items-center gap-2">
                      <Mail
                        className="w-4 h-4 text-[#DFB15B] shrink-0"
                        aria-hidden="true"
                      />
                      <a
                        href={`mailto:${siteConfig.verifiedEmail}`}
                        className="hover:text-[#CCCEFF]"
                        dir="ltr"
                      >
                        {siteConfig.verifiedEmail}
                      </a>
                    </li>
                  ) : null}
                  {siteConfig.verifiedAddressBn ? (
                    <li className="flex items-start gap-2">
                      <MapPin
                        className="w-4 h-4 text-[#DFB15B] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{siteConfig.verifiedAddressBn}</span>
                    </li>
                  ) : null}
                </ul>
              ) : (
                <div className="rounded-[12px] border border-white/15 bg-[#102B55]/60 p-4 space-y-2.5">
                  <p className="text-xs text-white/80 leading-relaxed">
                    চূড়ান্ত অফিস ফোন, ঠিকানা ও হোয়াটসঅ্যাপ নম্বর ক্লায়েন্ট অনুমোদনের পর
                    এখানে যুক্ত হবে।
                  </p>
                  <Link
                    href="/consultancy"
                    className="inline-flex items-center text-xs font-semibold text-[#DFB15B] hover:underline underline-offset-4"
                  >
                    সরাসরি পরামর্শের অনুরোধ পাঠান →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="ps-gold-rule" aria-hidden="true" />

          <div className="space-y-2 text-xs text-white/75 leading-relaxed">
            <p className="font-medium text-white/90">
              {siteConfig.legalDisclaimerBn}
            </p>
            <p className="text-white/60">
              © {new Date().getUTCFullYear()} {siteConfig.brandName}.
              সর্বস্বত্ব সংরক্ষিত।
            </p>
          </div>
        </div>
      </footer>
      <FloatingConversionDock verifiedWhatsapp={siteConfig.verifiedWhatsapp} />
    </>
  );
}
