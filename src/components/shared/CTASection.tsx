import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  titleBn: string;
  descriptionBn: string;
  primaryHref: string;
  primaryLabelBn: string;
  secondaryHref?: string;
  secondaryLabelBn?: string;
}

export function CTASection({
  titleBn,
  descriptionBn,
  primaryHref,
  primaryLabelBn,
  secondaryHref,
  secondaryLabelBn,
}: CTASectionProps) {
  return (
    <section className="py-12 sm:py-16 bg-[#F2EFF8] border-t border-[#D4CCE3]">
      <div className="ps-container">
        <div className="rounded-[20px] bg-gradient-to-br from-[#51406F] via-[#453561] to-[#081838] border border-[#D4CCE3]/40 p-7 sm:p-10 md:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-white shadow-md">
          <div className="space-y-2.5 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug">
              {titleBn}
            </h2>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed">
              {descriptionBn}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 shrink-0">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3 rounded-[12px] bg-white text-[#081838] font-semibold hover:bg-[#F2EFF8] transition-colors shadow-xs"
            >
              <span>{primaryLabelBn}</span>
              <ArrowRight className="w-4 h-4 text-[#51406F]" aria-hidden="true" />
            </Link>
            {secondaryHref && secondaryLabelBn ? (
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center min-h-12 px-6 py-3 rounded-[12px] border border-white/40 text-white font-semibold hover:bg-white/10 transition-colors"
              >
                {secondaryLabelBn}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
