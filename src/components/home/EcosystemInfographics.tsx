"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Expand, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfographicTab {
  id: string;
  pillar: string;
  titleBn: string;
  subtitleBn: string;
  badgeBn: string;
  src: string;
  ctaHref: string;
  ctaTextBn: string;
}

const INFOGRAPHICS: InfographicTab[] = [
  {
    id: "overview",
    pillar: "ALL",
    titleBn: "এক প্ল্যাটফর্মে ব্যবসার সম্পূর্ণ সমাধান",
    subtitleBn: "শিখুন, সার্ভিস নিন, লাইসেন্স করুন, বিশেষজ্ঞ পরামর্শ নিন",
    badgeBn: "৪টি মূল স্তম্ভ • ৪৩৭টি এন্ট্রি",
    src: "/brand/infographics/bcp-infographic-01-overview.jpg",
    ctaHref: "#solution-finder",
    ctaTextBn: "ব্যবসার সমাধান খুঁজুন",
  },
  {
    id: "learn",
    pillar: "COURSES",
    titleBn: "Learn — কোর্স ও প্রফেশনাল ট্রেনিং",
    subtitleBn: "দক্ষতা অর্জন করুন ও পেশাগতভাবে উন্নত হন",
    badgeBn: "১০৫টি কোর্স • ১০টি ট্র্যাক",
    src: "/brand/infographics/bcp-infographic-02-learn.jpg",
    ctaHref: "/courses",
    ctaTextBn: "সব কোর্স এক্সপ্লোর করুন",
  },
  {
    id: "services",
    pillar: "SERVICES",
    titleBn: "Our Services — প্রফেশনাল ও ব্যবসায়িক সেবা",
    subtitleBn: "প্রয়োজনীয় কাজ বিশেষজ্ঞদের মাধ্যমে সম্পন্ন করুন",
    badgeBn: "২৪৭টি সার্ভিস • ১১টি বিভাগ",
    src: "/brand/infographics/bcp-infographic-03-services.jpg",
    ctaHref: "/services",
    ctaTextBn: "সকল সেবা দেখুন",
  },
  {
    id: "vat",
    pillar: "SERVICES",
    titleBn: "ভ্যাট ও মূসক সেবা (VAT & Mushak)",
    subtitleBn: "নিবন্ধন, রিটার্ন, মূসক ফরম, অডিট ও কমপ্লায়েন্স",
    badgeBn: "৩৩টি ভ্যাট সমাধান",
    src: "/brand/infographics/bcp-infographic-04-vat-mushak.jpg",
    ctaHref: "/services",
    ctaTextBn: "ভ্যাট ও মূসক সার্ভিস",
  },
  {
    id: "licensing",
    pillar: "LICENSING",
    titleBn: "লাইসেন্স ও নিবন্ধন সেবা",
    subtitleBn: "ব্যবসা প্রতিষ্ঠা থেকে সর্ব অনুমোদন, নবায়ন ও কমপ্লায়েন্স",
    badgeBn: "৮৫টি লাইসেন্স সেবা",
    src: "/brand/infographics/bcp-infographic-05-licensing.jpg",
    ctaHref: "/licensing",
    ctaTextBn: "লাইসেন্সিং ক্যাটালগ",
  },
  {
    id: "consultancy",
    pillar: "CONSULTANCY",
    titleBn: "বিশেষজ্ঞ পরামর্শ সেবা (Advisory)",
    subtitleBn: "সঠিক দিকনির্দেশনা, সঠিক সিদ্ধান্ত এবং স্থায়ী প্রবৃদ্ধি",
    badgeBn: "ব্যক্তিগত ও ব্যবসায়িক গাইডেন্স",
    src: "/brand/infographics/bcp-infographic-06-consultancy.jpg",
    ctaHref: "/consultancy",
    ctaTextBn: "পরামর্শের জন্য অনুরোধ",
  },
];

export function EcosystemInfographics() {
  const [activeId, setActiveId] = useState<string>("overview");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activeItem = INFOGRAPHICS.find((i) => i.id === activeId) ?? INFOGRAPHICS[0]!;

  return (
    <section
      aria-label="অফিসিয়াল মাস্টার ইনফোগ্রাফিক গ্যালারি"
      className="py-14 sm:py-20 bg-ps-pearl border-b border-ps-border"
    >
      <div className="ps-container space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ps-gold/60 bg-ps-navy/5 px-3 py-1 text-xs font-semibold text-ps-navy">
            <ShieldCheck className="w-3.5 h-3.5 text-ps-gold" aria-hidden="true" />
            <span>অফিসিয়াল মাস্টার ইনফোগ্রাফিক ও সমাধান চিত্র</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-ps-midnight">
            এক নজরে সম্পূর্ণ প্ল্যাটফর্মের ইকোসিস্টেম
          </h2>
          <p className="text-sm sm:text-base text-ps-slate leading-relaxed">
            বাংলাদেশের ৪৩৭টি ব্যবসায়িক ও কমপ্লায়েন্স সেবাকে ৪টি সমন্বিত স্তম্ভ ও ২৭টি সুনির্দিষ্ট বিভাগে সহজবোধ্যভাবে উপস্থাপন করা হয়েছে।
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {INFOGRAPHICS.map((tab) => {
            const isSelected = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                className={cn(
                  "min-h-11 px-4 py-2 rounded-[12px] text-xs sm:text-sm font-semibold transition-all border",
                  isSelected
                    ? "bg-ps-midnight text-ps-ivory border-ps-midnight shadow-md"
                    : "bg-white text-ps-navy border-ps-border hover:border-ps-gold hover:bg-ps-ivory/40"
                )}
              >
                <span>{tab.badgeBn}</span>
              </button>
            );
          })}
        </div>

        {/* Active Infographic Showcase */}
        <div className="rounded-[18px] bg-white border border-ps-border p-4 sm:p-6 shadow-xl max-w-4xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ps-border">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ps-gold">
                {activeItem.badgeBn}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-ps-midnight">
                {activeItem.titleBn}
              </h3>
              <p className="text-xs sm:text-sm text-ps-slate">
                {activeItem.subtitleBn}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-ps-pearl hover:bg-ps-border text-ps-navy transition-colors border border-ps-border"
                title="পূর্ণ পর্দায় দেখুন"
              >
                <Expand className="w-3.5 h-3.5" aria-hidden="true" />
                <span>বড় করে দেখুন</span>
              </button>
              <Link
                href={activeItem.ctaHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-ps-midnight text-ps-ivory hover:bg-ps-navy transition-colors"
              >
                <span>{activeItem.ctaTextBn}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="relative w-full aspect-[4/5] sm:aspect-[1/1] max-h-[750px] rounded-xl overflow-hidden bg-ps-pearl/50 border border-ps-border/50 flex items-center justify-center">
            <Image
              src={activeItem.src}
              alt={activeItem.titleBn}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 900px"
              priority={activeId === "overview"}
            />
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
            <span className="text-xs text-white/80 hidden sm:inline">
              বন্ধ করতে যেকোনো জায়গায় ক্লিক করুন
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 rounded-lg bg-ps-gold text-ps-midnight font-bold text-xs hover:bg-ps-ivory"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
          <div
            className="relative w-full max-w-5xl h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeItem.src}
              alt={activeItem.titleBn}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      ) : null}
    </section>
  );
}
