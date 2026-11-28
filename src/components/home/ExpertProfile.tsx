"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useAnimationScope } from "@/hooks/useAnimationScope";
import { animateRevealItems } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

export interface ProfileTimelineItem {
  numBn: string;
  titleBn: string;
  subtitleBn: string;
}

export interface ExpertProfileProps {
  eyebrowBn: string;
  titleBn: string;
  panelTitleBn: string;
  taglineBn: string;
  summaryBn: string;
  imageSrc: string | null;
  imageAlt: string;
  imagePosition?: "left" | "right";
  ctaHref?: string;
  ctaLabelBn?: string;
  items: readonly ProfileTimelineItem[];
}

/**
 * Reusable alternating Profile + Numbered Timeline showcase component
 * styled in the White-to-Periwinkle AKIJ iBOS palette.
 */
export function ExpertProfile({
  eyebrowBn,
  titleBn,
  panelTitleBn,
  taglineBn,
  summaryBn,
  imageSrc,
  imageAlt,
  imagePosition = "left",
  ctaHref = "/about",
  ctaLabelBn = "প্রতিষ্ঠান সম্পর্কে বিস্তারিত জানুন",
  items,
}: ExpertProfileProps) {
  const scopeRef = useAnimationScope<HTMLDivElement>(
    (root) => {
      const timelineItems = Array.from(
        root.querySelectorAll<HTMLElement>("[data-profile-timeline-item]"),
      );
      if (timelineItems.length === 0) return;
      animateRevealItems(timelineItems);
    },
    [titleBn, imagePosition],
  );

  const isRightImage = imagePosition === "right";

  return (
    <div
      ref={scopeRef}
      className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
    >
      {/* Portrait / Official Brand Badge Card */}
      <div
        className={cn(
          "lg:col-span-5 flex justify-center",
          isRightImage ? "lg:order-2" : "lg:order-1",
        )}
      >
        <div className="relative w-full max-w-sm rounded-[22px] border-2 border-[#B8BBFF] bg-white p-7 text-center space-y-5 shadow-[0_18px_42px_rgba(36,63,186,0.12)]">
          {/* Subtle Reference Corner Dot Accent */}
          <div
            aria-hidden="true"
            className="hidden sm:grid grid-cols-4 gap-1.5 absolute -bottom-3 -end-3 p-2 opacity-60 pointer-events-none"
          >
            {Array.from({ length: 12 }).map((_, idx) => (
              <span
                key={idx}
                className="w-1.5 h-1.5 rounded-full bg-[#B8BBFF]"
              />
            ))}
          </div>

          {imageSrc ? (
            <div className="inline-flex items-center justify-center rounded-full p-2.5 bg-[#FBFAFF] shadow-sm border-2 border-[#C59028]/70">
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={136}
                height={136}
                referrerPolicy="no-referrer"
                className="rounded-full object-contain"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <p
              className="font-en text-xs font-bold uppercase tracking-[0.18em] text-[#243FBA]"
              lang="en"
            >
              Business Compliance Partner
            </p>
            <p className="text-base sm:text-lg font-extrabold text-[#081838] leading-snug">
              {taglineBn}
            </p>
            <p className="text-xs text-[#596775] leading-relaxed">{summaryBn}</p>
          </div>

          <div className="pt-3 border-t border-[#E1E4F2]">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#243FBA] hover:text-[#1D329B] hover:underline underline-offset-4 transition-colors"
            >
              <span>{ctaLabelBn}</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* Numbered Credential / Institutional Timeline Panel */}
      <div
        className={cn(
          "lg:col-span-7 space-y-5",
          isRightImage ? "lg:order-1" : "lg:order-2",
        )}
      >
        <div className="space-y-2">
          <p className="inline-flex items-center gap-2 text-xs font-bold text-[#243FBA]">
            <span className="h-[1.5px] w-7 bg-[#243FBA]" aria-hidden="true" />
            <span>{eyebrowBn}</span>
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-[2.15rem] font-extrabold text-[#202D72] leading-tight">
            {titleBn}
          </h2>
        </div>

        <div className="rounded-[20px] border border-[#B8BBFF]/80 bg-white/95 p-5 sm:p-7 space-y-5 shadow-[0_12px_32px_rgba(36,63,186,0.08)]">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] border border-[#B8BBFF] bg-[#E2E3FF] text-[#243FBA] shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#081838]">
              {panelTitleBn}
            </h3>
          </div>

          <ol className="relative space-y-4">
            {items.map((item, idx) => (
              <li
                key={item.numBn}
                data-profile-timeline-item={item.numBn}
                className="relative flex items-start gap-4"
              >
                {idx < items.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="absolute start-4 top-9 bottom-[-18px] w-[1.5px] bg-[#B8BBFF]"
                  />
                ) : null}
                <span className="relative z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#243FBA] to-[#202D72] text-white text-xs font-extrabold shrink-0 shadow-xs ring-2 ring-[#E2E3FF]">
                  {item.numBn}
                </span>
                <div className="space-y-0.5 pt-0.5">
                  <p className="text-sm sm:text-base font-bold text-[#081838] leading-snug">
                    {item.titleBn}
                  </p>
                  <p className="text-xs sm:text-sm text-[#596775] leading-relaxed">
                    {item.subtitleBn}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
