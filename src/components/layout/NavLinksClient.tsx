"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  Compass,
  FileCheck2,
  GraduationCap,
  HelpCircle,
  MessageSquareText,
} from "lucide-react";
import {
  MASTER_THREE_PILLARS,
  type MasterPillarId,
} from "@/lib/config/pillars";
import { PANEL_VARIANTS } from "@/lib/motion/presets";
import { cn } from "@/lib/utils";
import type { NavLinkItem } from "@/components/layout/MobileNavigation";

type MegaMenuKey = MasterPillarId | "resources";

interface MegaItem {
  href: string;
  titleBn: string;
  subtitleEn: string;
}

const MEGA_MENU_DATA: Record<
  MegaMenuKey,
  {
    href: string;
    labelEn: string;
    labelBn: string;
    headingBn: string;
    intentBn: string;
    viewAllLabelBn: string;
    items: MegaItem[];
  }
> = {
  courses: {
    href: "/courses",
    labelEn: "Courses",
    labelBn: "কোর্সসমূহ",
    headingBn: "Courses · ব্যবহারিক প্রশিক্ষণ ও কোর্স বিভাগ",
    intentBn: "পেশাদার দক্ষতা অর্জন করুন এবং নিজেকে প্রস্তুত করুন",
    viewAllLabelBn: "Explore Courses · সব ১০টি বিভাগ",
    items: [
      {
        href: "/courses?category=income-tax",
        titleBn: "আয়কর ও ট্যাক্স কোর্স",
        subtitleEn: "Income Tax & Return",
      },
      {
        href: "/courses?category=vat-and-mushak",
        titleBn: "ভ্যাট ও মূসক প্রশিক্ষণ",
        subtitleEn: "VAT & Mushak 9.1",
      },
      {
        href: "/courses?category=egp-and-tender",
        titleBn: "e-GP ও সরকারি টেন্ডার",
        subtitleEn: "BPPA Procurement",
      },
      {
        href: "/courses?category=digital-business-ecommerce",
        titleBn: "ই-কমার্স ও ডিজিটাল ব্যবসা",
        subtitleEn: "DBID & Online Business",
      },
      {
        href: "/courses?category=company-secretarial",
        titleBn: "RJSC ও কোম্পানি সেক্রেটারিয়াল",
        subtitleEn: "Corporate Secretarial",
      },
      {
        href: "/courses?category=accounting",
        titleBn: "অ্যাকাউন্টিং ও ফিন্যান্স",
        subtitleEn: "SME Accounting",
      },
    ],
  },
  services: {
    href: "/services",
    labelEn: "Services",
    labelBn: "সেবাসমূহ",
    headingBn: "Services · পেশাদার কমপ্লায়েন্স ও ব্যবসায়িক সেবা",
    intentBn: "ব্যবসার প্রয়োজনীয় পেশাদার সহায়তা, লাইসেন্সিং ও পরামর্শ নিন",
    viewAllLabelBn: "Explore Services · সব ১১টি বিভাগ",
    items: [
      {
        href: "/services?category=income-tax-solutions",
        titleBn: "আয়কর ও e-TIN সহায়তা",
        subtitleEn: "Income Tax Compliance",
      },
      {
        href: "/services?category=vat-mushak-solutions",
        titleBn: "ভ্যাট, BIN ও মূসক রিটার্ন",
        subtitleEn: "NBR VAT Services",
      },
      {
        href: "/services?category=company-secretarial-compliance",
        titleBn: "Smart RJSC ও কোম্পানি গঠন",
        subtitleEn: "Company Formation",
      },
      {
        href: "/services?category=egp-government-tender",
        titleBn: "e-GP নিবন্ধন ও দরপত্র সহায়তা",
        subtitleEn: "e-GP Procurement",
      },
      {
        href: "/licensing",
        titleBn: "ব্যবসায়িক লাইসেন্সিং ও নিবন্ধন",
        subtitleEn: "Trade · DIFE · Fire · IRC",
      },
      {
        href: "/consultancy",
        titleBn: "বিশেষজ্ঞ কনসালটেন্সি ও পরামর্শ",
        subtitleEn: "Direct Business Advisory",
      },
    ],
  },
  books: {
    href: "/books",
    labelEn: "Books",
    labelBn: "বইসমূহ",
    headingBn: "Books · প্র্যাকটিক্যাল কমপ্লায়েন্স প্রকাশনা ও হ্যান্ডবুক",
    intentBn: "প্রয়োজনীয় বই ও প্রকাশনার মাধ্যমে জ্ঞান সমৃদ্ধ করুন",
    viewAllLabelBn: "Explore Books · সকল বই প্রিভিউ",
    items: [
      {
        href: "/books?category=tax",
        titleBn: "আয়কর ও ট্যাক্স হ্যান্ডবুক",
        subtitleEn: "Income Tax Edition",
      },
      {
        href: "/books?category=vat-mushak",
        titleBn: "ভ্যাট ও মূসক ৯.১ গাইড",
        subtitleEn: "VAT & Mushak Guide",
      },
      {
        href: "/books?category=egp-tender",
        titleBn: "e-GP ও টেন্ডার ম্যানুয়াল",
        subtitleEn: "Procurement Manual",
      },
      {
        href: "/books?category=rjsc-corporate",
        titleBn: "RJSC ও কর্পোরেট আইন গাইড",
        subtitleEn: "Company Law Guide",
      },
      {
        href: "/books?category=ecommerce",
        titleBn: "ই-কমার্স ও DBID নির্দেশিকা",
        subtitleEn: "Digital Business",
      },
      {
        href: "/books?category=accounting",
        titleBn: "অ্যাকাউন্টিং ও অডিট প্রস্তুতি",
        subtitleEn: "Accounting & Audit",
      },
    ],
  },
  resources: {
    href: "/tools",
    labelEn: "Resources",
    labelBn: "রিসোর্স",
    headingBn: "সহায়ক টুলস, লাইসেন্সিং ও পরামর্শ রিসোর্স",
    intentBn: "প্রস্তুতি চেকলিস্ট, রোডম্যাপ ও সচরাচর জিজ্ঞাসা",
    viewAllLabelBn: "সব রিসোর্স ও টুলস দেখুন",
    items: [
      {
        href: "/tools",
        titleBn: "প্রস্তুতি ও চেকলিস্ট টুলস",
        subtitleEn: "Readiness & Roadmap",
      },
      {
        href: "/licensing",
        titleBn: "লাইসেন্সিং ও নিবন্ধন নির্দেশিকা",
        subtitleEn: "Licensing Directory",
      },
      {
        href: "/consultancy",
        titleBn: "কনসালটেন্সি ও পরামর্শ অনুরোধ",
        subtitleEn: "Expert Advisory",
      },
      {
        href: "/faq",
        titleBn: "সচরাচর জিজ্ঞাসা (FAQ)",
        subtitleEn: "Regulatory & Process FAQ",
      },
    ],
  },
};

function getMenuIcon(key: MegaMenuKey) {
  switch (key) {
    case "courses":
      return GraduationCap;
    case "services":
      return BriefcaseBusiness;
    case "books":
      return BookOpen;
    case "resources":
      return Compass;
  }
}

interface NavLinksClientProps {
  links?: NavLinkItem[];
}

export function NavLinksClient({ links }: NavLinksClientProps) {
  void links;
  const pathname = usePathname() || "/";
  const [openMenu, setOpenMenu] = useState<MegaMenuKey | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const isRouteActive = (href: string) =>
    href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleOpen = (key: MegaMenuKey) => {
    clearCloseTimer();
    setOpenMenu(key);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpenMenu(null);
    }, 150);
  };

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
      }
    };
    const handlePointerDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      clearCloseTimer();
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const activeData = openMenu ? MEGA_MENU_DATA[openMenu] : null;
  const ActiveIcon = openMenu ? getMenuIcon(openMenu) : FileCheck2;

  return (
    <div
      ref={navRef}
      onMouseLeave={scheduleClose}
      className="relative flex items-center gap-2 xl:gap-3 text-[13px] font-semibold"
    >
      <Link
        href="/"
        aria-current={isRouteActive("/") ? "page" : undefined}
        className={cn(
          "py-2 px-1.5 whitespace-nowrap shrink-0 underline-offset-8 decoration-[#243FBA] decoration-2 transition-colors",
          isRouteActive("/")
            ? "text-[#243FBA] font-bold underline"
            : "text-[#081838] hover:text-[#243FBA] hover:underline",
        )}
      >
        হোম
      </Link>

      {/* Mandated Commercial Pillars in Exact Sequence: Courses -> Services -> Books */}
      {MASTER_THREE_PILLARS.map((pillar) => {
        const key = pillar.id;
        const isActive = isRouteActive(pillar.href);
        const isExpanded = openMenu === key;

        return (
          <div
            key={key}
            onMouseEnter={() => handleOpen(key)}
            className="relative inline-flex items-center shrink-0"
          >
            <Link
              href={pillar.href}
              data-nav-pillar={pillar.id}
              aria-current={isActive ? "page" : undefined}
              onClick={() => setOpenMenu(null)}
              className={cn(
                "inline-flex items-baseline gap-1 py-2 ps-1.5 pe-0.5 whitespace-nowrap shrink-0 underline-offset-8 decoration-[#243FBA] decoration-2 transition-colors",
                isActive || isExpanded
                  ? "text-[#243FBA] font-bold underline"
                  : "text-[#081838] hover:text-[#243FBA] hover:underline",
              )}
            >
              <span className="font-en font-bold tracking-tight" lang="en">
                {pillar.labelEn}
              </span>
              <span className="hidden xl:inline text-[11px] font-medium text-[#596775]">
                · {pillar.navLabelBn}
              </span>
            </Link>

            <button
              type="button"
              aria-expanded={isExpanded}
              aria-controls="bcp-desktop-mega-menu"
              aria-label={`${pillar.labelEn} (${pillar.navLabelBn}) সাব-মেনু`}
              onClick={() =>
                setOpenMenu((prev) => (prev === key ? null : key))
              }
              className={cn(
                "inline-flex items-center justify-center w-6 h-8 rounded-[6px] transition-colors cursor-pointer shrink-0",
                isExpanded
                  ? "text-[#243FBA] bg-[#E2E3FF]"
                  : "text-[#596775] hover:text-[#243FBA] hover:bg-[#FBFAFF]",
              )}
            >
              <ChevronDown
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-150",
                  isExpanded && "rotate-180 text-[#243FBA]",
                )}
                aria-hidden="true"
              />
            </button>
          </div>
        );
      })}

      <Link
        href="/about"
        aria-current={isRouteActive("/about") ? "page" : undefined}
        className={cn(
          "py-2 px-1.5 whitespace-nowrap shrink-0 underline-offset-8 decoration-[#243FBA] decoration-2 transition-colors hidden xl:inline-block",
          isRouteActive("/about")
            ? "text-[#243FBA] font-bold underline"
            : "text-[#081838] hover:text-[#243FBA] hover:underline",
        )}
      >
        আমাদের সম্পর্কে
      </Link>

      <Link
        href="/contact"
        aria-current={isRouteActive("/contact") ? "page" : undefined}
        className={cn(
          "py-2 px-1.5 whitespace-nowrap shrink-0 underline-offset-8 decoration-[#243FBA] decoration-2 transition-colors",
          isRouteActive("/contact")
            ? "text-[#243FBA] font-bold underline"
            : "text-[#081838] hover:text-[#243FBA] hover:underline",
        )}
      >
        যোগাযোগ
      </Link>

      {/* Keyboard & Pointer Accessible Mega Menu Panel */}
      <AnimatePresence>
        {activeData ? (
          <m.div
            key={openMenu}
            id="bcp-desktop-mega-menu"
            variants={PANEL_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseEnter={clearCloseTimer}
            className="absolute top-full start-1/2 -translate-x-1/2 pt-3 w-[min(90vw,680px)] z-[var(--z-dropdown)]"
          >
            <div className="rounded-[18px] border border-[#E1E4F2] bg-white shadow-[0_20px_48px_rgba(32,45,114,0.14)] overflow-hidden">
              <div className="px-6 py-4 bg-[#FBFAFF] border-b border-[#E1E4F2] flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#E2E3FF] text-[#243FBA]">
                    <ActiveIcon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#081838]">
                      {activeData.headingBn}
                    </p>
                    <p className="text-xs text-[#596775]">
                      {activeData.intentBn}
                    </p>
                  </div>
                </div>
                <Link
                  href={activeData.href}
                  onClick={() => setOpenMenu(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#243FBA] hover:text-[#1D329B] hover:underline underline-offset-4 whitespace-nowrap"
                >
                  <span>{activeData.viewAllLabelBn}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>

              <div className="p-4 grid grid-cols-2 gap-2.5">
                {activeData.items.map((sub) => (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    onClick={() => setOpenMenu(null)}
                    className="group flex items-center justify-between gap-3 rounded-[12px] border border-transparent bg-[#F5F6FA] hover:bg-[#E2E3FF]/75 hover:border-[#B8BBFF] px-4 py-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#081838] group-hover:text-[#243FBA] truncate">
                        {sub.titleBn}
                      </p>
                      <p className="font-en text-xs text-[#596775]" lang="en">
                        {sub.subtitleEn}
                      </p>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 text-[#243FBA] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>

              <div className="px-6 py-3 bg-[#F5F6FA] border-t border-[#E1E4F2] flex items-center justify-between text-xs text-[#596775]">
                <span className="inline-flex items-center gap-1.5">
                  <HelpCircle
                    className="w-3.5 h-3.5 text-[#243FBA]"
                    aria-hidden="true"
                  />
                  <span>
                    সঠিক সমাধান খুঁজে না পেলে পরামর্শ ফর্ম বা WhatsApp ব্যবহার করুন
                  </span>
                </span>
                <Link
                  href="/consultancy"
                  onClick={() => setOpenMenu(null)}
                  className="inline-flex items-center gap-1 font-bold text-[#243FBA] hover:underline"
                >
                  <MessageSquareText className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>পরামর্শ নিন</span>
                </Link>
              </div>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
