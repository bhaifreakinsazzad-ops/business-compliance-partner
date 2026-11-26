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
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { LazyHeroStudio3D } from "@/components/three/LazyHeroStudio3D";
import { MOTION_DURATIONS, MOTION_EASES } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

interface PromoSlide {
  id: string;
  badgeBn: string;
  titleBn: string;
  subtitleBn: string;
  ctaHref: string;
  ctaLabelBn: string;
  secondaryHref: string;
  secondaryLabelBn: string;
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: "ecosystem-overview",
    badgeBn: "Business Compliance Partner · বাংলাদেশ",
    titleBn: "ব্যবসা শুরু থেকে সফল পরিচালনা—সব সমাধান এক জায়গায়।",
    subtitleBn:
      "পেশাদার কোর্স, ট্যাক্স-ভ্যাট কমপ্লায়েন্স সেবা, বইয়ের প্রিভিউ, লাইসেন্সিং ও বিশেষজ্ঞ পরামর্শের বিশ্বস্ত প্ল্যাটফর্ম।",
    ctaHref: "/courses",
    ctaLabelBn: "আমাদের কোর্স দেখুন",
    secondaryHref: "/consultancy",
    secondaryLabelBn: "বিশেষজ্ঞ পরামর্শ নিন",
  },
  {
    id: "professional-courses",
    badgeBn: "দক্ষতা উন্নয়ন ও প্রশিক্ষণ",
    titleBn: "Tax, VAT, e-GP, E-commerce ও RJSC ব্যবহারিক কোর্স",
    subtitleBn:
      "বাস্তবভিত্তিক সিলেবাস, ১০টি পেশাদার প্রশিক্ষণ ট্র্যাক এবং সহজ আগ্রহ নিবন্ধনের সুবিধা।",
    ctaHref: "/courses",
    ctaLabelBn: "সকল কোর্স দেখুন",
    secondaryHref: "/services",
    secondaryLabelBn: "সকল সেবাসমূহ",
  },
  {
    id: "tax-vat-services",
    badgeBn: "সরাসরি WhatsApp সহায়তা",
    titleBn: "আয়কর, ভ্যাট ও মূসক কমপ্লায়েন্স সেবা এখন আরও সহজ",
    subtitleBn:
      "e-TIN, BIN নিবন্ধন, মূসক ৯.১ রিটার্ন এবং কর্পোরেট কমপ্লায়েন্সে দ্রুত পেশাদার সহায়তা।",
    ctaHref: "/services?category=income-tax-solutions",
    ctaLabelBn: "ট্যাক্স ও ভ্যাট সেবা",
    secondaryHref: "/services",
    secondaryLabelBn: "সকল সেবা দেখুন",
  },
  {
    id: "books-storefront",
    badgeBn: "প্রকাশনা ও রেফারেন্স বই",
    titleBn: "কোর্স ও সেবার সাথে সামঞ্জস্যপূর্ণ কমপ্লায়েন্স বইসমূহ",
    subtitleBn:
      "আয়কর, ভ্যাট, e-GP, RJSC ও ই-কমার্স সংক্রান্ত আসন্ন প্রকাশনার প্রিভিউ দেখুন ও আগ্রহ জানান।",
    ctaHref: "/books",
    ctaLabelBn: "সব বই প্রিভিউ দেখুন",
    secondaryHref: "/consultancy",
    secondaryLabelBn: "প্রকাশনা আগ্রহ জানান",
  },
  {
    id: "licensing-registration",
    badgeBn: "নিবন্ধন ও লাইসেন্সিং",
    titleBn: "ট্রেড লাইসেন্স, Smart RJSC, DIFE ও ফায়ার লাইসেন্স সহায়তা",
    subtitleBn:
      "সরকারি কর্তৃপক্ষের সঠিক তথ্যসূত্র, প্রয়োজনীয় নথিপত্র ও ধাপে ধাপে আবেদন নির্দেশিকা।",
    ctaHref: "/licensing",
    ctaLabelBn: "লাইসেন্সিং নির্দেশিকা",
    secondaryHref: "/tools",
    secondaryLabelBn: "ডকুমেন্ট চেকলিস্ট",
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
    animate(panel, {
      opacity: [0.65, 1],
      translateY: [8, 0],
      duration: MOTION_DURATIONS.standard,
      ease: MOTION_EASES.crisp,
    });
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
      className="relative bg-gradient-to-br from-[#F2EFF8] via-[#ECE7F5] to-[#E2D9F0] text-[#181D26] border-b border-[#D4CCE3] overflow-hidden"
    >
      {/* Subtle Executive Lavender radial glow & decorative gold curve edge */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(81,64,111,0.08),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(197,144,40,0.08),transparent_45%)] pointer-events-none"
      />

      <div className="ps-container relative py-5 sm:py-6 lg:py-7">
        <div className="min-h-[250px] lg:min-h-[300px] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Left Column — Editorial Value Proposition & Actions */}
          <div
            ref={textPanelRef}
            aria-live={isPaused ? "polite" : "off"}
            className="lg:col-span-7 space-y-3 sm:space-y-3.5"
          >
            <div className="flex items-center gap-2.5">
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
              <span className="text-xs sm:text-sm font-bold tracking-wide text-[#51406F]">
                {activeSlide.badgeBn}
              </span>
              <span className="text-xs text-[#596775] tabular-nums hidden sm:inline">
                · {activeIndex + 1}/{PROMO_SLIDES.length}
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

            <p className="text-sm sm:text-base text-[#181D26]/85 leading-relaxed max-w-xl">
              {activeSlide.subtitleBn}
            </p>

            {/* Primary & Secondary CTAs + Carousel Controls */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              <Link
                href={activeSlide.ctaHref}
                className="inline-flex items-center justify-center gap-2 min-h-11 px-5 py-2.5 rounded-[10px] bg-[#51406F] text-white font-semibold text-sm whitespace-nowrap shrink-0 hover:bg-[#3F315A] transition-colors duration-150 shadow-sm focus-visible:outline-3 focus-visible:outline-[#C59028] focus-visible:outline-offset-2"
              >
                <span>{activeSlide.ctaLabelBn}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>

              <Link
                href={activeSlide.secondaryHref}
                className="inline-flex items-center justify-center min-h-11 px-4 py-2.5 rounded-[10px] border border-[#51406F]/35 bg-white/90 text-[#081838] font-semibold text-sm whitespace-nowrap shrink-0 hover:bg-white hover:border-[#51406F] transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-[#C59028] focus-visible:outline-offset-2"
              >
                {activeSlide.secondaryLabelBn}
              </Link>
            </div>

            {/* Pagination Dots + Prev / Pause / Next */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-3 max-w-xl">
              <div
                className="flex items-center gap-1"
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
                      className="inline-flex items-center justify-center min-w-7 min-h-7 px-0.5 rounded-full cursor-pointer"
                    >
                      <span
                        className={cn(
                          "block h-2 rounded-full transition-all duration-150",
                          isCurrent
                            ? "w-6 bg-[#51406F]"
                            : "w-2 bg-[#A599C2]/70 hover:bg-[#51406F]/70",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="পূর্ববর্তী স্লাইড"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#D4CCE3] bg-white/95 text-[#081838] hover:border-[#51406F] hover:text-[#51406F] transition-colors duration-150 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  aria-pressed={isPaused}
                  aria-label="স্লাইডার অটোপ্লে থামান"
                  className="inline-flex items-center justify-center gap-1 h-9 px-3 rounded-[8px] border border-[#D4CCE3] bg-white/95 text-xs font-semibold text-[#081838] hover:border-[#51406F] hover:text-[#51406F] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>চালু</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>থামান</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  aria-label="পরবর্তী স্লাইড"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-[8px] border border-[#D4CCE3] bg-white/95 text-[#081838] hover:border-[#51406F] hover:text-[#51406F] transition-colors duration-150 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column — Interactive 3D Executive Knowledge Studio */}
          <div className="hidden sm:block lg:col-span-5">
            <LazyHeroStudio3D
              activeSlideIndex={activeIndex}
              logoAssetPath={logoAssetPath}
              brandName={brandName}
            />
          </div>
        </div>
      </div>

      {/* Subtle Deep Plum + Gold hairline progress bar */}
      {!prefersReducedMotion && !isPaused && !isHovered && !isFocused ? (
        <div
          key={`progress-${activeIndex}`}
          aria-hidden="true"
          className="h-0.5 w-full bg-gradient-to-r from-[#51406F] via-[#51406F] to-[#C59028] origin-left"
          style={{
            animation: `bcp-slide-progress ${AUTO_ADVANCE_MS}ms linear 1`,
          }}
        />
      ) : null}
    </section>
  );
}
