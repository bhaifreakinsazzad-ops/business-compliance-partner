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
import { BUTTON_PRESS_PROPS } from "@/lib/motion/presets";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

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

interface PrimaryBusinessActionsProps {
  embedded?: boolean;
}

/**
 * Compact, prominent commercial gateway buttons placed directly beneath the hero tagline
 * in the strict client-mandated order:
 * 01. Courses -> 02. Services -> 03. Books
 * All three share the identical AKIJ Periwinkle Light (#E2E3FF) fill treatment.
 */
export function PrimaryBusinessActions({
  embedded = false,
}: PrimaryBusinessActionsProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row || typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const buttons = row.querySelectorAll<HTMLElement>("[data-flagship-item]");
    if (buttons.length === 0) return;

    const anim = animate(buttons, {
      opacity: [0.88, 1],
      translateY: [6, 0],
      duration: MOTION_DURATIONS.reveal,
      delay: stagger(45),
      ease: MOTION_EASES.crisp,
    });

    return () => {
      anim.cancel();
    };
  }, []);

  const content = (
    <div
      ref={rowRef}
      aria-label="প্রধান গেটওয়ে বাটন — Courses, Services, Books"
      className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-3.5 max-w-4xl mx-auto"
    >
      {MASTER_THREE_PILLARS.map((pillar) => {
        const Icon = getPillarIcon(pillar.iconName);
        return (
          <m.div
            key={pillar.id}
            data-flagship-item={pillar.id}
            className="sm:flex-1 sm:min-w-[230px] sm:max-w-[290px]"
            {...BUTTON_PRESS_PROPS}
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
              className="bcp-flagship-card group flex items-center justify-between gap-2.5 min-h-[54px] sm:min-h-[58px] px-4 py-2.5 rounded-[12px]"
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-[9px] bg-[#243FBA] text-white shrink-0 shadow-xs">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span
                    className="block font-en text-[10px] font-bold uppercase tracking-[0.12em] text-[#243FBA] leading-tight"
                    lang="en"
                  >
                    {pillar.orderLabel} · {pillar.labelEn}
                  </span>
                  <span className="block text-[13px] sm:text-sm font-extrabold leading-tight text-[#081838]">
                    {pillar.labelBn}
                  </span>
                </span>
              </span>

              <span className="inline-flex items-center justify-center w-7 h-7 rounded-[8px] bg-white text-[#243FBA] border border-[#B8BBFF] shrink-0 transition-colors group-hover:bg-[#243FBA] group-hover:text-white group-hover:border-[#243FBA]">
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </Link>
          </m.div>
        );
      })}
    </div>
  );

  if (embedded) {
    return <div className="pt-1">{content}</div>;
  }

  return (
    <section
      aria-label="প্রধান গেটওয়ে বাটন — Courses, Services, Books"
      className={cn("bg-white border-b border-[#E1E4F2] py-4 sm:py-5")}
    >
      <div className="ps-container">{content}</div>
    </section>
  );
}
