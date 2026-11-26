"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { animate } from "animejs";
import { Award, CheckCircle2, FileCheck2, Layers } from "lucide-react";

interface StatCountersProps {
  documentedTotal?: number;
  categoryCount?: number;
  publishedCount?: number;
  divisionCount?: number;
}

interface StatItem {
  id: "solutions" | "categories" | "published" | "pillars";
  targetValue: number;
  suffix: string;
  labelBn: string;
  sublabelBn: string;
  icon: typeof Award;
}

const BENGALI_NUMERALS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toBengaliNumber(n: number): string {
  return Math.max(0, Math.round(n))
    .toString()
    .split("")
    .map((char) => {
      const idx = parseInt(char, 10);
      return !isNaN(idx) ? BENGALI_NUMERALS[idx] : char;
    })
    .join("");
}

/**
 * Server-verified catalogue metrics strip.
 * Zero unverified percentage claims — renders documented inventory totals,
 * distinct categories, published public items, and operational divisions.
 */
export function StatCounters({
  documentedTotal = 437,
  categoryCount = 27,
  publishedCount = 0,
  divisionCount = 4,
}: StatCountersProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const stats: StatItem[] = useMemo(
    () => [
      {
        id: "solutions",
        targetValue: documentedTotal,
        suffix: "",
        labelBn: "নথিভুক্ত সমাধান",
        sublabelBn: "কোর্স, সেবা ও লাইসেন্সিং রেকর্ড",
        icon: Layers,
      },
      {
        id: "categories",
        targetValue: categoryCount,
        suffix: "",
        labelBn: "ব্যবসায়িক বিভাগ",
        sublabelBn: "সুনির্দিষ্ট আইনি ও প্রাতিষ্ঠানিক খাত",
        icon: Award,
      },
      {
        id: "published",
        targetValue: publishedCount > 0 ? publishedCount : 9,
        suffix: "",
        labelBn: publishedCount > 0 ? "প্রকাশিত সমাধান" : "প্রস্তাবিত বই প্রিভিউ",
        sublabelBn:
          publishedCount > 0
            ? "যাচাইকৃত ও সরাসরি অনুসন্ধানযোগ্য এন্ট্রি"
            : "ক্লায়েন্ট অনুমোদনের অপেক্ষায়",
        icon: FileCheck2,
      },
      {
        id: "pillars",
        targetValue: divisionCount,
        suffix: "",
        labelBn: "মূল স্তম্ভ",
        sublabelBn: "শিক্ষা, কমপ্লায়েন্স, লাইসেন্স, পরামর্শ",
        icon: CheckCircle2,
      },
    ],
    [documentedTotal, categoryCount, publishedCount, divisionCount],
  );

  const [counts, setCounts] = useState<Record<StatItem["id"], number>>({
    solutions: documentedTotal,
    categories: categoryCount,
    published: publishedCount > 0 ? publishedCount : 9,
    pillars: divisionCount,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;

    const targetMap = {
      solutions: stats[0]!.targetValue,
      categories: stats[1]!.targetValue,
      published: stats[2]!.targetValue,
      pillars: stats[3]!.targetValue,
    };

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      setCounts(targetMap);
      return;
    }

    let hasStarted = false;
    let activeAnim: ReturnType<typeof animate> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (hasStarted || !entries[0]?.isIntersecting) return;
        hasStarted = true;
        observer.disconnect();

        const temp = {
          solutions: Math.floor(targetMap.solutions * 0.4),
          categories: Math.floor(targetMap.categories * 0.4),
          published: Math.floor(targetMap.published * 0.4),
          pillars: 1,
        };

        activeAnim = animate(temp, {
          solutions: targetMap.solutions,
          categories: targetMap.categories,
          published: targetMap.published,
          pillars: targetMap.pillars,
          duration: 1100,
          ease: "outExpo",
          onUpdate: () => {
            setCounts({
              solutions: Math.round(temp.solutions),
              categories: Math.round(temp.categories),
              published: Math.round(temp.published),
              pillars: Math.round(temp.pillars),
            });
          },
          onComplete: () => {
            setCounts(targetMap);
          },
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      activeAnim?.cancel();
    };
  }, [stats]);

  return (
    <section
      ref={containerRef}
      aria-label="প্ল্যাটফর্মের মূল পরিসংখ্যান"
      className="bg-surface-canvas border-y border-border-subtle py-8 sm:py-10 text-text-primary"
    >
      <div className="ps-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const currentVal = counts[stat.id] ?? stat.targetValue;
            return (
              <div
                key={stat.id}
                className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 p-4 rounded-[14px] bg-surface-lavender/75 border border-border-subtle hover:border-action-primary/45 transition-colors"
              >
                <div className="flex items-center gap-2 text-text-accent mb-0.5">
                  <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold tracking-tight tabular-nums text-text-primary">
                    {toBengaliNumber(currentVal)}
                    {stat.suffix}
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-text-primary">
                  {stat.labelBn}
                </p>
                <p className="text-xs text-text-muted">{stat.sublabelBn}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
