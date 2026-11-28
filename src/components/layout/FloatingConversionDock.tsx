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

/**
 * Reference-aligned compact vertically stacked circular floating buttons (V8.1)
 * anchored cleanly at bottom-right without spanning horizontally across content.
 */
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
      setVisible(window.scrollY > 240);
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
          data-floating-dock="vertical"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0, transition: BCP_TRANSITIONS.standard }}
          exit={{ opacity: 0, y: 12, transition: { duration: 0.14 } }}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] end-3 sm:end-5 z-[var(--z-dock)] flex flex-col items-center gap-2.5"
        >
          <button
            type="button"
            onClick={scrollToTop}
            aria-label="উপরে যান"
            title="উপরে যান"
            className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-[#B8BBFF] bg-white/95 text-[#243FBA] hover:bg-[#E2E3FF] shadow-[0_8px_20px_rgba(32,45,114,0.18)] transition-colors cursor-pointer"
          >
            <ArrowUp className="w-4 h-4 sm:w-4.5 sm:h-4.5" aria-hidden="true" />
          </button>

          <Link
            href="/consultancy"
            aria-label="পরামর্শের অনুরোধ পাঠান"
            title="পরামর্শের অনুরোধ পাঠান"
            className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#243FBA] hover:bg-[#1D329B] text-white shadow-[0_10px_24px_rgba(36,63,186,0.3)] transition-colors"
          >
            <MessageSquareText className="w-5 h-5" aria-hidden="true" />
          </Link>

          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp সহায়তা"
              title="WhatsApp সহায়তা"
              onClick={() =>
                trackEvent("contact_click_whatsapp", {
                  sourcePage: pathname,
                })
              }
              className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#00865A] hover:bg-[#006d49] text-white shadow-[0_10px_24px_rgba(0,134,90,0.3)] transition-colors"
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
            </a>
          ) : null}
        </m.div>
      ) : null}
    </AnimatePresence>
  );
}
