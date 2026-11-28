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
  CheckCircle2,
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
import { PrimaryBusinessActions } from "@/components/home/PrimaryBusinessActions";
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
  visualTone: "overview" | "courses" | "services" | "books";
  posterTheme: {
    canvasClass: string;
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
    highlightsBn: [
      "দক্ষতা উন্নয়নে ব্যবহারিক Courses",
      "ব্যবসার জন্য পেশাদার Services",
      "অফিসিয়াল রেফারেন্স Books",
    ],
    ctaHref: "/courses",
    ctaLabelBn: "কোর্সসমূহ দেখুন",
    secondaryHref: "/services",
    secondaryLabelBn: "সেবাসমূহ দেখুন",
    visualTagEn: "ONE PARTNER · COMPLETE SOLUTIONS",
    visualTone: "overview",
    posterTheme: {
      canvasClass:
        "from-[#FFFFFF] via-[#F4F5FF] to-[#E2E3FF] text-[#081838] border-[#B8BBFF]",
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
    highlightsBn: [
      "আয়কর ও কর্পোরেট ট্যাক্স রিটার্ন",
      "ভ্যাট ও মূসক ৯.১ অনলাইন দাখিল",
      "BPPA e-GP দরপত্র ও ই-কমার্স DBID",
    ],
    ctaHref: "/courses",
    ctaLabelBn: "Explore Courses",
    secondaryHref: "/consultancy?pillar=COURSES",
    secondaryLabelBn: "আগ্রহ নিবন্ধন",
    visualTagEn: "01 · COURSES GATEWAY",
    visualTone: "courses",
    posterTheme: {
      canvasClass:
        "from-[#102454] via-[#1B337A] to-[#243FBA] text-white border-[#243FBA]",
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
    visualTone: "services",
    posterTheme: {
      canvasClass:
        "from-[#F7F8FF] via-[#EAECFF] to-[#CFD1FF] text-[#081838] border-[#B8BBFF]",
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
    visualTone: "books",
    posterTheme: {
      canvasClass:
        "from-[#0B1C42] via-[#202D72] to-[#2B46BA] text-white border-[#202D72]",
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

  // Synchronized autoplay timer + Anime.js elapsed progress bar
  useEffect(() => {
    progressAnimRef.current?.cancel();
    progressAnimRef.current = null;

    const activeBar = progressBarRefs.current[activeIndex];
    for (let i = 0; i < PROMO_SLIDES.length; i += 1) {
      const bar = progressBarRefs.current[i];
      if (!bar) continue;
      if (i !== activeIndex) {
        set(bar, { scaleX: 0 });
      }
    }

    if (autoPlaySuspended) {
      if (activeBar) {
        set(activeBar, { scaleX: 1 });
      }
      return;
    }

    if (activeBar) {
      progressAnimRef.current = animate(activeBar, {
        scaleX: [0, 1],
        duration: AUTO_ADVANCE_MS,
        ease: "linear",
      });
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => wrapSlideIndex(prev + 1, PROMO_SLIDES.length));
    }, AUTO_ADVANCE_MS);

    return () => {
      window.clearInterval(timer);
      progressAnimRef.current?.cancel();
      progressAnimRef.current = null;
    };
  }, [activeIndex, autoPlaySuspended]);

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

      // When a slide wraps from offscreen/opposite wing into prev (-1) or next (+1),
      // position it just outside its entering edge before gliding in so it never crosses center.
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
      {/* Keep a single semantic, screen-reader-safe H1 when browsing slides 02–04 */}
      {activeIndex !== 0 ? (
        <h1 className="visually-hidden">{PROMO_SLIDES[0]!.titleBn}</h1>
      ) : null}

      <div className="pt-4 pb-6 sm:pt-7 sm:pb-8 space-y-5 sm:space-y-6">
        {/* 3D Perspective Coverflow Stage */}
        <div
          className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-6 py-2 overflow-hidden"
          data-coverflow-stage="true"
        >
          {/* Central 16:9 Stage Reference Box + Left/Right Circular Edge Arrows */}
          <div
            className="relative mx-auto w-[88%] sm:w-[76%] md:w-[68%] lg:w-[64%] max-w-[900px] min-h-[272px] sm:min-h-0 sm:aspect-[16/9]"
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
                    "absolute inset-0 rounded-[20px] sm:rounded-[24px] will-change-transform origin-center overflow-hidden border bg-gradient-to-br shadow-[0_22px_54px_rgba(32,45,114,0.16)]",
                    slide.posterTheme.canvasClass,
                    isActive
                      ? "ring-2 ring-[#B8BBFF]/80"
                      : isNeighbor
                        ? "cursor-pointer"
                        : "pointer-events-none",
                  )}
                >
                  {/* Bespoke Graphical Banner Composition */}
                  <div className="relative h-full w-full px-6 py-4 sm:px-9 sm:py-7 lg:px-11 lg:py-9 flex flex-col justify-between">
                    {/* Subtle SVG Graphical Mesh Decoration */}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 800 450"
                      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
                      preserveAspectRatio="xMidYMid slice"
                    >
                      <circle
                        cx="720"
                        cy="60"
                        r="190"
                        fill={slide.posterTheme.isDark ? "#B8BBFF" : "#243FBA"}
                        fillOpacity={slide.posterTheme.isDark ? "0.14" : "0.08"}
                      />
                      <circle
                        cx="680"
                        cy="380"
                        r="150"
                        stroke="#DFB15B"
                        strokeOpacity={slide.posterTheme.isDark ? "0.35" : "0.28"}
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path
                        d="M0 390 Q 260 320 800 375"
                        stroke={slide.posterTheme.isDark ? "#B8BBFF" : "#243FBA"}
                        strokeOpacity="0.16"
                        strokeWidth="2"
                        fill="none"
                      />
                    </svg>

                    {/* Banner Top Row: BCP Official Circular Badge + Division Tag + Slide Index */}
                    <div className="relative z-10 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-2 sm:gap-2.5">
                        {logoAssetPath ? (
                          <Image
                            src={logoAssetPath}
                            alt={`${brandName} অফিসিয়াল ব্যাজ`}
                            width={34}
                            height={34}
                            priority={idx <= 1}
                            referrerPolicy="no-referrer"
                            className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border border-[#C59028]/80 bg-white object-contain shrink-0 shadow-xs"
                          />
                        ) : null}
                        <span
                          className={cn(
                            "text-[11px] sm:text-xs font-extrabold tracking-wide",
                            slide.posterTheme.isDark
                              ? "text-[#DFB15B]"
                              : "text-[#243FBA]",
                          )}
                        >
                          {slide.badgeBn}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "hidden sm:inline-flex items-center gap-1.5 font-en text-[11px] font-bold uppercase tracking-[0.14em]",
                          slide.posterTheme.isDark
                            ? "text-[#CCCEFF]"
                            : "text-[#202D72]/75",
                        )}
                        lang="en"
                      >
                        <SlideVisualIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{slide.visualTagEn}</span>
                      </span>
                    </div>

                    {/* Banner Center Split: Strong Bengali Headline + Structured Highlight Tiles */}
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5 items-center my-auto py-1">
                      <div className="md:col-span-7 space-y-2 sm:space-y-3">
                        {idx === 0 && isActive ? (
                          <h1
                            className={cn(
                              "text-lg sm:text-2xl lg:text-[1.85rem] xl:text-[2.05rem] font-extrabold leading-[1.24] [text-wrap:balance]",
                              slide.posterTheme.isDark
                                ? "text-white"
                                : "text-[#081838]",
                            )}
                          >
                            {slide.titleBn}
                          </h1>
                        ) : (
                          <p
                            className={cn(
                              "text-lg sm:text-2xl lg:text-[1.85rem] xl:text-[2.05rem] font-extrabold leading-[1.24] [text-wrap:balance]",
                              slide.posterTheme.isDark
                                ? "text-white"
                                : "text-[#081838]",
                            )}
                          >
                            {slide.titleBn}
                          </p>
                        )}

                        <p
                          className={cn(
                            "text-xs sm:text-sm leading-relaxed line-clamp-2 max-w-xl",
                            slide.posterTheme.isDark
                              ? "text-[#CCCEFF]"
                              : "text-[#596775]",
                          )}
                        >
                          {slide.subtitleBn}
                        </p>
                      </div>

                      {/* Right Graphical Highlights Panel (matches poster artwork blocks) */}
                      <div className="hidden md:flex md:col-span-5 flex-col gap-2">
                        {slide.highlightsBn.map((point) => (
                          <div
                            key={point}
                            className={cn(
                              "flex items-center gap-2.5 rounded-[12px] px-3.5 py-2.5 border text-xs font-semibold shadow-xs",
                              slide.posterTheme.isDark
                                ? "bg-white/10 border-white/15 text-white"
                                : "bg-white/90 border-[#B8BBFF]/80 text-[#081838]",
                            )}
                          >
                            <CheckCircle2
                              className={cn(
                                "w-4 h-4 shrink-0",
                                slide.posterTheme.isDark
                                  ? "text-[#DFB15B]"
                                  : "text-[#243FBA]",
                              )}
                              aria-hidden="true"
                            />
                            <span className="line-clamp-1">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Banner Bottom Action Strip (only active slide interactive via keyboard) */}
                    <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 pt-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <Link
                          href={slide.ctaHref}
                          tabIndex={isActive ? 0 : -1}
                          className={cn(
                            "inline-flex items-center justify-center gap-1.5 min-h-9 sm:min-h-10 px-4 sm:px-5 rounded-[10px] font-bold text-xs sm:text-sm whitespace-nowrap transition-colors shadow-sm",
                            slide.posterTheme.isDark
                              ? "bg-white text-[#081838] hover:bg-[#E2E3FF]"
                              : "bg-[#243FBA] text-white hover:bg-[#1D329B]",
                          )}
                        >
                          <span>{slide.ctaLabelBn}</span>
                          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                        </Link>

                        <Link
                          href={slide.secondaryHref}
                          tabIndex={isActive ? 0 : -1}
                          className={cn(
                            "inline-flex items-center justify-center min-h-9 sm:min-h-10 px-3.5 sm:px-4 rounded-[10px] border font-semibold text-xs sm:text-sm whitespace-nowrap transition-colors",
                            slide.posterTheme.isDark
                              ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                              : "border-[#B8BBFF] bg-white/85 text-[#202D72] hover:bg-[#E2E3FF]",
                          )}
                        >
                          {slide.secondaryLabelBn}
                        </Link>
                      </div>

                      <span
                        className={cn(
                          "hidden sm:inline-block font-en text-xs font-extrabold tabular-nums",
                          slide.posterTheme.isDark
                            ? "text-[#DFB15B]"
                            : "text-[#243FBA]",
                        )}
                      >
                        {slide.orderCode} / 0{PROMO_SLIDES.length}
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
                          className="absolute inset-0 origin-left bg-[#243FBA] rounded-full"
                          style={{
                            transform: isCurrent ? "scaleX(0)" : "scaleX(0)",
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
