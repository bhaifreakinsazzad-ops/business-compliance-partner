"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUp, MessageCircle, MessageSquareText } from "lucide-react";
import {
  buildWhatsAppGeneralMessage,
  buildWhatsAppUrl,
} from "@/lib/contact/whatsapp";

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

  if (isHiddenRoute || !visible) {
    return null;
  }

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
    <div
      role="region"
      aria-label="দ্রুত সহায়তা ও নেভিগেশন"
      className="fixed bottom-4 end-4 z-30 flex items-center gap-1.5 rounded-[14px] border border-[#D4CCE3] bg-white/95 backdrop-blur p-1.5 shadow-xl"
    >
      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 min-h-10 px-3.5 rounded-[10px] bg-[#00865A] text-white text-xs sm:text-sm font-bold hover:bg-[#006D49] transition-colors"
        >
          <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>WhatsApp সহায়তা</span>
        </a>
      ) : (
        <Link
          href="/consultancy"
          className="inline-flex items-center gap-2 min-h-10 px-3.5 rounded-[10px] bg-[#51406F] text-white text-xs sm:text-sm font-bold hover:bg-[#3F315A] transition-colors"
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
        className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] border border-[#D4CCE3] bg-[#F2EFF8] text-[#51406F] hover:bg-[#DDD6EB] transition-colors cursor-pointer"
      >
        <ArrowUp className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
