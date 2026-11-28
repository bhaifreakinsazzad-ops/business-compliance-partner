"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { animate } from "animejs";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Pause,
  Play,
  ShieldCheck,
} from "lucide-react";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

interface PromoSlide {
  id: string;
  orderCode: string;
  badgeBn: string;
  titleBn: string;
  subtitleBn: string;
  highlightsBn: string[];
  ctaHref: string;
  ctaLabelBn: string;
  secondaryHref: string;
  secondaryLabelBn: string;
  visualTagEn: string;
  visualHeadingBn: string;
  visualTone: "courses" | "services" | "books" | "overview";
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: "ecosystem-overview",
    orderCode: "01",
    badgeBn: "Courses · Services · Books",
    titleBn:
      "ব্যবসা শুরু থেকে কমপ্লায়েন্স পরিচালনা—কোর্স, পেশাদার সেবা ও বই এক প্ল্যাটফর্মে",
    subtitleBn:
      "বাংলাদেশের উদ্যোক্তা ও পেশাজীবীদের জন্য ব্যবহারিক প্রশিক্ষণ, আয়কর-ভ্যাট-আরজেএসসি সেবা এবং রেফারেন্স প্রকাশনা।",
    highlightsBn: [
      "দক্ষতা উন্নয়নে ব্যবহারিক Courses",
      "ব্যবসার জন্য পেশাদার Services ও WhatsApp সহায়তা",
      "অফিসিয়াল রেফারেন্স হ্যান্ডবুক ও Books",
    ],
    ctaHref: "/courses",
    ctaLabelBn: "কোর্সসমূহ দেখুন",
    secondaryHref: "/services",
    secondaryLabelBn: "সেবাসমূহ দেখুন",
    visualTagEn: "ONE PARTNER · COMPLETE SOLUTIONS",
    visualHeadingBn: "সমন্বিত ব্যবসায়িক শিক্ষা ও কমপ্লায়েন্স",
    visualTone: "overview",
  },
  {
    id: "professional-courses",
    orderCode: "02",
    badgeBn: "01 · Courses — দক্ষতা উন্নয়ন ও প্রশিক্ষণ",
    titleBn: "Tax, VAT, e-GP, E-commerce ও RJSC ব্যবহারিক কোর্স",
    subtitleBn:
      "পেশাদার দক্ষতা অর্জন করুন এবং নিজেকে প্রস্তুত করুন—১০টি ব্যবহারিক প্রশিক্ষণ ট্র্যাক ও স্পষ্ট সিলেবাস।",
    highlightsBn: [
      "আয়কর ও কর্পোরেট ট্যাক্স রিটার্ন",
      "ভ্যাট ও মূসক ৯.১ অনলাইন দাখিল",
      "BPPA e-GP দরপত্র ও ই-কমার্স DBID",
    ],
    ctaHref: "/courses",
    ctaLabelBn: "Explore Courses",
    secondaryHref: "/consultancy",
    secondaryLabelBn: "আগ্রহ নিবন্ধন",
    visualTagEn: "01 · COURSES GATEWAY",
    visualHeadingBn: "আমাদের সকল কোর্সসমূহ",
    visualTone: "courses",
  },
  {
    id: "tax-vat-services",
    orderCode: "03",
    badgeBn: "02 · Services — পেশাদার ও লাইসেন্সিং সহায়তা",
    titleBn: "আয়কর, ভ্যাট, Smart RJSC ও ব্যবসার লাইসেন্সিং সেবা",
    subtitleBn:
      "ব্যবসার প্রয়োজনীয় পেশাদার সহায়তা ও সমাধান নিন—সরাসরি পরামর্শ ও WhatsApp সহায়তা।",
    highlightsBn: [
      "e-TIN, আয়কর রিটার্ন ও BIN নিবন্ধন",
      "Smart RJSC কোম্পানি গঠন ও রিটার্ন",
      "ট্রেড লাইসেন্স, DIFE, ফায়ার ও IRC/ERC",
    ],
    ctaHref: "/services",
    ctaLabelBn: "Explore Services",
    secondaryHref: "/licensing",
    secondaryLabelBn: "লাইসেন্সিং নির্দেশিকা",
    visualTagEn: "02 · SERVICES GATEWAY",
    visualHeadingBn: "আমাদের সকল সেবাসমূহ",
    visualTone: "services",
  },
  {
    id: "books-storefront",
    orderCode: "04",
    badgeBn: "03 · Books — প্রকাশনা ও রেফারেন্স বইসমূহ",
    titleBn: "ব্যবহারিক কমপ্লায়েন্স হ্যান্ডবুক ও প্রকাশনা মার্কেটপ্লেস",
    subtitleBn:
      "প্রয়োজনীয় বই ও প্রকাশনার মাধ্যমে আপনার কমপ্লায়েন্স জ্ঞান সমৃদ্ধ করুন—আয়কর, ভ্যাট ও কর্পোরেট গাইড।",
    highlightsBn: [
      "আয়কর ও মূসক ৯.১ ফিল্ড গাইড",
      "e-GP ও সরকারি টেন্ডার ম্যানুয়াল",
      "RJSC কোম্পানি আইন ও উদ্যোক্তা গাইড",
    ],
    ctaHref: "/books",
    ctaLabelBn: "Explore Books",
    secondaryHref: "/contact",
    secondaryLabelBn: "যোগাযোগ করুন",
    visualTagEn: "03 · BOOKS MARKETPLACE",
    visualHeadingBn: "আমাদের সকল বইসমূহ",
    visualTone: "books",
  },
];

const AUTO_ADVANCE_MS = 6000;

interface PromotionalHeroSliderProps {
  logoAssetPath: string;
  brandName: string;
}

export function PromotionalHeroSlider({
  logoAssetPath,
  brandName,
}: PromotionalHeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const textPanelRef = useRef<HTMLDivElement | null>(null);
  const hasInteractedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(media.matches);
    const onChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const goTo = useCallback((nextIndex: number) => {
    hasInteractedRef.current = true;
    setActiveIndex((nextIndex + PROMO_SLIDES.length) % PROMO_SLIDES.length);
  }, []);

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (prefersReducedMotion || isPaused || isHovered || isFocused) {
      return;
    }
    const timer = window.setInterval(() => {
      hasInteractedRef.current = true;
      setActiveIndex((prev) => (prev + 1) % PROMO_SLIDES.length);
    }, AUTO_ADVANCE_MS);

    return () => window.clearInterval(timer);
  }, [prefersReducedMotion, isPaused, isHovered, isFocused]);

  useEffect(() => {
    if (!hasInteractedRef.current || prefersReducedMotion) return;
    const panel = textPanelRef.current;
    if (!panel) return;
    const anim = animate(panel, {
      opacity: [0.7, 1],
      translateY: [6, 0],
      duration: MOTION_DURATIONS.standard,
      ease: MOTION_EASES.crisp,
    });
    return () => {
      anim.cancel();
    };
  }, [activeIndex, prefersReducedMotion]);

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < 40) return;
    if (deltaX < 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  const activeSlide = PROMO_SLIDES[activeIndex] ?? PROMO_SLIDES[0]!;
  const SlideVisualIcon =
    activeSlide.visualTone === "courses"
      ? GraduationCap
      : activeSlide.visualTone === "services"
        ? BriefcaseBusiness
        : activeSlide.visualTone === "books"
          ? BookOpen
          : ShieldCheck;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="প্রচারণামূলক ব্যানার স্লাইডার"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setIsFocused(false);
        }
      }}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="bcp-periwinkle-hero-gradient relative text-[#181D26] border-b border-[#E1E4F2] overflow-hidden"
    >
      <div className="ps-container relative pt-6 pb-5 sm:pt-8 sm:pb-6 lg:pt-9 lg:pb-7 space-y-6">
        {/* Compact Reference-Style Promotional Banner Card */}
        <div className="rounded-[22px] border border-white/90 bg-white/88 shadow-[0_18px_48px_rgba(32,45,114,0.08)] p-5 sm:p-7 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Column — Editorial Value Proposition & Actions */}
            <div
              ref={textPanelRef}
              aria-live={isPaused ? "polite" : "off"}
              className="lg:col-span-7 space-y-3.5"
            >
              <div className="inline-flex items-center gap-2.5">
                {logoAssetPath ? (
                  <Image
                    src={logoAssetPath}
                    alt={`${brandName} অফিসিয়াল ব্যাজ`}
                    width={30}
                    height={30}
                    priority
                    referrerPolicy="no-referrer"
                    className="rounded-full border border-[#C59028]/70 bg-white object-contain shrink-0"
                  />
                ) : null}
                <span className="text-xs sm:text-sm font-bold tracking-wide text-[#243FBA]">
                  {activeSlide.badgeBn}
                </span>
              </div>

              {activeIndex === 0 ? (
                <h1 className="text-2xl sm:text-3xl lg:text-[2.15rem] font-extrabold leading-[1.24] text-[#081838] [text-wrap:balance] max-w-2xl">
                  {activeSlide.titleBn}
                </h1>
              ) : (
                <>
                  <h1 className="visually-hidden">
                    {PROMO_SLIDES[0]!.titleBn}
                  </h1>
                  <p className="text-2xl sm:text-3xl lg:text-[2.15rem] font-extrabold leading-[1.24] text-[#081838] [text-wrap:balance] max-w-2xl">
                    {activeSlide.titleBn}
                  </p>
                </>
              )}

              <p className="text-sm sm:text-base text-[#596775] leading-relaxed max-w-xl">
                {activeSlide.subtitleBn}
              </p>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <Link
                  href={activeSlide.ctaHref}
                  className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 rounded-[10px] bg-[#243FBA] text-white font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0 hover:bg-[#1D329B] transition-colors shadow-sm"
                >
                  <span>{activeSlide.ctaLabelBn}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <Link
                  href={activeSlide.secondaryHref}
                  className="inline-flex items-center justify-center min-h-11 px-4 py-2.5 rounded-[10px] border border-[#E1E4F2] bg-[#FBFAFF] text-[#081838] font-semibold text-xs sm:text-sm whitespace-nowrap shrink-0 hover:bg-[#E2E3FF] hover:border-[#243FBA] transition-colors"
                >
                  {activeSlide.secondaryLabelBn}
                </Link>
              </div>
            </div>

            {/* Right Column — Clean 16:9 Promotional Visual Showcase Frame */}
            <div className="hidden sm:block lg:col-span-5">
              <div className="rounded-[18px] border border-[#B8BBFF]/80 bg-gradient-to-br from-[#081838] via-[#13295B] to-[#243FBA] text-white p-5 sm:p-6 shadow-md relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="absolute -right-8 -top-8 w-36 h-36 rounded-full bg-[#B8BBFF]/20"
                />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 text-[11px] font-en font-bold uppercase tracking-[0.14em] text-[#CCCEFF]">
                      <SlideVisualIcon className="w-4 h-4 text-[#DFB15B]" aria-hidden="true" />
                      <span>{activeSlide.visualTagEn}</span>
                    </span>
                    <span className="font-en text-xs font-bold text-[#DFB15B] tabular-nums">
                      {activeSlide.orderCode} / 0{PROMO_SLIDES.length}
                    </span>
                  </div>

                  <p className="text-lg sm:text-xl font-extrabold leading-snug text-white">
                    {activeSlide.visualHeadingBn}
                  </p>

                  <ul className="space-y-2 text-xs sm:text-sm text-white/90">
                    {activeSlide.highlightsBn.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <CheckCircle2
                          className="w-4 h-4 text-[#5de2a5] shrink-0"
                          aria-hidden="true"
                        />
                        <span className="line-clamp-1">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bunyanum-style Centered Segmented Progress Bar + Counter + Pause Control */}
        <div className="flex flex-col items-center gap-4">
          <div className="inline-flex items-center justify-center gap-2 sm:gap-3 rounded-[14px] border border-[#B8BBFF]/90 bg-white/90 px-3 sm:px-4 py-1.5 sm:py-2 shadow-sm max-w-full">
            <span className="font-en text-xs font-extrabold text-[#243FBA] tabular-nums whitespace-nowrap">
              {activeSlide.orderCode}
              <span className="text-[#596775] mx-1">—</span>
              0{PROMO_SLIDES.length}
            </span>

            <div
              className="flex items-center gap-1 sm:gap-1.5"
              role="group"
              aria-label="স্লাইড নির্বাচন"
            >
              {PROMO_SLIDES.map((slide, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goTo(idx)}
                    aria-label={`স্লাইড ${idx + 1}: ${slide.badgeBn}`}
                    aria-current={isCurrent ? "true" : undefined}
                    className="py-1.5 px-0.5 cursor-pointer"
                  >
                    <span
                      className={cn(
                        "block h-1.5 rounded-full transition-all duration-200",
                        isCurrent
                          ? "w-7 sm:w-12 bg-[#243FBA]"
                          : "w-3.5 sm:w-8 bg-[#CFD1FF] hover:bg-[#B8BBFF]",
                      )}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 border-s border-[#E1E4F2] ps-2 sm:ps-2.5 shrink-0">
              <button
                type="button"
                onClick={goPrev}
                aria-label="পূর্ববর্তী স্লাইড"
                className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] border border-[#E1E4F2] bg-white text-[#081838] hover:border-[#243FBA] hover:text-[#243FBA] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                aria-pressed={isPaused}
                aria-label={isPaused ? "স্লাইডার চালু করুন" : "স্লাইডার থামান"}
                className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] border border-[#B8BBFF] bg-[#E2E3FF] text-[#243FBA] hover:bg-[#243FBA] hover:text-white transition-colors cursor-pointer"
              >
                {isPaused ? (
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={goNext}
                aria-label="পরবর্তী স্লাইড"
                className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-[8px] border border-[#E1E4F2] bg-white text-[#081838] hover:border-[#243FBA] hover:text-[#243FBA] transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Reference Tagline Divider */}
          <div className="flex items-center justify-center gap-3 w-full max-w-2xl">
            <span className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent to-[#243FBA]/50" aria-hidden="true" />
            <p
              className="font-en text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#202D72] text-center"
              lang="en"
            >
              One Partner · Complete Solutions · Confident Growth
            </p>
            <span className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent to-[#243FBA]/50" aria-hidden="true" />
          </div>
        </div>
      </div>
    </section>
  );
}
