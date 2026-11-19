import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import type { PublicSiteConfig } from "@/types/domain";

interface FooterProps {
  siteConfig: PublicSiteConfig;
}

export function Footer({ siteConfig }: FooterProps) {
  const hasAnyVerifiedContact = Boolean(
    siteConfig.verifiedPhone ||
      siteConfig.verifiedWhatsapp ||
      siteConfig.verifiedEmail ||
      siteConfig.verifiedAddressBn,
  );

  return (
    <footer className="bg-ps-midnight text-white/85 border-t border-ps-gold/30 pt-14 pb-10 text-sm">
      <div className="ps-container space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Brand Identity */}
          <div className="lg:col-span-4 space-y-3">
            <p
              className="font-editorial text-xl font-semibold tracking-wide text-ps-white"
              lang="en"
            >
              {siteConfig.brandDisplayName}
            </p>
            <p className="text-sm text-ps-gold font-medium">
              {siteConfig.taglineBn}
            </p>
            <p className="text-xs text-white/75 leading-relaxed">
              বাংলাদেশের উদ্যোক্তা, ব্যবসায়ী ও পেশাজীবীদের জন্য কোর্স, ব্যবসায়িক সেবা,
              লাইসেন্সিং নির্দেশিকা এবং কনসালটেন্সি সহায়তার একটি সুসংগঠিত প্ল্যাটফর্ম।
            </p>
            {siteConfig.isIdentityProvisional ? (
              <p className="text-[11px] text-white/60">
                নোট: ব্র্যান্ড নাম ও লোগো কনসেপ্ট ক্লায়েন্টের চূড়ান্ত অনুমোদনের অপেক্ষায় রয়েছে।
              </p>
            ) : null}
          </div>

          {/* Column 2: Four Pillars */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-sm font-bold text-ps-white tracking-wide">
              মূল স্তম্ভসমূহ
            </h2>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href="/courses" className="hover:text-ps-gold hover:underline underline-offset-4">
                  কোর্স ও প্রশিক্ষণ
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-ps-gold hover:underline underline-offset-4">
                  পেশাদার ব্যবসায়িক সেবা
                </Link>
              </li>
              <li>
                <Link href="/licensing" className="hover:text-ps-gold hover:underline underline-offset-4">
                  লাইসেন্সিং ও নিবন্ধন
                </Link>
              </li>
              <li>
                <Link href="/consultancy" className="hover:text-ps-gold hover:underline underline-offset-4">
                  কনসালটেন্সি ও পরামর্শ
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company & Legal */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-bold text-ps-white tracking-wide">
              তথ্য ও নীতিমালা
            </h2>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href="/about" className="hover:text-ps-gold hover:underline underline-offset-4">
                  আমাদের সম্পর্কে
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-ps-gold hover:underline underline-offset-4">
                  সচরাচর জিজ্ঞাসা (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-ps-gold hover:underline underline-offset-4">
                  যোগাযোগ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-ps-gold hover:underline underline-offset-4">
                  গোপনীয়তা নীতি
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-ps-gold hover:underline underline-offset-4">
                  শর্তাবলি
                </Link>
              </li>
              <li>
                <Link href="/disclaimer" className="hover:text-ps-gold hover:underline underline-offset-4">
                  আইনি ও রেগুলেটরি ডিসক্লেইমার
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Verified Contact Channels ONLY */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-sm font-bold text-ps-white tracking-wide">
              যোগাযোগের মাধ্যম
            </h2>
            {hasAnyVerifiedContact ? (
              <ul className="space-y-2.5 text-white/80 text-xs sm:text-sm">
                {siteConfig.verifiedPhone ? (
                  <li className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-ps-gold shrink-0" aria-hidden="true" />
                    <a
                      href={`tel:${siteConfig.verifiedPhone.replace(/\s+/g, "")}`}
                      className="hover:text-ps-gold"
                      dir="ltr"
                    >
                      {siteConfig.verifiedPhone}
                    </a>
                  </li>
                ) : null}
                {siteConfig.verifiedWhatsapp ? (
                  <li className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-ps-gold shrink-0" aria-hidden="true" />
                    <a
                      href={`https://wa.me/${siteConfig.verifiedWhatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-ps-gold"
                    >
                      WhatsApp সহায়তা
                    </a>
                  </li>
                ) : null}
                {siteConfig.verifiedEmail ? (
                  <li className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-ps-gold shrink-0" aria-hidden="true" />
                    <a
                      href={`mailto:${siteConfig.verifiedEmail}`}
                      className="hover:text-ps-gold"
                      dir="ltr"
                    >
                      {siteConfig.verifiedEmail}
                    </a>
                  </li>
                ) : null}
                {siteConfig.verifiedAddressBn ? (
                  <li className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-ps-gold shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{siteConfig.verifiedAddressBn}</span>
                  </li>
                ) : null}
              </ul>
            ) : (
              <div className="rounded-[12px] border border-white/15 bg-ps-navy/60 p-4 space-y-2.5">
                <p className="text-xs text-white/80 leading-relaxed">
                  চূড়ান্ত অফিস ফোন, ঠিকানা ও হোয়াটসঅ্যাপ নম্বর ক্লায়েন্ট অনুমোদনের পর
                  এখানে যুক্ত হবে।
                </p>
                <Link
                  href="/consultancy"
                  className="inline-flex items-center text-xs font-semibold text-ps-gold hover:underline underline-offset-4"
                >
                  সরাসরি পরামর্শের অনুরোধ পাঠান →
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="ps-gold-rule" aria-hidden="true" />

        <div className="space-y-2 text-xs text-white/75 leading-relaxed">
          <p className="font-medium text-white/90">{siteConfig.legalDisclaimerBn}</p>
          <p className="text-white/60">
            © {new Date().getUTCFullYear()} {siteConfig.brandName} (Working Identity).
            সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
}
