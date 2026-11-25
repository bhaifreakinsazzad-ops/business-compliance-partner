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
        className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] border border-ps-navy/25 bg-ps-white text-ps-navy hover:bg-ps-cool"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>

      <dialog
        id="ps-mobile-nav-dialog"
        ref={dialogRef}
        aria-labelledby="ps-mobile-nav-title"
        closedby="any"
        className="m-0 ms-auto h-dvh max-h-dvh w-full max-w-sm bg-ps-white text-ps-ink p-0 shadow-2xl backdrop:bg-ps-midnight/70"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ps-border bg-ps-ivory">
            <div>
              <p
                id="ps-mobile-nav-title"
                className="font-editorial text-lg font-semibold text-ps-navy leading-tight"
                lang="en"
              >
                {brandDisplayName}
              </p>
              <p className="text-xs text-ps-muted">{brandNameBn}</p>
            </div>
            <button
              type="button"
              onClick={closeMenu}
              aria-label="মেনু বন্ধ করুন"
              className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] border border-ps-border bg-ps-white text-ps-navy hover:bg-ps-cool"
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
                    className="flex items-center min-h-12 px-3 rounded-[12px] text-base font-semibold text-ps-navy hover:bg-ps-cool"
                  >
                    {item.labelBn}
                  </Link>
                </li>
              ))}
            </ul>
            {secondaryLinks.length > 0 ? (
              <div className="mt-5 pt-4 border-t border-ps-border">
                <p className="px-3 mb-2 text-xs font-semibold text-ps-muted">
                  অন্যান্য বিভাগ ও টুলস
                </p>
                <ul className="space-y-1">
                  {secondaryLinks.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="flex items-center min-h-11 px-3 rounded-[12px] text-sm font-medium text-ps-ink/85 hover:bg-ps-cool"
                      >
                        {item.labelBn}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </nav>

          <div className="p-5 border-t border-ps-border bg-ps-ivory/60 space-y-2.5">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                data-whatsapp-cta="true"
                className="inline-flex w-full items-center justify-center gap-2 min-h-12 px-4 py-2.5 rounded-[12px] bg-gradient-to-r from-[#00865a] to-[#009c68] text-ps-white text-sm font-bold shadow-sm hover:from-[#006d49] hover:to-[#00865a]"
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
