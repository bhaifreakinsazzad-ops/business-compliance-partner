"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  ECOSYSTEM_NODES,
  type EcosystemPillarId,
} from "@/components/ui/HeroCanvas3D";
import { cn } from "@/lib/utils";

const HeroCanvas3D = dynamic(
  () => import("@/components/ui/HeroCanvas3D").then((mod) => mod.HeroCanvas3D),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-[290px] sm:h-[330px] flex items-center justify-center bg-[#FBFAFF]"
        aria-hidden="true"
      >
        <div className="w-36 h-36 rounded-full border border-[#B8BBFF]/60 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border border-[#243FBA]/40" />
        </div>
      </div>
    ),
  },
);

export function LazyCompliance3D() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shouldMount, setShouldMount] = useState(false);
  const [selectedPillar, setSelectedPillar] =
    useState<EcosystemPillarId>("courses");

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

  const activeNode =
    ECOSYSTEM_NODES.find((node) => node.id === selectedPillar) ??
    ECOSYSTEM_NODES[0]!;

  return (
    <div
      ref={hostRef}
      className="rounded-[18px] bg-white border border-[#E1E4F2] overflow-hidden shadow-sm"
    >
      <div className="bg-gradient-to-b from-[#FBFAFF] to-white border-b border-[#E1E4F2]">
        {shouldMount ? (
          <HeroCanvas3D
            selectedPillar={selectedPillar}
            onSelectPillar={setSelectedPillar}
          />
        ) : (
          <div
            className="w-full h-[290px] sm:h-[330px] flex items-center justify-center"
            aria-hidden="true"
          >
            <div className="w-36 h-36 rounded-full border border-[#B8BBFF]/60 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border border-[#243FBA]/40" />
            </div>
          </div>
        )}
      </div>

      {/* Accessible Interactive HTML Controls & Pillar Summary outside canvas */}
      <div className="p-4 sm:p-5 space-y-3.5 bg-white">
        <div
          role="tablist"
          aria-label="ইকোসিস্টেম স্তম্ভ নির্বাচন করুন"
          className="flex flex-wrap gap-1.5"
        >
          {ECOSYSTEM_NODES.map((node) => {
            const isSelected = node.id === selectedPillar;
            return (
              <button
                key={node.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedPillar(node.id)}
                className={cn(
                  "px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-colors cursor-pointer border",
                  isSelected
                    ? "bg-[#243FBA] text-white border-[#243FBA]"
                    : "bg-[#E2E3FF] text-[#081838] border-[#E1E4F2] hover:bg-[#CFD1FF]",
                )}
              >
                {node.labelBn}
              </button>
            );
          })}
        </div>

        <div
          aria-live="polite"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-[#E1E4F2]"
        >
          <div className="space-y-0.5 min-w-0">
            <p className="text-sm font-bold text-[#081838]">
              {activeNode.labelBn}{" "}
              <span className="font-en text-xs font-semibold text-[#243FBA]">
                · {activeNode.labelEn}
              </span>
            </p>
            <p className="text-xs text-[#596775] leading-relaxed">
              {activeNode.descriptionBn}
            </p>
          </div>

          <Link
            href={activeNode.href}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#243FBA] hover:text-[#1D329B] hover:underline underline-offset-4 whitespace-nowrap shrink-0"
          >
            <span>বিভাগ দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
