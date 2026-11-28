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
 * Three unified commercial gateway buttons directly below the hero slider
 * in the strict client-mandated order:
 * 01. Courses -> 02. Services -> 03. Books
 * Unified AKIJ Periwinkle Light (#E2E3FF) & Functional Blue (#243FBA) visual treatment.
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
      opacity: [0.85, 1],
      translateY: [8, 0],
      duration: MOTION_DURATIONS.reveal,
      delay: stagger(50),
      ease: MOTION_EASES.crisp,
    });

    return () => {
      anim.cancel();
    };
  }, []);

  return (
    <section
      aria-label="প্রধান গেটওয়ে বাটন — Courses, Services, Books"
      className="bg-white border-b border-[#E1E4F2] py-5 sm:py-6"
    >
      <div className="ps-container">
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-6xl mx-auto"
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
                  className="bcp-flagship-card group flex items-center justify-between gap-3 min-h-[96px] sm:min-h-[104px] px-4 sm:px-5 py-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] bg-[#243FBA] text-white shrink-0 shadow-xs">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p
                        className="font-en text-[11px] font-bold uppercase tracking-[0.12em] text-[#243FBA]"
                        lang="en"
                      >
                        {pillar.orderLabel} · {pillar.labelEn}
                      </p>
                      <h2 className="text-[15px] sm:text-base font-extrabold leading-snug text-[#081838]">
                        {pillar.labelBn}
                      </h2>
                      <p className="text-xs text-[#596775]">
                        {pillar.ctaLabelBn}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] bg-white text-[#243FBA] border border-[#B8BBFF] shrink-0 transition-colors group-hover:bg-[#243FBA] group-hover:text-white group-hover:border-[#243FBA]">
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </Link>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
