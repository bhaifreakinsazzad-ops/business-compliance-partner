"use client";

import Link from "next/link";
import { m } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
} from "lucide-react";
import { trackEvent, type AnalyticsEventName } from "@/lib/analytics/events";
import { CARD_HOVER_PROPS } from "@/lib/motion/presets";

const FLAGSHIP_PILLARS: ReadonlyArray<{
  key: "courses" | "services" | "books";
  href: string;
  dataFlagshipCta: string;
  analyticsEvent: AnalyticsEventName;
  titleBn: string;
  subtitleBn: string;
  icon: typeof GraduationCap;
}> = [
  {
    key: "courses",
    href: "/courses",
    dataFlagshipCta: "courses",
    analyticsEvent: "click_pillar_courses",
    titleBn: "আমাদের সকল কোর্সসমূহ",
    subtitleBn:
      "Tax, VAT, e-GP, E-commerce, RJSC ও ১০টি ব্যবহারিক প্রশিক্ষণ ট্র্যাক",
    icon: GraduationCap,
  },
  {
    key: "services",
    href: "/services",
    dataFlagshipCta: "services",
    analyticsEvent: "click_pillar_services",
    titleBn: "আমাদের সকল সেবাসমূহ",
    subtitleBn:
      "ট্যাক্স, ভ্যাট, লাইসেন্সিং ও সরাসরি WhatsApp কমপ্লায়েন্স সহায়তা",
    icon: BriefcaseBusiness,
  },
  {
    key: "books",
    href: "/books",
    dataFlagshipCta: "books",
    analyticsEvent: "click_pillar_books",
    titleBn: "আমাদের সকল বইসমূহ",
    subtitleBn:
      "ট্যাক্স, ভ্যাট, কর্পোরেট আইন ও ব্যবসা বিষয়ক আসন্ন প্রকাশনা প্রিভিউ",
    icon: BookOpen,
  },
];

/**
 * Three flagship CTA cards in the exact client-mandated order:
 * Our Courses -> Our Services -> Our Books
 * All three share an identical unified Muted Lavender (#DDD6EB) visual language.
 */
export function PrimaryBusinessActions() {
  return (
    <section
      aria-label="প্রধান নেভিগেশন বাটন"
      className="bg-surface-canvas border-b border-border-subtle py-5 sm:py-6"
    >
      <div className="ps-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {FLAGSHIP_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <m.div key={pillar.key} {...CARD_HOVER_PROPS}>
                <Link
                  href={pillar.href}
                  data-flagship-cta={pillar.dataFlagshipCta}
                  onClick={() =>
                    trackEvent(pillar.analyticsEvent, {
                      pillar: pillar.key.toUpperCase(),
                      sourcePage: "/",
                    })
                  }
                  className="bcp-flagship-card group relative flex items-center justify-between gap-3.5 min-h-[104px] sm:min-h-[124px] px-5 sm:px-6 py-4 sm:py-5"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-[12px] bg-action-primary text-white shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 space-y-1">
                      <span className="block text-lg sm:text-xl font-extrabold leading-snug text-text-primary tracking-tight">
                        {pillar.titleBn}
                      </span>
                      <span className="block text-xs font-medium text-text-body/80 leading-snug line-clamp-2">
                        {pillar.subtitleBn}
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] bg-white/85 text-text-accent border border-border-subtle shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-action-primary group-hover:text-white">
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
