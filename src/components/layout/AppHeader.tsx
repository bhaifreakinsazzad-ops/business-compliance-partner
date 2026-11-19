import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, Search, ShieldCheck } from "lucide-react";
import type { PublicSiteConfig } from "@/types/domain";
import {
  MobileNavigation,
  type NavLinkItem,
} from "@/components/layout/MobileNavigation";

const PRIMARY_NAV_LINKS: NavLinkItem[] = [
  { href: "/", labelBn: "হোম" },
  { href: "/courses", labelBn: "কোর্স" },
  { href: "/services", labelBn: "পেশাদার সেবা" },
  { href: "/licensing", labelBn: "লাইসেন্সিং" },
  { href: "/consultancy", labelBn: "কনসালটেন্সি" },
  { href: "/about", labelBn: "আমাদের সম্পর্কে" },
];

interface AppHeaderProps {
  siteConfig: PublicSiteConfig;
}

export function AppHeader({ siteConfig }: AppHeaderProps) {
  return (
    <>
      {/* Subtle Utility / Trust Bar — strictly verified contacts or governance status */}
      <div className="bg-ps-midnight text-ps-cool border-b border-white/10 text-xs sm:text-sm">
        <div className="ps-container py-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-white/85">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-ps-gold shrink-0" aria-hidden="true" />
              <span>বাংলাদেশে স্বাধীন ব্যবসায়িক শিক্ষা ও কমপ্লায়েন্স সহায়তা</span>
            </span>
            {siteConfig.verifiedPhone ? (
              <a
                href={`tel:${siteConfig.verifiedPhone.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-1.5 hover:text-ps-gold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-ps-gold" aria-hidden="true" />
                <span dir="ltr">{siteConfig.verifiedPhone}</span>
              </a>
            ) : null}
            {siteConfig.verifiedEmail ? (
              <a
                href={`mailto:${siteConfig.verifiedEmail}`}
                className="hidden sm:inline-flex items-center gap-1.5 hover:text-ps-gold transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-ps-gold" aria-hidden="true" />
                <span dir="ltr">{siteConfig.verifiedEmail}</span>
              </a>
            ) : null}
          </div>

          {siteConfig.stagingNoticeBn ? (
            <span className="inline-flex items-center rounded-full border border-ps-gold/50 bg-ps-navy px-2.5 py-0.5 text-[11px] font-medium text-ps-ivory">
              প্রস্তাবিত ব্র্যান্ড ও স্টেজিং প্রিভিউ
            </span>
          ) : null}
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-ps-white/95 backdrop-blur border-b border-ps-border shadow-[0_1px_12px_rgba(11,23,38,0.04)]">
        <div className="ps-container py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg min-w-0 shrink-0"
          >
            <Image
              src={siteConfig.logoAssetPath}
              alt={`${siteConfig.brandName} প্রস্তাবিত লোগো কনসেপ্ট`}
              width={44}
              height={44}
              priority
              className="rounded-[10px] border border-ps-border object-cover shrink-0"
            />
            <div className="min-w-0">
              <span
                className="block font-editorial text-lg sm:text-xl font-semibold tracking-wide text-ps-navy leading-tight truncate"
                lang="en"
              >
                {siteConfig.brandDisplayName}
              </span>
              <span className="block text-xs text-ps-muted truncate">
                {siteConfig.brandNameBn}
                {siteConfig.isIdentityProvisional ? " (প্রস্তাবিত)" : ""}
              </span>
            </div>
          </Link>

          <nav
            aria-label="প্রধান নেভিগেশন"
            className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-medium text-ps-navy"
          >
            {PRIMARY_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2 hover:text-ps-midnight hover:underline underline-offset-4 decoration-ps-gold decoration-2 transition-colors whitespace-nowrap"
              >
                {link.labelBn}
              </Link>
            ))}

            <Link
              href="/#unified-search"
              aria-label="ক্যাটালগ অনুসন্ধান"
              className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] border border-ps-border text-ps-navy hover:bg-ps-cool transition-colors"
            >
              <Search className="w-4 h-4" aria-hidden="true" />
            </Link>

            <Link
              href="/consultancy"
              className="ps-primary-button text-sm px-5 py-2.5 whitespace-nowrap"
            >
              পরামর্শের অনুরোধ
            </Link>
          </nav>

          <MobileNavigation
            brandDisplayName={siteConfig.brandDisplayName}
            brandNameBn={siteConfig.brandNameBn}
            links={PRIMARY_NAV_LINKS}
            ctaHref="/consultancy"
            ctaLabelBn="পরামর্শের অনুরোধ"
          />
        </div>
      </header>
    </>
  );
}
