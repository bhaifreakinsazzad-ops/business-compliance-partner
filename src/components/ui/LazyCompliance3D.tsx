"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const HeroCanvas3D = dynamic(
  () => import("@/components/ui/HeroCanvas3D").then((mod) => mod.HeroCanvas3D),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full min-h-[300px] sm:min-h-[340px] flex items-center justify-center rounded-[16px] bg-ps-midnight/70 border border-ps-gold/25"
        aria-hidden="true"
      >
        <div className="w-40 h-40 rounded-full border border-ps-gold/40 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border border-ps-gold/60" />
        </div>
      </div>
    ),
  },
);

export function LazyCompliance3D() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setShouldMount(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className="relative rounded-[16px] bg-ps-midnight border border-ps-gold/30 overflow-hidden shadow-lg"
    >
      {shouldMount ? (
        <HeroCanvas3D />
      ) : (
        <div
          className="w-full min-h-[300px] sm:min-h-[340px] flex items-center justify-center"
          aria-hidden="true"
        >
          <div className="w-40 h-40 rounded-full border border-ps-gold/40 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full border border-ps-gold/60" />
          </div>
        </div>
      )}
      <div className="px-4 py-3 bg-ps-midnight/95 border-t border-white/10 flex items-center justify-between gap-3 text-xs text-white/85">
        <span className="font-semibold text-ps-gold">
          ইন্টারেক্টিভ ৩ডি কমপ্লায়েন্স ইকোসিস্টেম
        </span>
        <span className="text-[11px] text-white/70">
          মাউস বা স্পর্শে ঘোরান • ৪৩৭টি এন্ট্রি ও ২৭টি বিভাগ
        </span>
      </div>
    </div>
  );
}
