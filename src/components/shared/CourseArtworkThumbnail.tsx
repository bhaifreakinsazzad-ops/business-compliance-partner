import Image from "next/image";
import {
  BookOpen,
  Building2,
  Calculator,
  Globe2,
  GraduationCap,
  Landmark,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CourseArtworkThumbnailProps {
  categorySlug: string;
  categoryNameBn: string;
  badgeText: string;
  codeLabel: string;
  variant?: "featured" | "catalog";
}

interface ArtworkPalette {
  bgStyle: string;
  isDark: boolean;
  accentHex: string;
  pillTextClass: string;
  headlineClass: string;
  subTextClass: string;
  motifType: "tax" | "vat" | "egp" | "ecommerce" | "rjsc" | "customs" | "accounting" | "default";
}

const ARTWORK_MAP: Record<string, ArtworkPalette> = {
  "income-tax": {
    bgStyle:
      "from-[#EEF0FF] via-[#E2E3FF] to-[#C8CBFF] border-[#B8BBFF]/80",
    isDark: false,
    accentHex: "#243FBA",
    pillTextClass: "text-[#243FBA]",
    headlineClass: "text-[#081838]",
    subTextClass: "text-[#202D72]/80",
    motifType: "tax",
  },
  "vat-and-mushak": {
    bgStyle:
      "from-[#F6F7FF] via-[#E6E8FF] to-[#CFD1FF] border-[#B8BBFF]/80",
    isDark: false,
    accentHex: "#202D72",
    pillTextClass: "text-[#202D72]",
    headlineClass: "text-[#081838]",
    subTextClass: "text-[#243FBA]/85",
    motifType: "vat",
  },
  "egp-and-tender": {
    bgStyle:
      "from-[#0B1C42] via-[#172B68] to-[#243FBA] border-[#1D329B]",
    isDark: true,
    accentHex: "#DFB15B",
    pillTextClass: "text-[#DFB15B]",
    headlineClass: "text-white",
    subTextClass: "text-[#CCCEFF]",
    motifType: "egp",
  },
  "digital-business-ecommerce": {
    bgStyle:
      "from-[#FBFAFF] via-[#E2E3FF] to-[#D6D8FF] border-[#B8BBFF]/80",
    isDark: false,
    accentHex: "#243FBA",
    pillTextClass: "text-[#243FBA]",
    headlineClass: "text-[#081838]",
    subTextClass: "text-[#596775]",
    motifType: "ecommerce",
  },
  "company-secretarial": {
    bgStyle:
      "from-[#102454] via-[#202D72] to-[#2B46BA] border-[#202D72]",
    isDark: true,
    accentHex: "#DFB15B",
    pillTextClass: "text-[#DFB15B]",
    headlineClass: "text-white",
    subTextClass: "text-[#CCCEFF]",
    motifType: "rjsc",
  },
  "import-export-customs": {
    bgStyle:
      "from-[#F2F3FF] via-[#E2E3FF] to-[#C2C6FF] border-[#B8BBFF]/80",
    isDark: false,
    accentHex: "#202D72",
    pillTextClass: "text-[#202D72]",
    headlineClass: "text-[#081838]",
    subTextClass: "text-[#243FBA]/85",
    motifType: "customs",
  },
  accounting: {
    bgStyle:
      "from-[#FFFFFF] via-[#EEF0FF] to-[#CFD1FF] border-[#B8BBFF]/80",
    isDark: false,
    accentHex: "#243FBA",
    pillTextClass: "text-[#243FBA]",
    headlineClass: "text-[#081838]",
    subTextClass: "text-[#596775]",
    motifType: "accounting",
  },
};

const DEFAULT_ARTWORK: ArtworkPalette = {
  bgStyle: "from-[#F6F7FF] via-[#E2E3FF] to-[#CCCEFF] border-[#B8BBFF]/80",
  isDark: false,
  accentHex: "#243FBA",
  pillTextClass: "text-[#243FBA]",
  headlineClass: "text-[#081838]",
  subTextClass: "text-[#596775]",
  motifType: "default",
};

function getTrackIcon(type: ArtworkPalette["motifType"]) {
  switch (type) {
    case "tax":
      return Calculator;
    case "vat":
      return ReceiptText;
    case "egp":
      return Landmark;
    case "ecommerce":
      return ShoppingBag;
    case "rjsc":
      return Building2;
    case "customs":
      return Globe2;
    case "accounting":
      return BookOpen;
    default:
      return GraduationCap;
  }
}

export function CourseArtworkThumbnail({
  categorySlug,
  categoryNameBn,
  badgeText,
  codeLabel,
}: CourseArtworkThumbnailProps) {
  const artwork = ARTWORK_MAP[categorySlug] ?? DEFAULT_ARTWORK;
  const TrackIcon = getTrackIcon(artwork.motifType);

  return (
    <div
      className={cn(
        "relative aspect-video w-full bg-gradient-to-br overflow-hidden border-b p-4 flex flex-col justify-between select-none",
        artwork.bgStyle,
      )}
    >
      {/* Bespoke Geometric Architectural Backdrop (non-repetitive per track) */}
      <svg
        aria-hidden="true"
        viewBox="0 0 320 180"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id={`glow-${categorySlug}`} cx="85%" cy="18%" r="55%">
            <stop
              offset="0%"
              stopColor={artwork.isDark ? "#B8BBFF" : "#FFFFFF"}
              stopOpacity={artwork.isDark ? "0.24" : "0.85"}
            />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="180" fill={`url(#glow-${categorySlug})`} />
        {artwork.isDark ? (
          <>
            <circle cx="272" cy="148" r="76" fill="#FFFFFF" fillOpacity="0.06" />
            <circle cx="272" cy="148" r="52" stroke="#DFB15B" strokeOpacity="0.28" strokeWidth="1" fill="none" />
            <path d="M0 152 Q 120 116 320 144" stroke="#B8BBFF" strokeOpacity="0.24" strokeWidth="1.5" fill="none" />
          </>
        ) : (
          <>
            <circle cx="274" cy="142" r="70" fill="#243FBA" fillOpacity="0.07" />
            <circle cx="274" cy="142" r="46" stroke="#243FBA" strokeOpacity="0.18" strokeWidth="1" fill="none" />
            <path d="M-10 146 Q 115 110 330 140" stroke="#243FBA" strokeOpacity="0.14" strokeWidth="1.5" fill="none" />
          </>
        )}
      </svg>

      {/* Top Strip: Track Label + Official BCP Seal */}
      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <Image
            src="/brand/bcp-master-logo.png"
            alt=""
            width={22}
            height={22}
            referrerPolicy="no-referrer"
            className="rounded-full bg-white border border-[#C59028]/60 object-contain shrink-0"
          />
          <span
            className={cn(
              "font-en text-[10px] font-extrabold uppercase tracking-[0.13em]",
              artwork.pillTextClass,
            )}
            lang="en"
          >
            {badgeText}
          </span>
        </div>

        <span
          className={cn(
            "inline-flex items-center justify-center w-8 h-8 rounded-[10px] shadow-xs",
            artwork.isDark
              ? "bg-white/14 text-[#DFB15B] border border-white/15"
              : "bg-white/90 text-[#243FBA] border border-[#B8BBFF]",
          )}
        >
          <TrackIcon className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>

      {/* Bottom Artwork Frame: Track Heading & Reference Code */}
      <div className="relative z-10 space-y-1 max-w-[85%]">
        <p
          className={cn(
            "text-sm sm:text-[15px] font-extrabold leading-snug line-clamp-2",
            artwork.headlineClass,
          )}
        >
          {categoryNameBn}
        </p>
        <p
          className={cn(
            "font-en text-[10px] font-bold uppercase tracking-widest",
            artwork.subTextClass,
          )}
          lang="en"
        >
          {codeLabel} · Practical Track
        </p>
      </div>
    </div>
  );
}
