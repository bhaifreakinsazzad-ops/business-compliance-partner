"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { animate, set, type JSAnimation } from "animejs";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Pause,
  Play,
  ShieldCheck,
} from "lucide-react";
import {
  getCircularSlideOffset,
  getCoverflowSlideGeometry,
  wrapSlideIndex,
} from "@/lib/home/coverflow";
import { resolveHeroSlideAsset } from "@/lib/config/media-manifest";
import { PrimaryBusinessActions } from "@/components/home/PrimaryBusinessActions";
import { cn } from "@/lib/utils";

interface PromoSlide {
  id:
    | "ecosystem-overview"
    | "professional-courses"
    | "tax-vat-services"
    | "books-storefront";
  orderCode: string;
  badgeBn: string;
  titleBn: string;
  subtitleBn: string;
  ctaHref: string;
  ctaLabelBn: string;
  secondaryHref: string;
  secondaryLabelBn: string;
  visualTagEn: string;
  visualTone: "overview" | "courses" | "services" | "books";
  posterTheme: {
    canvasClass: string;
    scrimClass: string;
    isDark: boolean;
  };
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
    ctaHref: "/courses",
    ctaLabelBn: "কোর্সসমূহ দেখুন",
    secondaryHref: "/services",
    secondaryLabelBn: "সেবাসমূহ দেখুন",
    visualTagEn: "ONE PARTNER · COMPLETE SOLUTIONS",
    visualTone: "overview",
    posterTheme: {
      canvasClass: "bg-[#F5F6FF] text-[#081838] border-[#B8BBFF]",
      scrimClass:
        "bg-gradient-to-b from-white/95 via-[#F4F5FF]/90 to-[#E2E3FF]/55 md:bg-gradient-to-r md:from-white/96 md:via-[#F4F5FF]/88 md:to-transparent",
      isDark: false,
    },
  },
  {
    id: "professional-courses",
    orderCode: "02",
    badgeBn: "01 · Courses — দক্ষতা উন্নয়ন ও প্রশিক্ষণ",
    titleBn: "Tax, VAT, e-GP, E-commerce ও RJSC ব্যবহারিক কোর্স",
    subtitleBn:
      "পেশাদার দক্ষতা অর্জন করুন এবং নিজেকে প্রস্তুত করুন—১০টি ব্যবহারিক প্রশিক্ষণ ট্র্যাক ও স্পষ্ট সিলেবাস।",
    ctaHref: "/courses",
    ctaLabelBn: "Explore Courses",
    secondaryHref: "/consultancy?pillar=COURSES",
    secondaryLabelBn: "আগ্রহ নিবন্ধন",
    visualTagEn: "01 · COURSES GATEWAY",
    visualTone: "courses",
    posterTheme: {
      canvasClass: "bg-[#0B1C42] text-white border-[#243FBA]",
      scrimClass:
        "bg-gradient-to-b from-[#081838]/95 via-[#102454]/85 to-[#202D72]/55 md:bg-gradient-to-r md:from-[#081838]/96 md:via-[#102454]/84 md:to-transparent",
      isDark: true,
    },
  },
  {
    id: "tax-vat-services",
    orderCode: "03",
    badgeBn: "02 · Services — পেশাদার ও লাইসেন্সিং সহায়তা",
    titleBn: "আয়কর, ভ্যাট, Smart RJSC ও ব্যবসার লাইসেন্সিং সেবা",
    subtitleBn:
      "ব্যবসার প্রয়োজনীয় পেশাদার সহায়তা ও সমাধান নিন—সরাসরি পরামর্শ ও WhatsApp সহায়তা।",
    ctaHref: "/services",
    ctaLabelBn: "Explore Services",
    secondaryHref: "/licensing",
    secondaryLabelBn: "লাইসেন্সিং নির্দেশিকা",
    visualTagEn: "02 · SERVICES GATEWAY",
    visualTone: "services",
    posterTheme: {
      canvasClass: "bg-[#F4F5FF] text-[#081838] border-[#B8BBFF]",
      scrimClass:
        "bg-gradient-to-b from-white/95 via-[#F4F5FF]/90 to-[#E2E3FF]/55 md:bg-gradient-to-r md:from-white/96 md:via-[#F4F5FF]/88 md:to-transparent",
      isDark: false,
    },
  },
  {
    id: "books-storefront",
    orderCode: "04",
    badgeBn: "03 · Books — প্রকাশনা ও রেফারেন্স বইসমূহ",
    titleBn: "ব্যবহারিক কমপ্লায়েন্স হ্যান্ডবুক ও প্রকাশনা মার্কেটপ্লেস",
    subtitleBn:
      "প্রয়োজনীয় বই ও প্রকাশনার মাধ্যমে আপনার কমপ্লায়েন্স জ্ঞান সমৃদ্ধ করুন—আয়কর, ভ্যাট ও কর্পোরেট গাইড।",
    ctaHref: "/books",
    ctaLabelBn: "Explore Books",
    secondaryHref: "/contact",
    secondaryLabelBn: "যোগাযোগ করুন",
    visualTagEn: "03 · BOOKS MARKETPLACE",
    visualTone: "books",
    posterTheme: {
      canvasClass: "bg-[#0B1C42] text-white border-[#202D72]",
      scrimClass:
        "bg-gradient-to-b from-[#081838]/95 via-[#132556]/85 to-[#202D72]/50 md:bg-gradient-to-r md:from-[#081838]/96 md:via-[#132556]/82 md:to-transparent",
      isDark: true,
    },
  },
];

const AUTO_ADVANCE_MS = 6500;
const TRANSITION_MS = 620;

interface PromotionalHeroSliderProps {
  logoAssetPath: string;
  brandName: string;
}

export function PromotionalHeroSlider({
  logoAssetPath,
  brandName,
}: PromotionalHeroSliderProps) {
  void logoAssetPath;
  void brandName;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isCompactViewport, setIsCompactViewport] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slideAnimationsRef = useRef<JSAnimation[]>([]);
  const progressBarRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const progressAnimRef = useRef<JSAnimation | null>(null);
  const elapsedMsRef = useRef<number>(0);
  const lastCycleIndexRef = useRef<number>(0);
  const prevOffsetsRef = useRef<number[]>(
    PROMO_SLIDES.map((_, idx) =>
      getCircularSlideOffset(idx, 0, PROMO_SLIDES.length),
    ),
  );
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const motionMedia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const viewportMedia = window.matchMedia("(max-width: 767px)");

    setPrefersReducedMotion(motionMedia.matches);
    setIsCompactViewport(viewportMedia.matches);
    setIsDocumentHidden(document.hidden);

    const onMotionChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    const onViewportChange = (e: MediaQueryListEvent) =>
      setIsCompactViewport(e.matches);
    const onVisibilityChange = () => setIsDocumentHidden(document.hidden);

    motionMedia.addEventListener("change", onMotionChange);
    viewportMedia.addEventListener("change", onViewportChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      motionMedia.removeEventListener("change", onMotionChange);
      viewportMedia.removeEventListener("change", onViewportChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const goTo = useCallback((nextIndex: number) => {
    setActiveIndex(wrapSlideIndex(nextIndex, PROMO_SLIDES.length));
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => wrapSlideIndex(prev + 1, PROMO_SLIDES.length));
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => wrapSlideIndex(prev - 1, PROMO_SLIDES.length));
  }, []);

  const autoPlaySuspended =
    prefersReducedMotion ||
    isPaused ||
    isHovered ||
    isFocused ||
    isDocumentHidden;

  // Synchronized autoplay timer + Anime.js elapsed progress bar that freezes accurately on pause/hover/focus
  useEffect(() => {
    progressAnimRef.current?.cancel();
    progressAnimRef.current = null;

    if (lastCycleIndexRef.current !== activeIndex) {
      elapsedMsRef.current = 0;
      lastCycleIndexRef.current = activeIndex;
    }

    for (let i = 0; i < PROMO_SLIDES.length; i += 1) {
      const bar = progressBarRefs.current[i];
      if (!bar) continue;
      if (i !== activeIndex) {
        set(bar, { scaleX: 0 });
      }
    }

    const activeBar = progressBarRefs.current[activeIndex];
    const startRatio = Math.min(1, Math.max(0, elapsedMsRef.current / AUTO_ADVANCE_MS));

    if (autoPlaySuspended) {
      if (activeBar) {
        set(activeBar, { scaleX: prefersReducedMotion ? 1 : startRatio });
      }
      return;
    }

    const remainingMs = Math.max(80, AUTO_ADVANCE_MS - elapsedMsRef.current);
    const startedAt = performance.now();

    if (activeBar) {
      set(activeBar, { scaleX: startRatio });
      progressAnimRef.current = animate(activeBar, {
        scaleX: [startRatio, 1],
        duration: remainingMs,
        ease: "linear",
      });
    }

    const timer = window.setTimeout(() => {
      elapsedMsRef.current = 0;
      setActiveIndex((prev) => wrapSlideIndex(prev + 1, PROMO_SLIDES.length));
    }, remainingMs);

    return () => {
      window.clearTimeout(timer);
      const ranMs = Math.max(0, performance.now() - startedAt);
      elapsedMsRef.current = Math.min(AUTO_ADVANCE_MS, elapsedMsRef.current + ranMs);
      progressAnimRef.current?.cancel();
      progressAnimRef.current = null;
      if (activeBar) {
        set(activeBar, {
          scaleX: Math.min(1, elapsedMsRef.current / AUTO_ADVANCE_MS),
        });
      }
    };
  }, [activeIndex, autoPlaySuspended, prefersReducedMotion]);

  // Interruptible Anime.js 3D coverflow transforms
  useEffect(() => {
    const newOffsets = PROMO_SLIDES.map((_, idx) =>
      getCircularSlideOffset(idx, activeIndex, PROMO_SLIDES.length),
    );

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      prevOffsetsRef.current = newOffsets;
      PROMO_SLIDES.forEach((_, idx) => {
        const el = slideRefs.current[idx];
        if (!el) return;
        const geom = getCoverflowSlideGeometry(
          newOffsets[idx] ?? 0,
          isCompactViewport,
        );
        set(el, {
          translateX: `${geom.translateXPercent}%`,
          rotateY: geom.rotateYDeg,
          scale: geom.scale,
          opacity: geom.opacity,
        });
      });
      return;
    }

    slideAnimationsRef.current.forEach((anim) => anim.cancel());
    slideAnimationsRef.current = [];

    const prevOffsets = prevOffsetsRef.current;

    PROMO_SLIDES.forEach((_, idx) => {
      const el = slideRefs.current[idx];
      if (!el) return;

      const prevOffset = prevOffsets[idx] ?? 0;
      const nextOffset = newOffsets[idx] ?? 0;
      const geom = getCoverflowSlideGeometry(nextOffset, isCompactViewport);

      if (prefersReducedMotion) {
        set(el, {
          translateX: `${geom.translateXPercent}%`,
          rotateY: geom.rotateYDeg,
          scale: geom.scale,
          opacity: geom.opacity,
        });
        return;
      }

      if (Math.abs(prevOffset) > 1 && Math.abs(nextOffset) === 1) {
        const entrySign = nextOffset < 0 ? -1 : 1;
        set(el, {
          translateX: `${entrySign * 124}%`,
          rotateY: entrySign * -20,
          scale: 0.74,
          opacity: 0,
        });
      }

      const anim = animate(el, {
        translateX: `${geom.translateXPercent}%`,
        rotateY: geom.rotateYDeg,
        scale: geom.scale,
        opacity: geom.opacity,
        duration: TRANSITION_MS,
        ease: "outCubic",
      });
      slideAnimationsRef.current.push(anim);
    });

    prevOffsetsRef.current = newOffsets;

    return () => {
      slideAnimationsRef.current.forEach((anim) => anim.cancel());
      slideAnimationsRef.current = [];
    };
  }, [activeIndex, isCompactViewport, prefersReducedMotion]);

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
      className="bcp-reference-hero relative text-[#181D26] border-b border-[#E1E4F2] overflow-x-clip"
    >
      {/* Keep a single semantic, screen-reader-safe H1 because hero artwork renders campaign typography natively */}
      <h1 className="visually-hidden">
        {PROMO_SLIDES[0]!.titleBn} — {activeSlide.badgeBn}
      </h1>

      <div className="pt-4 pb-6 sm:pt-7 sm:pb-8 space-y-5 sm:space-y-6">
        {/* 3D Perspective Coverflow Stage */}
        <div
          className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 py-2 overflow-hidden"
          data-coverflow-stage="true"
        >
          {/* Central 16:9 Stage Reference Box preserving full-bleed banner artwork proportions */}
          <div
            className="relative mx-auto w-[90%] sm:w-[82%] md:w-[76%] lg:w-[64%] max-w-[900px] aspect-[16/9]"
            style={{
              perspective: "1350px",
              transformStyle: "preserve-3d",
            }}
          >
            {PROMO_SLIDES.map((slide, idx) => {
              const offset = getCircularSlideOffset(
                idx,
                activeIndex,
                PROMO_SLIDES.length,
              );
              const geom = getCoverflowSlideGeometry(offset, isCompactViewport);
              const isActive = offset === 0;
              const isNeighbor = Math.abs(offset) === 1;
              const heroAsset = resolveHeroSlideAsset(slide.id);
              const SlideVisualIcon =
                slide.visualTone === "courses"
                  ? GraduationCap
                  : slide.visualTone === "services"
                    ? BriefcaseBusiness
                    : slide.visualTone === "books"
                      ? BookOpen
                      : ShieldCheck;

              const initialStyle: CSSProperties = {
                zIndex: geom.zIndex,
                transform: `translate3d(${geom.translateXPercent}%, 0, 0) rotateY(${geom.rotateYDeg}deg) scale(${geom.scale})`,
                opacity: geom.opacity,
              };

              return (
                <div
                  key={slide.id}
                  ref={(el) => {
                    slideRefs.current[idx] = el;
                  }}
                  data-coverflow-slide={slide.id}
                  data-coverflow-role={geom.role}
                  aria-hidden={!isActive}
                  onClick={() => {
                    if (isNeighbor) goTo(idx);
                  }}
                  style={initialStyle}
                  className={cn(
                    "absolute inset-0 rounded-[16px] sm:rounded-[22px] will-change-transform origin-center overflow-hidden border border-[#B8BBFF] bg-[#F5F6FF] shadow-[0_22px_54px_rgba(32,45,114,0.16)]",
                    isActive
                      ? "ring-2 ring-[#B8BBFF]/85"
                      : isNeighbor
                        ? "cursor-pointer"
                        : "pointer-events-none",
                  )}
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={heroAsset.publicPath}
                      alt={isActive ? heroAsset.altBn : ""}
                      fill
                      sizes="(max-width: 767px) 90vw, 900px"
                      priority={idx === 0}
                      loading={idx === 0 ? undefined : "eager"}
                      referrerPolicy="no-referrer"
                      className="object-cover object-center pointer-events-none select-none"
                    />

                    {/* Assistive text description matching the baked-in campaign banner */}
                    <span className="visually-hidden">
                      {slide.titleBn} — {slide.subtitleBn}
                    </span>

                    {/* Compact Bottom Action Strip sitting unobtrusively along the lower margin */}
                    <div
                      data-hero-cta-strip={slide.id}
                      className={cn(
                        "absolute inset-x-0 bottom-0 z-10 px-2.5 py-1.5 sm:px-5 sm:py-2.5 bg-white/88 backdrop-blur-md border-t border-[#B8BBFF]/70 flex items-center justify-between gap-2",
                        !isActive && "pointer-events-none",
                      )}
                    >
                      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                        <Link
                          href={slide.ctaHref}
                          tabIndex={isActive ? 0 : -1}
                          className="inline-flex items-center justify-center gap-1 sm:gap-1.5 min-h-7 sm:min-h-9 px-2.5 sm:px-4 rounded-[8px] sm:rounded-[10px] font-bold text-[11px] sm:text-xs md:text-sm whitespace-nowrap transition-colors shadow-xs bg-[#243FBA] text-white hover:bg-[#1D329B]"
                        >
                          <span>{slide.ctaLabelBn}</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true" />
                        </Link>

                        <Link
                          href={slide.secondaryHref}
                          tabIndex={isActive ? 0 : -1}
                          className="inline-flex items-center justify-center min-h-7 sm:min-h-9 px-2.5 sm:px-3.5 rounded-[8px] sm:rounded-[10px] border border-[#B8BBFF] bg-white/95 text-[#202D72] hover:bg-[#E2E3FF] font-semibold text-[11px] sm:text-xs md:text-sm whitespace-nowrap transition-colors"
                        >
                          {slide.secondaryLabelBn}
                        </Link>
                      </div>

                      <span className="hidden sm:inline-flex items-center gap-1.5 font-en text-[11px] font-extrabold tabular-nums px-2.5 py-1 rounded-md bg-[#E2E3FF]/85 text-[#243FBA] shrink-0">
                        <SlideVisualIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>
                          {slide.orderCode} / 0{PROMO_SLIDES.length}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Primary Circular Edge Navigation Arrows positioned directly on active banner edges */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="পূর্ববর্তী স্লাইড"
              data-carousel-prev="true"
              className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-6 z-40 inline-flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/95 border border-[#B8BBFF] text-[#243FBA] hover:bg-[#243FBA] hover:text-white hover:border-[#243FBA] shadow-[0_10px_24px_rgba(32,45,114,0.18)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="পরবর্তী স্লাইড"
              data-carousel-next="true"
              className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-6 z-40 inline-flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white/95 border border-[#B8BBFF] text-[#243FBA] hover:bg-[#243FBA] hover:text-white hover:border-[#243FBA] shadow-[0_10px_24px_rgba(32,45,114,0.18)] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Unified Lower Controls -> Tagline -> Compact Gateway Buttons */}
        <div className="ps-container space-y-4 sm:space-y-5">
          {/* Segmented Progress Bar + Counter + Pause/Play Control */}
          <div className="flex justify-center">
            <div
              aria-live={isPaused ? "polite" : "off"}
              className="inline-flex items-center justify-center gap-2.5 sm:gap-3.5 rounded-full border border-[#B8BBFF]/90 bg-white/92 px-3.5 sm:px-5 py-1.5 sm:py-2 shadow-sm max-w-full"
            >
              <span
                data-slide-counter="true"
                className="font-en text-xs font-extrabold text-[#243FBA] tabular-nums whitespace-nowrap"
              >
                {activeSlide.orderCode}
                <span className="text-[#596775] mx-1">—</span>
                0{PROMO_SLIDES.length}
              </span>

              <div
                className="flex items-center gap-1.5 sm:gap-2"
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
                          "relative block h-1.5 rounded-full overflow-hidden transition-all duration-200 bg-[#CFD1FF]",
                          isCurrent ? "w-8 sm:w-14" : "w-4 sm:w-8 hover:bg-[#B8BBFF]",
                        )}
                        aria-hidden="true"
                      >
                        <span
                          ref={(el) => {
                            progressBarRefs.current[idx] = el;
                          }}
                          data-slide-progress={slide.id}
                          className="absolute inset-0 origin-left bg-[#243FBA] rounded-full"
                          style={{
                            transform: "scaleX(0)",
                          }}
                        />
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                aria-pressed={isPaused}
                aria-label={isPaused ? "স্লাইডার চালু করুন" : "স্লাইডার থামান"}
                className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#B8BBFF] bg-[#E2E3FF] text-[#243FBA] hover:bg-[#243FBA] hover:text-white transition-colors cursor-pointer shrink-0"
              >
                {isPaused ? (
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Reference Tagline Divider */}
          <div className="flex items-center justify-center gap-3 w-full max-w-2xl mx-auto">
            <span
              className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent to-[#243FBA]/50"
              aria-hidden="true"
            />
            <p
              className="font-en text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#202D72] text-center"
              lang="en"
            >
              One Partner · Complete Solutions · Confident Growth
            </p>
            <span
              className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent to-[#243FBA]/50"
              aria-hidden="true"
            />
          </div>

          {/* Integrated Three Compact Periwinkle Gateways: Courses -> Services -> Books */}
          <PrimaryBusinessActions embedded />
        </div>
      </div>
    </section>
  );
}
