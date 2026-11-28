"use client";

import Link from "next/link";
import {
  ArrowRight,
  Compass,
  FileCheck2,
  Lightbulb,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import { useAnimationScope } from "@/hooks/useAnimationScope";
import { animateRevealItems } from "@/lib/motion/tokens";

interface JourneyStep {
  numberBn: string;
  titleBn: string;
  descriptionBn: string;
  icon: "compass" | "message" | "lightbulb" | "shield";
}

const JOURNEY_STEPS: readonly JourneyStep[] = [
  {
    numberBn: "১",
    titleBn: "প্রয়োজন অনুযায়ী বিভাগ নির্বাচন",
    descriptionBn:
      "আপনার লক্ষ্য অনুযায়ী Courses (প্রশিক্ষণ), Services (পেশাদার সহায়তা) অথবা Books (হ্যান্ডবুক) থেকে সঠিক বিভাগ বেছে নিন।",
    icon: "compass",
  },
  {
    numberBn: "২",
    titleBn: "সরাসরি পরামর্শ ও নথি যাচাই",
    descriptionBn:
      "আয়কর, ভ্যাট, Smart RJSC বা লাইসেন্সিংয়ের প্রয়োজনীয় চেকলিস্ট ও নথিপত্র প্রাথমিক পরামর্শের মাধ্যমে সুনির্দিষ্ট করুন।",
    icon: "message",
  },
  {
    numberBn: "৩",
    titleBn: "সহজ ও কাঠামোবদ্ধ সমাধান",
    descriptionBn:
      "জটিল কমপ্লায়েন্স ও রেগুলেটরি ধাপগুলো বাস্তবসম্মতভাবে অনুশীলন বা প্রস্তুত করে নির্ভুল প্রক্রিয়ায় এগিয়ে যান।",
    icon: "lightbulb",
  },
  {
    numberBn: "৪",
    titleBn: "সুরক্ষিত ও নির্ভরযোগ্য অগ্রগতি",
    descriptionBn:
      "হালনাগাদ ব্যবহারিক জ্ঞান, রেফারেন্স বই এবং পেশাদার দিকনির্দেশনায় আপনার ব্যবসার দীর্ঘমেয়াদী কমপ্লায়েন্স নিশ্চিত করুন।",
    icon: "shield",
  },
] as const;

function getStepIcon(icon: JourneyStep["icon"]) {
  switch (icon) {
    case "compass":
      return Compass;
    case "message":
      return MessageSquareText;
    case "lightbulb":
      return Lightbulb;
    case "shield":
      return ShieldCheck;
  }
}

export function CustomerJourneySection() {
  const scopeRef = useAnimationScope<HTMLDivElement>((root) => {
    const cards = Array.from(
      root.querySelectorAll<HTMLElement>("[data-journey-step]"),
    );
    if (cards.length === 0 || typeof IntersectionObserver === "undefined") {
      return;
    }

    let revealed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (revealed || !entries.some((entry) => entry.isIntersecting)) return;
        revealed = true;
        observer.disconnect();
        animateRevealItems(cards);
      },
      { threshold: 0.15 },
    );
    observer.observe(root);
  });

  return (
    <section
      aria-label="আমাদের কার্যক্রম কীভাবে চলে — ৪ ধাপের যাত্রা"
      className="py-12 sm:py-16 bg-white border-b border-[#E1E4F2]"
    >
      <div
        ref={scopeRef}
        className="ps-container grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
      >
        {/* Left Narrative Block matching Reference Section 05 */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 font-en text-xs font-bold uppercase tracking-[0.16em] text-[#243FBA]">
              <FileCheck2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>How BCP Works · 4-Step Journey</span>
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold text-[#202D72] leading-tight">
              আমাদের কার্যক্রম <span className="text-[#243FBA]">কীভাবে</span> চলে?
            </h2>
            <div
              className="w-14 h-1 rounded-full bg-[#243FBA]"
              aria-hidden="true"
            />
          </div>

          <p className="text-sm sm:text-base text-[#596775] leading-relaxed">
            বাংলাদেশের উদ্যোক্তা, কর্পোরেট টিম এবং পেশাজীবীরা যেন বিভ্রান্তি ছাড়াই
            সঠিক প্রশিক্ষণ, আয়কর-ভ্যাট-আরজেএসসি পরামর্শ এবং রেফারেন্স বইয়ের
            মাধ্যমে আত্মবিশ্বাসের সাথে ব্যবসা পরিচালনা করতে পারেন—সেই লক্ষ্যে
            আমাদের চার ধাপের কাঠামোবদ্ধ পথচলা।
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/about"
              className="ps-primary-button whitespace-nowrap"
            >
              <span>আরও জানুন</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/consultancy"
              className="ps-secondary-button whitespace-nowrap"
            >
              <span>পরামর্শ অনুরোধ</span>
            </Link>
          </div>
        </div>

        {/* Right 2x2 Periwinkle-Tinted Numbered Journey Cards */}
        <ol className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {JOURNEY_STEPS.map((step) => {
            const Icon = getStepIcon(step.icon);
            return (
              <li
                key={step.numberBn}
                data-journey-step={step.numberBn}
                className="rounded-[18px] border border-[#E1E4F2] bg-[#F5F7FF] hover:border-[#B8BBFF] hover:bg-[#EEF0FF] p-5 sm:p-6 space-y-3 transition-colors shadow-[0_6px_20px_rgba(36,63,186,0.05)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-[12px] bg-[#E2E3FF] text-[#243FBA] border border-[#B8BBFF]">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#243FBA] text-white text-xs font-extrabold tabular-nums">
                    {step.numberBn}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-[#081838] leading-snug">
                  {step.titleBn}
                </h3>

                <p className="text-xs sm:text-sm text-[#596775] leading-relaxed">
                  {step.descriptionBn}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
