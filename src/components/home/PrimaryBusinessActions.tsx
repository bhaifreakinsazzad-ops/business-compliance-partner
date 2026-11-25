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
      className="bg-ps-white border-b border-ps-border py-3.5 sm:py-5 shadow-[0_6px_24px_rgba(8,24,56,0.06)]"
    >
      <div className="ps-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Button 1: All Courses — Luminous Royal Gold gradient, Midnight Navy text */}
          <Link
            href="/courses"
            data-flagship-cta="courses"
            className="group relative flex items-center justify-between gap-4 min-h-[92px] sm:min-h-[104px] px-5 sm:px-7 py-4 sm:py-5 rounded-[18px] bg-gradient-to-r from-[#f0cf7b] via-[#dfb15b] to-[#c59028] text-ps-midnight border-2 border-[#9e7018] shadow-[0_8px_24px_rgba(197,144,40,0.28)] hover:shadow-[0_12px_30px_rgba(197,144,40,0.38)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 focus-visible:outline-3 focus-visible:outline-ps-midnight focus-visible:outline-offset-3"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-[14px] bg-ps-midnight text-[#f0cf7b] shrink-0 shadow-md">
                <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-1">
                <span className="block text-xl sm:text-2xl lg:text-[1.6rem] font-extrabold leading-tight tracking-tight">
                  আমাদের সকল কোর্সসমূহ
                </span>
                <span className="block text-xs sm:text-sm font-bold text-ps-midnight/85 leading-snug">
                  Tax, VAT, e-GP, E-commerce, RJSC ও ১০টি ব্যবহারিক ট্র্যাক
                </span>
              </div>
            </div>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-ps-midnight/12 text-ps-midnight shrink-0 transition-transform duration-200 group-hover:translate-x-1">
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </span>
          </Link>

          {/* Button 2: All Services — Midnight Navy to Emerald-tinted gradient, White text, Bright Gold accent */}
          <Link
            href="/services"
            data-flagship-cta="services"
            className="group relative flex items-center justify-between gap-4 min-h-[92px] sm:min-h-[104px] px-5 sm:px-7 py-4 sm:py-5 rounded-[18px] bg-gradient-to-r from-[#081838] via-[#0e2956] to-[#0a3c3d] text-ps-white border-2 border-ps-gold shadow-[0_8px_24px_rgba(8,24,56,0.24)] hover:shadow-[0_12px_30px_rgba(0,134,90,0.28)] hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-3"
          >
            <div className="flex items-center gap-4 min-w-0">
              <span className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-[14px] bg-ps-success text-ps-white border border-emerald-300/50 shrink-0 shadow-md">
                <BriefcaseBusiness className="w-7 h-7 sm:w-8 sm:h-8" aria-hidden="true" />
              </span>
              <div className="min-w-0 space-y-1">
                <span className="block text-xl sm:text-2xl lg:text-[1.6rem] font-extrabold leading-tight tracking-tight">
                  আমাদের সকল সেবাসমূহ
                </span>
                <span className="block text-xs sm:text-sm font-medium text-white/90 leading-snug">
                  পেশাদার কমপ্লায়েন্স, লাইসেন্সিং ও সরাসরি WhatsApp সহায়তা
                </span>
              </div>
            </div>
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-ps-gold/20 text-[#f0cf7b] shrink-0 transition-transform duration-200 group-hover:translate-x-1">
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
