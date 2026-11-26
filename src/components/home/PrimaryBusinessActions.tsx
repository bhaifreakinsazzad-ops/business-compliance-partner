import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
} from "lucide-react";

const FLAGSHIP_PILLARS = [
  {
    key: "courses",
    href: "/courses",
    dataFlagshipCta: "courses",
    titleBn: "আমাদের সকল কোর্সসমূহ",
    subtitleBn:
      "Tax, VAT, e-GP, E-commerce, RJSC ও ১০টি ব্যবহারিক প্রশিক্ষণ ট্র্যাক",
    icon: GraduationCap,
  },
  {
    key: "services",
    href: "/services",
    dataFlagshipCta: "services",
    titleBn: "আমাদের সকল সেবাসমূহ",
    subtitleBn:
      "ট্যাক্স, ভ্যাট, লাইসেন্সিং ও সরাসরি WhatsApp কমপ্লায়েন্স সহায়তা",
    icon: BriefcaseBusiness,
  },
  {
    key: "books",
    href: "/books",
    dataFlagshipCta: "books",
    titleBn: "আমাদের সকল বইসমূহ",
    subtitleBn:
      "ট্যাক্স, ভ্যাট, কর্পোরেট আইন ও ব্যবসা বিষয়ক আসন্ন প্রকাশনা প্রিভিউ",
    icon: BookOpen,
  },
] as const;

/**
 * Three flagship CTA cards in the exact client-mandated order:
 * Our Courses -> Our Services -> Our Books
 * All three share an identical unified Muted Lavender (#DDD6EB) visual language.
 */
export function PrimaryBusinessActions() {
  return (
    <section
      aria-label="প্রধান নেভিগেশন বাটন"
      className="bg-white border-b border-[#D4CCE3] py-5 sm:py-6"
    >
      <div className="ps-container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {FLAGSHIP_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <Link
                key={pillar.key}
                href={pillar.href}
                data-flagship-cta={pillar.dataFlagshipCta}
                className="group relative flex items-center justify-between gap-3.5 min-h-[104px] sm:min-h-[124px] px-5 sm:px-6 py-4 sm:py-5 rounded-[16px] bg-[#DDD6EB] text-[#081838] border border-[#D4CCE3] shadow-[0_4px_16px_rgba(81,64,111,0.08)] hover:bg-[#D5CCE8] hover:border-[#51406F]/45 hover:shadow-[0_10px_24px_rgba(81,64,111,0.14)] hover:-translate-y-0.5 transition-[transform,box-shadow,background-color,border-color] duration-200 focus-visible:outline-3 focus-visible:outline-[#C59028] focus-visible:outline-offset-2"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-[12px] bg-[#51406F] text-white shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <span className="block text-lg sm:text-xl font-extrabold leading-snug text-[#081838] tracking-tight">
                      {pillar.titleBn}
                    </span>
                    <span className="block text-xs font-medium text-[#181D26]/80 leading-snug line-clamp-2">
                      {pillar.subtitleBn}
                    </span>
                  </div>
                </div>
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 text-[#51406F] border border-[#D4CCE3] shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-hover:bg-[#51406F] group-hover:text-white">
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
