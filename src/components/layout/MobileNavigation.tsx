"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, MessageCircle, X } from "lucide-react";
import { QuickSearchDialog } from "@/components/layout/QuickSearchDialog";

export interface NavLinkItem {
  href: string;
  labelBn: string;
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
            <div>
              <p
                id="ps-mobile-nav-title"
                className="font-editorial text-lg font-semibold text-text-primary leading-tight"
                lang="en"
              >
                {brandDisplayName}
              </p>
              <p className="text-xs text-text-accent">{brandNameBn}</p>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="মেনু বন্ধ করুন"
              className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] border border-border-subtle bg-surface-card text-text-accent hover:bg-surface-lavender-muted transition-colors"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <nav
            aria-label="মোবাইল নেভিগেশন"
            className="flex-1 overflow-y-auto px-5 py-4"
          >
            <ul className="space-y-1">
              {links.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMenu}
                    className="flex items-center min-h-12 px-3 rounded-[12px] text-base font-semibold text-text-primary hover:bg-surface-lavender hover:text-text-accent transition-colors"
                  >
                    {item.labelBn}
                  </Link>
                </li>
              ))}
            </ul>
            {secondaryLinks.length > 0 ? (
              <div className="mt-5 pt-4 border-t border-border-subtle">
                <p className="px-3 mb-2 text-xs font-semibold text-text-muted">
                  অন্যান্য বিভাগ ও টুলস
                </p>
                <ul className="space-y-1">
                  {secondaryLinks.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="flex items-center min-h-11 px-3 rounded-[12px] text-sm font-medium text-text-body hover:bg-surface-lavender hover:text-text-accent transition-colors"
                      >
                        {item.labelBn}
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
