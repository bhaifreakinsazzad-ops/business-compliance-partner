"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { Award, CheckCircle2, Layers, ShieldCheck } from "lucide-react";

interface StatItem {
  id: string;
  targetValue: number;
  suffix: string;
  labelBn: string;
  sublabelBn: string;
  icon: typeof Award;
}

const STATS: StatItem[] = [
  {
    id: "solutions",
    targetValue: 437,
    suffix: "+",
    labelBn: "পেশাদার সমাধান",
    sublabelBn: "কোর্স, সেবা ও লাইসেন্সিং এন্ট্রি",
    icon: Layers,
  },
  {
    id: "categories",
    targetValue: 27,
    suffix: "",
    labelBn: "ব্যবসায়িক বিভাগ",
    sublabelBn: "সুনির্দিষ্ট আইনি ও প্রাতিষ্ঠানিক খাত",
    icon: Award,
  },
  {
    id: "pillars",
    targetValue: 4,
    suffix: "",
    labelBn: "মূল স্তম্ভ",
    sublabelBn: "শিক্ষা, কমপ্লায়েন্স, লাইসেন্স, পরামর্শ",
    icon: CheckCircle2,
  },
  {
    id: "independent",
    targetValue: 100,
    suffix: "%",
    labelBn: "স্বাধীন ও স্বচ্ছ",
    sublabelBn: "আইনি তথ্যের সঠিক দিকনির্দেশনা",
    icon: ShieldCheck,
  },
];

const BENGALI_NUMERALS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

function toBengaliNumber(n: number): string {
  return n
    .toString()
    .split("")
    .map((char) => {
      const idx = parseInt(char, 10);
      return !isNaN(idx) ? BENGALI_NUMERALS[idx] : char;
    })
    .join("");
}

export function StatCounters() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState<{ [key: string]: number }>({
    solutions: 0,
    categories: 0,
    pillars: 0,
    independent: 0,
  });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || hasAnimated) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setCounts({
        solutions: 437,
        categories: 27,
        pillars: 4,
        independent: 100,
      });
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          observer.disconnect();

          const temp = {
            solutions: 0,
            categories: 0,
            pillars: 0,
            independent: 0,
          };

          animate(temp, {
            solutions: 437,
            categories: 27,
            pillars: 4,
            independent: 100,
            duration: 1400,
            ease: "outExpo",
            onUpdate: () => {
              setCounts({
                solutions: Math.round(temp.solutions),
                categories: Math.round(temp.categories),
                pillars: Math.round(temp.pillars),
                independent: Math.round(temp.independent),
              });
            },
          });
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimated]);

  return (
    <section
      ref={containerRef}
      aria-label="প্ল্যাটফর্মের মূল পরিসংখ্যান"
      className="bg-white border-y border-[#D4CCE3] py-8 sm:py-10 text-[#081838]"
    >
      <div className="ps-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            const currentVal = counts[stat.id] || 0;
            return (
              <div
                key={stat.id}
                className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-1.5 p-4 rounded-[14px] bg-[#F2EFF8]/70 border border-[#D4CCE3] hover:border-[#51406F]/45 transition-colors"
              >
                <div className="flex items-center gap-2 text-[#51406F] mb-0.5">
                  <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span className="text-2xl sm:text-3xl lg:text-[2.1rem] font-extrabold tracking-tight tabular-nums text-[#081838]">
                    {toBengaliNumber(currentVal)}
                    {stat.suffix}
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#081838]">
                  {stat.labelBn}
                </p>
                <p className="text-xs text-[#596775]">{stat.sublabelBn}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
