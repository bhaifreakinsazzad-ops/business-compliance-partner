"use client";

import dynamic from "next/dynamic";
import Image from "next/image";

interface LazyHeroStudio3DProps {
  activeSlideIndex: number;
  logoAssetPath: string;
  brandName: string;
}

function StaticHeroStudioPreview({
  logoAssetPath,
  brandName,
}: {
  logoAssetPath: string;
  brandName: string;
}) {
  return (
    <div
      className="w-full h-[220px] sm:h-[250px] lg:h-[290px] rounded-[16px] border border-[#D4CCE3] bg-gradient-to-br from-white/95 via-[#F2EFF8] to-[#DDD6EB]/75 p-5 flex items-center justify-between gap-4 shadow-sm"
      aria-hidden="true"
    >
      <div className="space-y-2.5 min-w-0">
        {logoAssetPath ? (
          <Image
            src={logoAssetPath}
            alt={`${brandName} official mark`}
            width={52}
            height={52}
            priority
            referrerPolicy="no-referrer"
            className="rounded-full border border-[#C59028]/60 bg-white object-contain"
          />
        ) : null}
        <p className="font-editorial text-lg font-bold text-[#081838] leading-tight">
          Executive Knowledge Studio
        </p>
        <p className="text-xs text-[#596775]">
          Income Tax · VAT & Mushak · e-GP · RJSC
        </p>
      </div>
      <div className="space-y-1.5 w-36 sm:w-44 shrink-0">
        {[
          { label: "Income Tax", bg: "#081838" },
          { label: "VAT & Mushak", bg: "#3F315A" },
          { label: "RJSC & Company Law", bg: "#0E224A" },
          { label: "e-GP & Tender", bg: "#51406F" },
          { label: "E-commerce", bg: "#1B2E59" },
        ].map((spine) => (
          <div
            key={spine.label}
            className="px-3 py-1.5 rounded-[6px] text-[10px] font-semibold text-white border-s-2 border-[#C59028] truncate shadow-xs"
            style={{ backgroundColor: spine.bg }}
          >
            {spine.label}
          </div>
        ))}
      </div>
    </div>
  );
}

const HeroKnowledgeStudio3D = dynamic(
  () =>
    import("@/components/three/HeroKnowledgeStudio3D").then(
      (mod) => mod.HeroKnowledgeStudio3D,
    ),
  {
    ssr: false,
    loading: () => (
      <StaticHeroStudioPreview
        logoAssetPath="/brand/bcp-master-logo.png"
        brandName="Business Compliance Partner"
      />
    ),
  },
);

export function LazyHeroStudio3D(props: LazyHeroStudio3DProps) {
  return (
    <div className="relative w-full">
      <HeroKnowledgeStudio3D {...props} />
    </div>
  );
}
