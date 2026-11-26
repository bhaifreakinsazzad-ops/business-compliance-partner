"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  BookText,
  BriefcaseBusiness,
  ChevronDown,
  Compass,
  FileCheck2,
  HelpCircle,
  MessageSquareText,
} from "lucide-react";
import { animatePanelReveal } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";
import type { NavLinkItem } from "@/components/layout/MobileNavigation";

type MegaMenuKey = "courses" | "services" | "books" | "resources";

interface MegaItem {
  href: string;
  titleBn: string;
  subtitleEn: string;
}

const MEGA_MENU_DATA: Record<
  MegaMenuKey,
  {
    href: string;
    labelBn: string;
    headingBn: string;
    viewAllLabelBn: string;
    items: MegaItem[];
  }
> = {
  courses: {
    href: "/courses",
    labelBn: "কোর্স",
    headingBn: "ব্যবহারিক প্রশিক্ষণ ও কোর্স বিভাগ",
    viewAllLabelBn: "সকল ১০টি কোর্স ক্যাটাগরি দেখুন",
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
    labelBn: "সেবা",
    headingBn: "পেশাদার কমপ্লায়েন্স ও ব্যবসায়িক সেবা",
    viewAllLabelBn: "সকল ১১টি সেবা বিভাগ দেখুন",
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
        href: "/services?category=customs-international-trade",
        titleBn: "কাস্টমস, IRC ও ERC সহায়তা",
        subtitleEn: "Import & Export",
      },
      {
        href: "/licensing",
        titleBn: "ব্যবসায়িক লাইসেন্সিং ও নিবন্ধন",
        subtitleEn: "Trade · DIFE · Fire",
      },
    ],
  },
  books: {
    href: "/books",
    labelBn: "বই",
    headingBn: "প্রস্তাবিত কমপ্লায়েন্স প্রকাশনা ও হ্যান্ডবুক",
    viewAllLabelBn: "বইয়ের পূর্ণাঙ্গ স্টোরফ্রন্ট দেখুন",
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
    labelBn: "রিসোর্স",
    headingBn: "ব্যবসায়িক টুলস, লাইসেন্সিং ও পরামর্শ",
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
      return BookOpen;
    case "services":
      return BriefcaseBusiness;
    case "books":
      return BookText;
    case "resources":
      return Compass;
  }
}

interface NavLinksClientProps {
  links?: NavLinkItem[];
}

export function NavLinksClient({ links: _links }: NavLinksClientProps) {
  const pathname = usePathname() || "/";
  const [openMenu, setOpenMenu] = useState<MegaMenuKey | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
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
    }, 140);
  };

  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (openMenu && panelRef.current) {
      animatePanelReveal(panelRef.current);
    }
  }, [openMenu]);

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
      className="relative flex items-center gap-4 xl:gap-5 text-sm font-semibold"
    >
      <Link
        href="/"
        aria-current={isRouteActive("/") ? "page" : undefined}
        className={cn(
          "py-2 whitespace-nowrap underline-offset-8 decoration-[#51406F] decoration-2 transition-colors",
          isRouteActive("/")
            ? "text-[#51406F] font-bold underline"
            : "text-[#081838] hover:text-[#51406F] hover:underline",
        )}
      >
        হোম
      </Link>

      {(["courses", "services", "books", "resources"] as MegaMenuKey[]).map(
        (key) => {
          const item = MEGA_MENU_DATA[key];
          const isActive = isRouteActive(item.href);
          const isExpanded = openMenu === key;

          return (
            <div
              key={key}
              onMouseEnter={() => handleOpen(key)}
              className="relative"
            >
              <button
                type="button"
                aria-expanded={isExpanded}
                aria-controls="bcp-desktop-mega-menu"
                onClick={() =>
                  setOpenMenu((prev) => (prev === key ? null : key))
                }
                className={cn(
                  "inline-flex items-center gap-1 py-2 whitespace-nowrap underline-offset-8 decoration-[#51406F] decoration-2 transition-colors cursor-pointer",
                  isActive || isExpanded
                    ? "text-[#51406F] font-bold underline"
                    : "text-[#081838] hover:text-[#51406F] hover:underline",
                )}
              >
                <span>{item.labelBn}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 transition-transform duration-150",
                    isExpanded && "rotate-180 text-[#51406F]",
                  )}
                  aria-hidden="true"
                />
              </button>
            </div>
          );
        },
      )}

      <Link
        href="/about"
        aria-current={isRouteActive("/about") ? "page" : undefined}
        className={cn(
          "py-2 whitespace-nowrap underline-offset-8 decoration-[#51406F] decoration-2 transition-colors",
          isRouteActive("/about")
            ? "text-[#51406F] font-bold underline"
            : "text-[#081838] hover:text-[#51406F] hover:underline",
        )}
      >
        আমাদের সম্পর্কে
      </Link>

      <Link
        href="/contact"
        aria-current={isRouteActive("/contact") ? "page" : undefined}
        className={cn(
          "py-2 whitespace-nowrap underline-offset-8 decoration-[#51406F] decoration-2 transition-colors",
          isRouteActive("/contact")
            ? "text-[#51406F] font-bold underline"
            : "text-[#081838] hover:text-[#51406F] hover:underline",
        )}
      >
        যোগাযোগ
      </Link>

      {/* Keyboard & Pointer Accessible Mega Menu Panel */}
      {activeData ? (
        <div
          id="bcp-desktop-mega-menu"
          ref={panelRef}
          onMouseEnter={clearCloseTimer}
          className="absolute top-full start-1/2 -translate-x-1/2 pt-3 w-[min(90vw,680px)] z-50"
        >
          <div className="rounded-[18px] border border-[#D4CCE3] bg-white shadow-[0_20px_48px_rgba(8,24,56,0.14)] overflow-hidden">
            <div className="px-6 py-4 bg-[#F2EFF8] border-b border-[#D4CCE3] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#DDD6EB] text-[#51406F]">
                  <ActiveIcon className="w-4 h-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-bold text-[#081838]">
                    {activeData.headingBn}
                  </p>
                  <p className="text-xs text-[#596775]">
                    ক্যাটাগরি নির্বাচন করে সরাসরি বিবরণ দেখুন
                  </p>
                </div>
              </div>
              <Link
                href={activeData.href}
                onClick={() => setOpenMenu(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#51406F] hover:text-[#3F315A] hover:underline underline-offset-4 whitespace-nowrap"
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
                  className="group flex items-center justify-between gap-3 rounded-[12px] border border-transparent bg-[#F8F7FB] hover:bg-[#F2EFF8] hover:border-[#D4CCE3] px-4 py-3 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#081838] group-hover:text-[#51406F] truncate">
                      {sub.titleBn}
                    </p>
                    <p className="font-en text-xs text-[#596775]" lang="en">
                      {sub.subtitleEn}
                    </p>
                  </div>
                  <ArrowRight
                    className="w-4 h-4 text-[#51406F] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>

            <div className="px-6 py-3 bg-[#F8F8F8] border-t border-[#D4CCE3] flex items-center justify-between text-xs text-[#596775]">
              <span className="inline-flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-[#51406F]" aria-hidden="true" />
                <span>সঠিক সমাধান খুঁজে না পেলে পরামর্শ ফর্ম বা WhatsApp ব্যবহার করুন</span>
              </span>
              <Link
                href="/consultancy"
                onClick={() => setOpenMenu(null)}
                className="inline-flex items-center gap-1 font-bold text-[#51406F] hover:underline"
              >
                <MessageSquareText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>পরামর্শ নিন</span>
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
