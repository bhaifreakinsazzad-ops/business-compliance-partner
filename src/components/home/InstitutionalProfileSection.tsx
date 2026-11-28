"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ExpertProfile,
  type ProfileTimelineItem,
} from "@/components/home/ExpertProfile";
import { resolveInstitutionalAsset } from "@/lib/config/media-manifest";
import { cn } from "@/lib/utils";

interface InstitutionalProfileSectionProps {
  logoAssetPath: string;
  brandName: string;
  taglineBn: string;
}

interface InstitutionalSlide {
  id: "foundation" | "standards";
  eyebrowBn: string;
  titleBn: string;
  panelTitleBn: string;
  summaryBn: string;
  imagePosition: "left" | "right";
  ctaHref: string;
  ctaLabelBn: string;
  items: readonly ProfileTimelineItem[];
}

const INSTITUTIONAL_SLIDES: readonly InstitutionalSlide[] = [
  {
    id: "foundation",
    eyebrowBn: "প্রতিষ্ঠান পরিচিতি",
    titleBn: "Business Compliance Partner",
    panelTitleBn: "প্রাতিষ্ঠানিক ভিত্তি ও মূল কর্মপরিধি",
    summaryBn:
      "বাংলাদেশের উদ্যোক্তা, এসএমই এবং কর্পোরেট পেশাজীবীদের জন্য স্বাধীন প্রশিক্ষণ, পরামর্শ ও প্রকাশনা প্ল্যাটফর্ম।",
    imagePosition: "left",
    ctaHref: "/about",
    ctaLabelBn: "প্রতিষ্ঠান সম্পর্কে বিস্তারিত জানুন",
    items: [
      {
        numBn: "১",
        titleBn: "জাতীয় রাজস্ব বোর্ড (NBR) আয়কর ও মূসক নির্দেশনা",
        subtitleBn:
          "আয়কর আইন ২০২৩ এবং ভ্যাট ও মূসক ৯.১ বিধিমালা অনুযায়ী ব্যবহারিক প্রশিক্ষণ ও কমপ্লায়েন্স সহায়তা",
      },
      {
        numBn: "২",
        titleBn: "Smart RJSC ও কর্পোরেট সেক্রেটারিয়াল কাঠামো",
        subtitleBn:
          "কোম্পানি গঠন, বার্ষিক রিটার্ন ও কর্পোরেট ডকুমেন্টেশনের নির্ভুল প্রাতিষ্ঠানিক নির্দেশিকা",
      },
      {
        numBn: "৩",
        titleBn: "BPPA (e-GP), ট্রেড লাইসেন্স ও নিয়ন্ত্রক অনুমোদন সহায়তা",
        subtitleBn:
          "ট্রেড লাইসেন্স, DIFE, ফায়ার সার্ভিস ও আমদানি-রপ্তানি নিবন্ধনের সঠিক চেকলিস্ট ও পরামর্শ",
      },
      {
        numBn: "৪",
        titleBn: "ব্যবহারিক প্রশিক্ষণ কোর্স এবং কমপ্লায়েন্স প্রকাশনা",
        subtitleBn:
          "উদ্যোক্তা ও পেশাজীবীদের জন্য সুশৃঙ্খল Courses, Services ও Books ইকোসিস্টেম",
      },
    ],
  },
  {
    id: "standards",
    eyebrowBn: "পেশাদার মানদণ্ড · ২ / ২",
    titleBn: "স্বচ্ছতা, গোপনীয়তা ও ব্যবহারিক সহায়তা",
    panelTitleBn: "সেবা ও পরামর্শ পরিচালনার মূল নীতিমালা",
    summaryBn:
      "প্রতিটি প্রশিক্ষণ, কমপ্লায়েন্স সেবা এবং প্রকাশনায় নির্ভুল তথ্য ও দায়িত্বশীল দিকনির্দেশনাই আমাদের অঙ্গীকার।",
    imagePosition: "right",
    ctaHref: "/consultancy",
    ctaLabelBn: "সরাসরি পরামর্শের অনুরোধ পাঠান",
    items: [
      {
        numBn: "১",
        titleBn: "স্বাধীন ও নিরপেক্ষ কমপ্লায়েন্স দিকনির্দেশনা",
        subtitleBn:
          "আমরা কোনো সরকারি দপ্তরের অংশ নই; সংশ্লিষ্ট কর্তৃপক্ষের বিধিমালা অনুযায়ী নির্ভুল প্রস্তুতি ও দাখিলে সহায়তা করি।",
      },
      {
        numBn: "২",
        titleBn: "নথিপত্র ও ব্যবসায়িক তথ্যের সুরক্ষা",
        subtitleBn:
          "গ্রাহকের পরিচয়পত্র, কর রিটার্ন ও আর্থিক তথ্য প্রযোজ্য গোপনীয়তা নীতিমালা অনুযায়ী সংরক্ষিত প্রক্রিয়ায় পরিচালনা করা হয়।",
      },
      {
        numBn: "৩",
        titleBn: "কোর্স, সেবা ও বইয়ের সমন্বিত ব্যবহার",
        subtitleBn:
          "শিখতে চাইলে Courses, কাজে সহায়তা চাইলে Services এবং দ্রুত রেফারেন্সের জন্য Books—একই মানদণ্ডে সাজানো।",
      },
      {
        numBn: "৪",
        titleBn: "যাচাইকৃত তথ্যের ভিত্তিতে স্বচ্ছ যোগাযোগ",
        subtitleBn:
          "অনুমোদন বা সময়ের বিষয়ে অবাস্তব প্রতিশ্রুতি নয়—বাস্তবসম্মত ধাপ ও প্রয়োজনীয় নথি স্পষ্টভাবে জানানো হয়।",
      },
    ],
  },
] as const;

/**
 * White-to-Periwinkle Institutional Profile Showcase (V8.3)
 * Alternates the supplied portrait institutional poster (Slide 1) and studio architecture
 * visual (Slide 2) alongside numbered institutional credentials.
 */
export function InstitutionalProfileSection({
  logoAssetPath,
  brandName,
  taglineBn,
}: InstitutionalProfileSectionProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const activeSlide =
    INSTITUTIONAL_SLIDES[slideIndex] ?? INSTITUTIONAL_SLIDES[0]!;
  const activeVisualAsset = resolveInstitutionalAsset(activeSlide.id);

  const goPrev = () =>
    setSlideIndex(
      (prev) =>
        (prev - 1 + INSTITUTIONAL_SLIDES.length) % INSTITUTIONAL_SLIDES.length,
    );
  const goNext = () =>
    setSlideIndex((prev) => (prev + 1) % INSTITUTIONAL_SLIDES.length);

  return (
    <section
      aria-label="প্রতিষ্ঠান পরিচিতি — Business Compliance Partner"
      className="py-12 sm:py-16 bg-white border-b border-[#E1E4F2]"
    >
      <div className="ps-container">
        <div
          data-institutional-profile-frame="periwinkle"
          className="bcp-reference-profile-frame relative rounded-[24px] border border-[#B8BBFF] p-5 sm:p-9 lg:p-12 overflow-hidden shadow-[0_18px_48px_rgba(36,63,186,0.08)] space-y-7"
        >
          <ExpertProfile
            eyebrowBn={activeSlide.eyebrowBn}
            titleBn={activeSlide.titleBn}
            panelTitleBn={activeSlide.panelTitleBn}
            taglineBn={taglineBn}
            summaryBn={activeSlide.summaryBn}
            imageSrc={logoAssetPath || null}
            imageAlt={`${brandName} official badge`}
            visualAsset={activeVisualAsset}
            hideMedallionLogo={activeSlide.id === "foundation"}
            imagePosition={activeSlide.imagePosition}
            ctaHref={activeSlide.ctaHref}
            ctaLabelBn={activeSlide.ctaLabelBn}
            items={activeSlide.items}
          />

          {/* Reference Paginated Profile Switcher Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#E1E4F2]/90">
            <span className="font-en text-xs font-bold text-[#202D72] tabular-nums">
              0{slideIndex + 1} / 0{INSTITUTIONAL_SLIDES.length}
            </span>

            <div className="flex items-center gap-2">
              {INSTITUTIONAL_SLIDES.map((slide, idx) => {
                const isSelected = idx === slideIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setSlideIndex(idx)}
                    aria-label={`পরিচিতি প্যানেল ${idx + 1}: ${slide.eyebrowBn}`}
                    aria-current={isSelected ? "true" : undefined}
                    className={cn(
                      "h-2.5 rounded-full transition-all cursor-pointer",
                      isSelected
                        ? "w-8 bg-[#243FBA]"
                        : "w-2.5 bg-[#B8BBFF] hover:bg-[#243FBA]/60",
                    )}
                  />
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                aria-label="পূর্ববর্তী পরিচিতি প্যানেল"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#B8BBFF] bg-white text-[#243FBA] hover:bg-[#243FBA] hover:text-white transition-colors cursor-pointer shadow-xs"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="পরবর্তী পরিচিতি প্যানেল"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[#B8BBFF] bg-white text-[#243FBA] hover:bg-[#243FBA] hover:text-white transition-colors cursor-pointer shadow-xs"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
