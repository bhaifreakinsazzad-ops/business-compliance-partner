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
import { cn } from "@/lib/utils";

interface PromoSlide {
  id: string;
  badgeBn: string;
  titleBn: string;
  subtitleBn: string;
  ctaHref: string;
  ctaLabelBn: string;
  imageSrc: string;
  imageAlt: string;
  accentTone: "gold" | "emerald";
}

const PROMO_SLIDES: PromoSlide[] = [
  {
    id: "ecosystem-overview",
    badgeBn: "Business Compliance Partner • বাংলাদেশ",
    titleBn: "ব্যবসা শুরু থেকে সফল পরিচালনা—সব সমাধান এক জায়গায়।",
    subtitleBn:
      "পেশাদার কোর্স, ট্যাক্স-ভ্যাট কমপ্লায়েন্স সেবা, লাইসেন্সিং ও বিশেষজ্ঞ পরামর্শের বিশ্বস্ত প্ল্যাটফর্ম।",
    ctaHref: "/courses",
    ctaLabelBn: "কোর্স ও সেবা দেখুন",
    imageSrc: "/brand/infographics/bcp-infographic-01-overview.jpg",
    imageAlt: "Business Compliance Partner প্ল্যাটফর্মের সমন্বিত ৪টি স্তম্ভের ওভারভিউ",
    accentTone: "gold",
  },
  {
    id: "professional-courses",
    badgeBn: "দক্ষতা উন্নয়ন ও প্রশিক্ষণ",
    titleBn: "Tax, VAT, e-GP, E-commerce ও RJSC ব্যবহারিক কোর্স",
    subtitleBn:
      "বাস্তবভিত্তিক সিলেবাস, পেশাদার প্রশিক্ষণ ট্র্যাক এবং সহজ আগ্রহ নিবন্ধনের সুবিধা।",
    ctaHref: "/courses",
    ctaLabelBn: "সকল কোর্স দেখুন",
    imageSrc: "/brand/infographics/bcp-infographic-02-learn.jpg",
    imageAlt: "BCP পেশাদার কোর্স ও প্রশিক্ষণ ট্র্যাকের ইনফোগ্রাফিক",
    accentTone: "gold",
  },
  {
    id: "tax-vat-services",
    badgeBn: "সরাসরি WhatsApp সহায়তা",
    titleBn: "আয়কর, ভ্যাট ও মূসক কমপ্লায়েন্স সেবা এখন আরও সহজ",
    subtitleBn:
      "e-TIN, BIN নিবন্ধন, মূসক ৯.১ রিটার্ন এবং কর্পোরেট কমপ্লায়েন্সে দ্রুত পেশাদার সহায়তা।",
    ctaHref: "/services?category=income-tax-solutions",
    ctaLabelBn: "ট্যাক্স ও ভ্যাট সেবা",
    imageSrc: "/brand/infographics/bcp-infographic-04-vat-mushak.jpg",
    imageAlt: "আয়কর ও ভ্যাট মূসক কমপ্লায়েন্স সেবার ইনফোগ্রাফিক",
    accentTone: "emerald",
  },
  {
    id: "licensing-registration",
    badgeBn: "নিবন্ধন ও লাইসেন্সিং",
    titleBn: "ট্রেড লাইসেন্স, Smart RJSC, DIFE ও ফায়ার লাইসেন্স সহায়তা",
    subtitleBn:
      "সরকারি কর্তৃপক্ষের সঠিক তথ্যসূত্র, প্রয়োজনীয় নথিপত্র ও ধাপে ধাপে আবেদন নির্দেশিকা।",
    ctaHref: "/licensing",
    ctaLabelBn: "লাইসেন্সিং নির্দেশিকা",
    imageSrc: "/brand/infographics/bcp-infographic-05-licensing.jpg",
    imageAlt: "ব্যবসায়িক লাইসেন্সিং ও নিবন্ধন সহায়তার ইনফোগ্রাফিক",
    accentTone: "gold",
  },
  {
    id: "professional-consultancy",
    badgeBn: "বিশেষজ্ঞ পরামর্শ",
    titleBn: "আপনার ব্যবসার জটিল কমপ্লায়েন্স সমস্যার সঠিক দিকনির্দেশনা",
    subtitleBn:
      "নতুন ব্যবসা শুরু থেকে সম্প্রসারণ—প্রতিটি ধাপে বাস্তবসম্মত ও স্বচ্ছ পরামর্শ।",
    ctaHref: "/consultancy",
    ctaLabelBn: "পরামর্শের অনুরোধ করুন",
    imageSrc: "/brand/infographics/bcp-infographic-06-consultancy.jpg",
    imageAlt: "বিশেষজ্ঞ ব্যবসায়িক কনসালটেন্সি সেবার ইনফোগ্রাফিক",
    accentTone: "emerald",
  },
];

const AUTO_ADVANCE_MS = 5500;

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
      opacity: [0.7, 1],
      translateY: [6, 0],
      duration: 200,
      ease: "outCubic",
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
      className="relative bg-ps-midnight text-ps-white border-b border-ps-gold/35 overflow-hidden"
    >
      {/* Subtle Brand Gradient Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(197,144,40,0.2),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(0,134,90,0.14),transparent_48%)] pointer-events-none"
      />

      <div className="ps-container relative py-2.5 sm:py-3.5">
        <div className="min-h-[126px] sm:min-h-[140px] lg:min-h-[150px] grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6 items-center">
          {/* Text Column — always renders immediately on SSR */}
          <div
            ref={textPanelRef}
            aria-live={isPaused ? "polite" : "off"}
            className="lg:col-span-8 space-y-1.5 sm:space-y-2"
          >
            <div className="flex items-center gap-2">
              {logoAssetPath ? (
                <Image
                  src={logoAssetPath}
                  alt={`${brandName} মাস্টার ব্যাজ`}
                  width={26}
                  height={26}
                  priority
                  referrerPolicy="no-referrer"
                  className="rounded-full border border-ps-gold/60 object-contain shrink-0"
                />
              ) : null}
              <span
                className={cn(
                  "text-xs font-semibold tracking-wide",
                  activeSlide.accentTone === "emerald"
                    ? "text-emerald-300"
                    : "text-[#f0cf7b]",
                )}
              >
                {activeSlide.badgeBn}
              </span>
              <span className="text-[11px] text-white/60 tabular-nums hidden sm:inline">
                · {activeIndex + 1}/{PROMO_SLIDES.length}
              </span>
            </div>

            {activeIndex === 0 ? (
              <h1 className="text-lg sm:text-xl lg:text-[1.6rem] font-extrabold leading-snug text-ps-white [text-wrap:balance] max-w-2xl">
                {activeSlide.titleBn}
              </h1>
            ) : (
              <>
                <h1 className="visually-hidden">
                  {PROMO_SLIDES[0]!.titleBn}
                </h1>
                <p className="text-lg sm:text-xl lg:text-[1.6rem] font-extrabold leading-snug text-ps-white [text-wrap:balance] max-w-2xl">
                  {activeSlide.titleBn}
                </p>
              </>
            )}

            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-2xl line-clamp-1 sm:line-clamp-2">
              {activeSlide.subtitleBn}
            </p>

            {/* Compact Inline Action + Slider Controls */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-3">
                <Link
                  href={activeSlide.ctaHref}
                  className="inline-flex items-center justify-center gap-1.5 min-h-9 px-3.5 py-1.5 rounded-[9px] bg-ps-gold text-ps-midnight font-bold text-xs sm:text-sm whitespace-nowrap shrink-0 hover:bg-[#f0cf7b] transition-colors duration-150"
                >
                  <span>{activeSlide.ctaLabelBn}</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>

                {/* Pagination Dots — 28px+ touch target for WCAG 2.2 AA SC 2.5.8 */}
                <div className="flex items-center gap-0.5" role="group" aria-label="স্লাইড নির্বাচন">
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
                            "block h-1.5 rounded-full transition-all duration-150",
                            isCurrent
                              ? "w-5 bg-ps-gold"
                              : "w-1.5 bg-white/40 hover:bg-white/75",
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prev / Pause / Next */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="পূর্ববর্তী স্লাইড"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] border border-white/20 bg-ps-navy/85 text-ps-white hover:border-ps-gold hover:text-ps-gold transition-colors duration-150 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  aria-pressed={isPaused}
                  aria-label={isPaused ? "স্লাইডার চালু করুন" : "স্লাইডার থামান"}
                  className="inline-flex items-center justify-center gap-1 h-8 px-2.5 rounded-[8px] border border-white/20 bg-ps-navy/85 text-xs font-medium text-ps-ivory hover:border-ps-gold hover:text-ps-gold transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-3 h-3" aria-hidden="true" />
                      <span>চালু</span>
                    </>
                  ) : (
                    <>
                      <Pause className="w-3 h-3" aria-hidden="true" />
                      <span>থামান</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  aria-label="পরবর্তী স্লাইড"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-[8px] border border-white/20 bg-ps-navy/85 text-ps-white hover:border-ps-gold hover:text-ps-gold transition-colors duration-150 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Slim Compact Visual Artwork Column — reserved dimensions prevent CLS */}
          <div className="hidden sm:flex lg:col-span-4 justify-end">
            <div className="relative w-full max-w-[340px] h-[118px] lg:h-[136px] rounded-[12px] overflow-hidden border border-ps-gold/45 bg-ps-navy/80 shadow-md">
              <Image
                src={activeSlide.imageSrc}
                alt={activeSlide.imageAlt}
                fill
                priority={activeIndex === 0}
                referrerPolicy="no-referrer"
                sizes="(max-width: 1024px) 320px, 340px"
                className="object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ps-midnight/45 via-transparent to-transparent pointer-events-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
