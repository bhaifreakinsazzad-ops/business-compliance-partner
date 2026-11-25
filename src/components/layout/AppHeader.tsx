import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, ShieldCheck } from "lucide-react";
import type { PublicSiteConfig } from "@/types/domain";
import {
  MobileNavigation,
  type NavLinkItem,
} from "@/components/layout/MobileNavigation";
import { NavLinksClient } from "@/components/layout/NavLinksClient";
import { QuickSearchDialog } from "@/components/layout/QuickSearchDialog";

const PRIMARY_NAV_LINKS: NavLinkItem[] = [
  { href: "/", labelBn: "হোম" },
  { href: "/courses", labelBn: "সকল কোর্স" },
  { href: "/services", labelBn: "সকল সেবা" },
  { href: "/about", labelBn: "আমাদের সম্পর্কে" },
  { href: "/contact", labelBn: "যোগাযোগ" },
];

const SECONDARY_NAV_LINKS: NavLinkItem[] = [
  { href: "/licensing", labelBn: "লাইসেন্সিং" },
  { href: "/consultancy", labelBn: "কনসালটেন্সি" },
  { href: "/tools", labelBn: "বিজনেস টুলস" },
  { href: "/portal", labelBn: "কাস্টমার পোর্টাল" },
];

interface AppHeaderProps {
  siteConfig: PublicSiteConfig;
}

export function AppHeader({ siteConfig }: AppHeaderProps) {
  return (
    <>
      {/* Utility Bar — Verified contacts + secondary ecosystem links */}
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

          <div className="flex items-center gap-4">
            <nav aria-label="সেকেন্ডারি নেভিগেশন" className="hidden lg:flex items-center gap-4 text-xs text-white/80">
              {SECONDARY_NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-ps-gold transition-colors whitespace-nowrap"
                >
                  {item.labelBn}
                </Link>
              ))}
            </nav>

            {siteConfig.stagingNoticeBn ? (
              <span className="inline-flex items-center rounded-full border border-ps-gold/50 bg-ps-navy px-2.5 py-0.5 text-[11px] font-medium text-ps-ivory">
                স্টেজিং প্রিভিউ
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-ps-white/95 backdrop-blur border-b border-ps-border shadow-[0_1px_12px_rgba(11,23,38,0.04)]">
        <div className="ps-container py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 rounded-lg min-w-0 flex-1 lg:flex-initial"
          >
            {siteConfig.logoAssetPath ? (
              <Image
                src={siteConfig.logoAssetPath}
                alt={`${siteConfig.brandName} official brand mark`}
                width={48}
                height={48}
                priority
                className="rounded-full border border-ps-gold/45 object-contain shrink-0"
              />
            ) : null}
            <div className="min-w-0">
              <span
                className="block font-editorial text-lg sm:text-xl font-semibold tracking-wide text-ps-navy leading-tight truncate"
                lang="en"
              >
                {siteConfig.brandDisplayName}
              </span>
              <span className="block text-xs text-ps-muted truncate">
                {siteConfig.brandNameBn}
              </span>
            </div>
          </Link>

          <nav
            aria-label="প্রধান নেভিগেশন"
            className="hidden lg:flex items-center gap-5 xl:gap-6 text-sm font-semibold text-ps-navy"
          >
            <NavLinksClient links={PRIMARY_NAV_LINKS} />

            <QuickSearchDialog variant="desktop" />

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
            secondaryLinks={SECONDARY_NAV_LINKS}
            ctaHref="/consultancy"
            ctaLabelBn="পরামর্শের অনুরোধ"
          />
        </div>
      </header>
    </>
  );
}
