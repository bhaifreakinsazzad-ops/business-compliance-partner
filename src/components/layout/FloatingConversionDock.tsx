"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { ArrowUp, MessageCircle, MessageSquareText } from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";
import {
  buildWhatsAppGeneralMessage,
  buildWhatsAppUrl,
} from "@/lib/contact/whatsapp";
import { BCP_TRANSITIONS } from "@/lib/motion/presets";

interface FloatingConversionDockProps {
  verifiedWhatsapp: string | null;
}

const HIDDEN_PREFIXES = ["/consultancy", "/contact", "/portal", "/admin"];

export function FloatingConversionDock({
  verifiedWhatsapp,
}: FloatingConversionDockProps) {
  const pathname = usePathname() || "/";
  const [visible, setVisible] = useState(false);

  const isHiddenRoute = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  useEffect(() => {
    if (isHiddenRoute || typeof window === "undefined") {
      setVisible(false);
      return;
    }

    const onScroll = () => {
      setVisible(window.scrollY > 360);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHiddenRoute]);

  const waHref = buildWhatsAppUrl(
    verifiedWhatsapp,
    buildWhatsAppGeneralMessage(),
  );

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <AnimatePresence>
      {!isHiddenRoute && visible ? (
        <m.div
          role="region"
          aria-label="দ্রুত সহায়তা ও নেভিগেশন"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: BCP_TRANSITIONS.standard }}
          exit={{ opacity: 0, y: 12, transition: { duration: 0.14 } }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-4 z-[var(--z-dock)] flex items-center gap-1.5 rounded-[14px] border border-border-subtle bg-white/95 backdrop-blur p-1.5 shadow-xl"
        >
          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("contact_click_whatsapp", {
                  sourcePage: pathname,
                })
              }
              className="inline-flex items-center gap-2 min-h-10 px-3.5 rounded-[10px] bg-action-whatsapp text-white text-xs sm:text-sm font-bold hover:bg-[var(--action-whatsapp-hover)] transition-colors"
            >
              <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>WhatsApp সহায়তা</span>
            </a>
          ) : (
            <Link
              href="/consultancy"
              className="inline-flex items-center gap-2 min-h-10 px-3.5 rounded-[10px] bg-action-primary text-white text-xs sm:text-sm font-bold hover:bg-action-primary-hover transition-colors"
            >
              <MessageSquareText className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>দ্রুত পরামর্শ</span>
            </Link>
          )}

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="উপরে যান"
            title="উপরে যান"
            className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] border border-border-subtle bg-surface-lavender text-text-accent hover:bg-surface-lavender-muted transition-colors cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" aria-hidden="true" />
          </button>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
