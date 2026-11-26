"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate, stagger } from "animejs";
import { m } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics/events";
import {
  MASTER_THREE_PILLARS,
  type PillarIconName,
} from "@/lib/config/pillars";
import { CARD_HOVER_PROPS } from "@/lib/motion/presets";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion/tokens";

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

/**
 * Three flagship CTA cards in the exact client-mandated order:
 * 01. Courses -> 02. Services -> 03. Books
 * All three share an identical unified Muted Lavender (#DDD6EB) visual language.
 */
export function PrimaryBusinessActions() {
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cards = grid.querySelectorAll<HTMLElement>("[data-flagship-item]");
    if (cards.length === 0) return;

    const anim = animate(cards, {
      opacity: [0.82, 1],
      translateY: [10, 0],
      duration: MOTION_DURATIONS.reveal,
      delay: stagger(55),
      ease: MOTION_EASES.crisp,
    });

    return () => {
      anim.cancel();
    };
  }, []);

  return (
    <section
      aria-label="প্রধান নেভিগেশন বাটন — Courses, Services, Books"
      className="bg-surface-canvas border-b border-border-subtle py-5 sm:py-6"
    >
      <div className="ps-container">
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5"
        >
          {MASTER_THREE_PILLARS.map((pillar) => {
            const Icon = getPillarIcon(pillar.iconName);
            return (
              <m.div
                key={pillar.id}
                data-flagship-item={pillar.id}
                {...CARD_HOVER_PROPS}
              >
                <Link
                  href={pillar.href}
                  data-flagship-cta={pillar.dataFlagshipCta}
                  onClick={() =>
                    trackEvent(pillar.analyticsEvent, {
                      pillar: pillar.id.toUpperCase(),
                      sourcePage: "/",
                    })
                  }
                  className="bcp-flagship-card group relative flex flex-col justify-between gap-3 min-h-[144px] sm:min-h-[164px] px-5 sm:px-6 py-4 sm:py-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <span className="inline-flex items-center justify-center w-12 h-12 sm:w-13 sm:h-13 rounded-[12px] bg-action-primary text-white shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105">
                        <Icon
                          className="w-6 h-6"
                          aria-hidden="true"
                        />
                      </span>
                      <div className="min-w-0 space-y-1">
                        <p
                          className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#51406F]"
                          lang="en"
                        >
                          {pillar.orderLabel} · {pillar.labelEn}
                        </p>
                        <h2 className="text-lg sm:text-xl font-extrabold leading-snug text-text-primary tracking-tight">
                          {pillar.labelBn}
                        </h2>
                      </div>
                    </div>

                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-white/85 text-text-accent border border-border-subtle shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-action-primary group-hover:text-white">
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-xs sm:text-[13px] font-medium text-text-body/85 leading-relaxed line-clamp-2">
                      {pillar.customerIntentBn}
                    </p>
                    <p className="flex items-center justify-between gap-2 pt-2 border-t border-[#51406F]/15 text-xs font-bold text-[#51406F]">
                      <span className="font-en" lang="en">
                        {pillar.ctaLabelEn}
                      </span>
                      <span>{pillar.ctaLabelBn}</span>
                    </p>
                  </div>
                </Link>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
