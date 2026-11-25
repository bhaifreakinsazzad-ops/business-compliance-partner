import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, GraduationCap } from "lucide-react";

/**
 * Two flagship CTA buttons rendered prominently right below the promotional
 * hero slider, independent of active slide or JavaScript state.
 */
export function PrimaryBusinessActions() {
  return (
    <section
      aria-label="প্রধান নেভিগেশন বাটন"
      className="bg-ps-white border-b border-ps-border py-5 sm:py-7 shadow-[0_4px_20px_rgba(8,24,56,0.05)]"
    >
      <div className="ps-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Button 1: All Courses — Royal Gold background, Midnight Navy text */}
          <Link
            href="/courses"
            data-flagship-cta="courses"
            className="group relative flex items-center justify-between gap-4 min-h-[84px] sm:min-h-[96px] px-5 sm:px-7 py-4 rounded-[16px] bg-ps-gold text-ps-midnight border-2 border-[#a9791a] shadow-md hover:bg-[#dfb15b] hover:shadow-lg transition-all focus-visible:outline-3 focus-visible:outline-ps-midnight focus-visible:outline-offset-3"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-[12px] bg-ps-midnight text-ps-gold shrink-0 shadow-sm">
                <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-0.5">
                <span className="block text-xl sm:text-2xl font-extrabold leading-tight tracking-tight">
                  আমাদের সকল কোর্সসমূহ
                </span>
                <span className="block text-xs sm:text-sm font-semibold text-ps-midnight/85">
                  Tax, VAT, e-GP, E-commerce, RJSC ও ১০টি ব্যবহারিক ট্র্যাক
                </span>
              </div>
            </div>
            <ArrowRight
              className="w-6 h-6 shrink-0 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>

          {/* Button 2: All Services — Midnight Navy background, White text, Gold icon */}
          <Link
            href="/services"
            data-flagship-cta="services"
            className="group relative flex items-center justify-between gap-4 min-h-[84px] sm:min-h-[96px] px-5 sm:px-7 py-4 rounded-[16px] bg-ps-midnight text-ps-white border-2 border-ps-gold/60 shadow-md hover:bg-ps-navy hover:border-ps-gold hover:shadow-lg transition-all focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-3"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-[12px] bg-ps-gold/15 border border-ps-gold/50 text-ps-gold shrink-0">
                <BriefcaseBusiness className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-0.5">
                <span className="block text-xl sm:text-2xl font-extrabold leading-tight tracking-tight">
                  আমাদের সকল সেবাসমূহ
                </span>
                <span className="block text-xs sm:text-sm font-medium text-white/85">
                  পেশাদার কমপ্লায়েন্স, লাইসেন্সিং ও সরাসরি WhatsApp সহায়তা
                </span>
              </div>
            </div>
            <ArrowRight
              className="w-6 h-6 text-ps-gold shrink-0 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
