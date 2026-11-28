import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

interface InstitutionalProfileSectionProps {
  logoAssetPath: string;
  brandName: string;
  taglineBn: string;
}

const INSTITUTIONAL_PILLARS = [
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
];

/**
 * Honest BCP Institutional Profile Section adapted from the 2-column numbered
 * credential layout (without fabricating any unverified individual mentor portrait or bio).
 */
export function InstitutionalProfileSection({
  logoAssetPath,
  brandName,
  taglineBn,
}: InstitutionalProfileSectionProps) {
  return (
    <section
      aria-label="প্রতিষ্ঠান পরিচিতি — Business Compliance Partner"
      className="py-12 sm:py-16 bg-white border-b border-[#E1E4F2]"
    >
      <div className="ps-container">
        <div className="relative rounded-[24px] bg-[#081838] text-white p-6 sm:p-10 lg:p-12 overflow-hidden shadow-lg">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(184,187,255,0.16),transparent_48%),radial-gradient(circle_at_90%_85%,rgba(197,144,40,0.14),transparent_45%)] pointer-events-none"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Official BCP Badge & Institutional Identity Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-[20px] border-2 border-[#C59028]/75 bg-gradient-to-b from-[#0E224A] to-[#081838] p-7 text-center space-y-5 shadow-[0_18px_42px_rgba(0,0,0,0.35)]">
                {logoAssetPath ? (
                  <div className="inline-flex items-center justify-center rounded-full p-2 bg-white shadow-md border-2 border-[#DFB15B]">
                    <Image
                      src={logoAssetPath}
                      alt={`${brandName} official badge`}
                      width={136}
                      height={136}
                      className="rounded-full object-contain"
                    />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <p className="font-en text-xs font-bold uppercase tracking-[0.18em] text-[#DFB15B]">
                    Business Compliance Partner
                  </p>
                  <p className="text-base sm:text-lg font-bold text-white leading-snug">
                    {taglineBn}
                  </p>
                  <p className="text-xs text-[#CCCEFF] leading-relaxed">
                    বাংলাদেশের উদ্যোক্তা, এসএমই এবং কর্পোরেট পেশাজীবীদের জন্য স্বাধীন
                    প্রশিক্ষণ, পরামর্শ ও প্রকাশনা প্ল্যাটফর্ম।
                  </p>
                </div>

                <div className="pt-2 border-t border-white/15">
                  <Link
                    href="/about"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[#DFB15B] hover:text-white transition-colors"
                  >
                    <span>প্রতিষ্ঠান সম্পর্কে বিস্তারিত জানুন</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Numbered Institutional Credential List */}
            <div className="lg:col-span-7 space-y-5">
              <div className="space-y-2">
                <p className="inline-flex items-center gap-2 text-xs font-bold text-[#DFB15B]">
                  <span className="h-[1.5px] w-7 bg-[#DFB15B]" aria-hidden="true" />
                  <span>প্রতিষ্ঠান পরিচিতি</span>
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                  Business Compliance Partner
                </h2>
              </div>

              <div className="rounded-[18px] border border-white/15 bg-white/[0.04] p-5 sm:p-7 space-y-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] border border-[#C59028]/50 bg-[#C59028]/15 text-[#DFB15B] shrink-0">
                    <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    প্রাতিষ্ঠানিক ভিত্তি ও মূল কর্মপরিধি
                  </h3>
                </div>

                <ol className="relative space-y-4">
                  {INSTITUTIONAL_PILLARS.map((item, idx) => (
                    <li
                      key={item.numBn}
                      className="relative flex items-start gap-4"
                    >
                      {idx < INSTITUTIONAL_PILLARS.length - 1 ? (
                        <span
                          aria-hidden="true"
                          className="absolute start-4 top-9 bottom-[-18px] w-[1.5px] bg-[#C59028]/45"
                        />
                      ) : null}
                      <span className="relative z-10 inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#DFB15B] to-[#C59028] text-[#081838] text-xs font-extrabold shrink-0 shadow-xs">
                        {item.numBn}
                      </span>
                      <div className="space-y-0.5 pt-0.5">
                        <p className="text-sm sm:text-base font-bold text-white leading-snug">
                          {item.titleBn}
                        </p>
                        <p className="text-xs sm:text-sm text-white/75 leading-relaxed">
                          {item.subtitleBn}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
