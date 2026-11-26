import Image from "next/image";
import Link from "next/link";
import { LogIn, MessageCircle, ShieldCheck } from "lucide-react";
import type { PublicSiteConfig } from "@/types/domain";
import {
  buildWhatsAppGeneralMessage,
  buildWhatsAppUrl,
  formatWhatsAppDisplay,
} from "@/lib/contact/whatsapp";
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
  { href: "/books", labelBn: "আমাদের বইসমূহ" },
  { href: "/about", labelBn: "আমাদের সম্পর্কে" },
  { href: "/contact", labelBn: "যোগাযোগ" },
];

const SECONDARY_NAV_LINKS: NavLinkItem[] = [
  { href: "/licensing", labelBn: "লাইসেন্সিং" },
  { href: "/consultancy", labelBn: "কনসালটেন্সি" },
  { href: "/tools", labelBn: "বিজনেস টুলস" },
  { href: "/faq", labelBn: "সচরাচর জিজ্ঞাসা" },
  { href: "/portal", labelBn: "কাস্টমার পোর্টাল" },
];

interface AppHeaderProps {
  siteConfig: PublicSiteConfig;
}

export function AppHeader({ siteConfig }: AppHeaderProps) {
  const whatsappHref = buildWhatsAppUrl(
    siteConfig.verifiedWhatsapp,
    buildWhatsAppGeneralMessage(),
  );
  const whatsappDisplay = formatWhatsAppDisplay(siteConfig.verifiedWhatsapp);

  return (
    <>
      {/* Slim Corporate Announcement & Verified Contact Bar */}
      <div className="bg-[#081838] text-white border-b border-[#C59028]/30 text-xs">
        <div className="ps-container py-1.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/85">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck
                className="w-3.5 h-3.5 text-[#DFB15B] shrink-0"
                aria-hidden="true"
              />
              <span className="hidden sm:inline">
                বাংলাদেশে স্বাধীন ব্যবসায়িক শিক্ষা, কমপ্লায়েন্স ও প্রকাশনা প্ল্যাটফর্ম
              </span>
              <span className="sm:hidden">BCP · বাংলাদেশ</span>
            </span>
            {whatsappHref && whatsappDisplay ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-whatsapp-cta="true"
                className="inline-flex items-center gap-1.5 font-semibold text-[#5de2a5] hover:text-[#DFB15B] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>WhatsApp:</span>
                <span className="font-en" dir="ltr">
                  {whatsappDisplay}
                </span>
              </a>
            ) : null}
          </div>

          <div className="hidden md:flex items-center gap-4 text-white/80">
            <Link
              href="/licensing"
              className="hover:text-[#DFB15B] transition-colors whitespace-nowrap"
            >
              লাইসেন্সিং
            </Link>
            <Link
              href="/tools"
              className="hover:text-[#DFB15B] transition-colors whitespace-nowrap"
            >
              বিজনেস টুলস
            </Link>
            <Link
              href="/portal"
              className="hover:text-[#DFB15B] transition-colors whitespace-nowrap"
            >
              কাস্টমার পোর্টাল
            </Link>
          </div>
        </div>
      </div>

      {/* Main Executive Lavender Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/96 backdrop-blur-md border-b border-[#D4CCE3] shadow-[0_2px_14px_rgba(81,64,111,0.06)]">
        <div className="ps-container py-2.5 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 rounded-lg min-w-0 shrink-0"
          >
            {siteConfig.logoAssetPath ? (
              <Image
                src={siteConfig.logoAssetPath}
                alt={`${siteConfig.brandName} official brand mark`}
                width={44}
                height={44}
                priority
                className="rounded-full border border-[#C59028]/55 object-contain shrink-0 bg-white"
              />
            ) : null}
            <div className="min-w-0">
              <span
                className="block font-editorial text-base sm:text-lg font-bold tracking-wide text-[#081838] leading-tight truncate"
                lang="en"
              >
                {siteConfig.brandDisplayName}
              </span>
              <span className="block text-[11px] sm:text-xs text-[#51406F] font-medium truncate">
                {siteConfig.brandNameBn}
              </span>
            </div>
          </Link>

          <nav
            aria-label="প্রধান নেভিগেশন"
            className="hidden lg:flex items-center gap-4 xl:gap-5"
          >
            <NavLinksClient links={PRIMARY_NAV_LINKS} />
          </nav>

          <div className="hidden lg:flex items-center gap-2.5 shrink-0">
            <QuickSearchDialog variant="desktop" />

            <Link
              href="/portal"
              className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-[10px] border border-[#D4CCE3] bg-[#F2EFF8] text-xs font-semibold text-[#51406F] hover:bg-[#DDD6EB] transition-colors whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
              <span>পোর্টাল</span>
            </Link>

            <Link
              href="/consultancy"
              className="inline-flex items-center justify-center h-10 px-4 rounded-[10px] bg-[#51406F] hover:bg-[#3F315A] text-white text-xs xl:text-sm font-semibold whitespace-nowrap shadow-xs transition-colors"
            >
              পরামর্শ নিন
            </Link>
          </div>

          <MobileNavigation
            brandDisplayName={siteConfig.brandDisplayName}
            brandNameBn={siteConfig.brandNameBn}
            links={PRIMARY_NAV_LINKS}
            secondaryLinks={SECONDARY_NAV_LINKS}
            ctaHref="/consultancy"
            ctaLabelBn="পরামর্শের অনুরোধ"
            whatsappHref={whatsappHref}
            whatsappDisplay={whatsappDisplay}
          />
        </div>
      </header>
    </>
  );
}
