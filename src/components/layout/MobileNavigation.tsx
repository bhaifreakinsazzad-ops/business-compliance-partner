"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Menu,
  MessageCircle,
  X,
} from "lucide-react";
import {
  MASTER_THREE_PILLARS,
  type PillarIconName,
} from "@/lib/config/pillars";
import { QuickSearchDialog } from "@/components/layout/QuickSearchDialog";

export interface NavLinkItem {
  href: string;
  labelBn: string;
  labelEn?: string;
}

interface MobileNavigationProps {
  brandDisplayName: string;
  brandNameBn: string;
  links: NavLinkItem[];
  secondaryLinks?: NavLinkItem[];
  ctaHref: string;
  ctaLabelBn: string;
  whatsappHref?: string | null;
  whatsappDisplay?: string | null;
}

function getPillarIcon(iconName: PillarIconName) {
  switch (iconName) {
    case "GraduationCap":
      return GraduationCap;
    case "BriefcaseBusiness":
      return BriefcaseBusiness;
    case "BookOpen":
      return BookOpen;
  }
}

export function MobileNavigation({
  brandDisplayName,
  brandNameBn,
  links,
  secondaryLinks = [],
  ctaHref,
  ctaLabelBn,
  whatsappHref = null,
  whatsappDisplay = null,
}: MobileNavigationProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) {
      dialog.showModal();
      setIsOpen(true);
    }
  };

  const closeMenu = () => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dialog.open) {
      dialog.close();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => {
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  const pillarHrefs = new Set<string>(
    MASTER_THREE_PILLARS.map((pillar) => pillar.href),
  );
  const supportingLinks = [
    ...links.filter((item) => !pillarHrefs.has(item.href)),
    ...secondaryLinks.filter((item) => !pillarHrefs.has(item.href)),
  ];

  return (
    <div className="lg:hidden flex items-center gap-2 shrink-0">
      <QuickSearchDialog variant="mobile" />

      <button
        ref={triggerRef}
        type="button"
        onClick={openMenu}
        aria-expanded={isOpen}
        aria-controls="ps-mobile-nav-dialog"
        aria-label="মেনু খুলুন"
        className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] border border-border-subtle bg-surface-lavender text-text-accent hover:bg-surface-lavender-muted cursor-pointer transition-colors"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      <dialog
        id="ps-mobile-nav-dialog"
        ref={dialogRef}
        aria-labelledby="ps-mobile-nav-title"
        closedby="any"
        className="m-0 ms-auto h-dvh max-h-dvh w-full max-w-sm bg-surface-card text-text-body p-0 shadow-2xl backdrop:bg-surface-navy/70"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle bg-surface-lavender">
            <div className="min-w-0">
              <p
                id="ps-mobile-nav-title"
                className="font-editorial text-lg font-semibold text-text-primary leading-tight truncate"
                lang="en"
              >
                {brandDisplayName}
              </p>
              <p className="text-xs text-text-accent truncate">{brandNameBn}</p>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="মেনু বন্ধ করুন"
              className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] border border-border-subtle bg-surface-card text-text-accent hover:bg-surface-lavender-muted transition-colors shrink-0"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <nav
            aria-label="মোবাইল নেভিগেশন"
            className="flex-1 overflow-y-auto px-5 py-4 space-y-5"
          >
            {/* Primary 3 Commercial Pillars strictly ordered first: Courses -> Services -> Books */}
            <div>
              <p className="px-1 mb-2.5 text-[11px] font-en font-bold uppercase tracking-[0.14em] text-text-accent">
                Courses · Services · Books
              </p>
              <ul
                data-mobile-pillar-list="true"
                className="space-y-2"
              >
                {MASTER_THREE_PILLARS.map((pillar) => {
                  const Icon = getPillarIcon(pillar.iconName);
                  return (
                    <li key={pillar.id}>
                      <Link
                        href={pillar.href}
                        data-mobile-pillar={pillar.id}
                        onClick={closeMenu}
                        className="bcp-periwinkle-gateway flex items-center justify-between gap-3 min-h-14 px-3.5 py-2.5 rounded-[14px] border border-[#B8BBFF] text-[#081838] transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-[#243FBA] text-white shrink-0">
                            <Icon className="w-5 h-5" aria-hidden="true" />
                          </span>
                          <div className="min-w-0">
                            <span
                              className="block font-en text-sm font-extrabold text-[#081838] leading-tight"
                              lang="en"
                            >
                              {pillar.orderLabel}. {pillar.labelEn}
                            </span>
                            <span className="block text-xs font-semibold text-[#243FBA] truncate">
                              {pillar.labelBn}
                            </span>
                          </div>
                        </div>
                        <ArrowRight
                          className="w-4 h-4 text-[#243FBA] shrink-0"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {supportingLinks.length > 0 ? (
              <div className="pt-4 border-t border-border-subtle">
                <p className="px-2 mb-2 text-xs font-semibold text-text-muted">
                  সহায়ক বিভাগ ও তথ্য
                </p>
                <ul className="space-y-1">
                  {supportingLinks.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="flex items-center justify-between min-h-11 px-3 rounded-[10px] text-sm font-medium text-text-body hover:bg-surface-lavender hover:text-text-accent transition-colors"
                      >
                        <span>{item.labelBn}</span>
                        {item.labelEn ? (
                          <span
                            className="font-en text-[11px] text-text-muted"
                            lang="en"
                          >
                            {item.labelEn}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </nav>

          <div className="p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] border-t border-border-subtle bg-surface-lavender/70 space-y-2.5">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                data-whatsapp-cta="true"
                className="inline-flex w-full items-center justify-center gap-2 min-h-12 px-4 py-2.5 rounded-[12px] bg-[#00865A] hover:bg-[#006D49] text-white text-sm font-bold shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  WhatsApp সহায়তা
                  {whatsappDisplay ? ` (${whatsappDisplay})` : ""}
                </span>
              </a>
            ) : null}
            <Link
              href={ctaHref}
              onClick={closeMenu}
              className="ps-primary-button w-full text-center"
            >
              {ctaLabelBn}
            </Link>
          </div>
        </div>
      </dialog>
    </div>
  );
}
