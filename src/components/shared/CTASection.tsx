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
    <section className="py-12 sm:py-16 bg-ps-midnight text-ps-white border-t border-ps-gold/30">
      <div className="ps-container">
        <div className="rounded-[16px] bg-ps-navy border border-ps-gold/30 p-7 sm:p-10 md:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-ps-white leading-snug">
              {titleBn}
            </h2>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed">
              {descriptionBn}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 shrink-0">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 min-h-12 px-6 py-3 rounded-[12px] bg-ps-ivory text-ps-midnight font-semibold hover:bg-ps-white transition-colors"
            >
              <span>{primaryLabelBn}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            {secondaryHref && secondaryLabelBn ? (
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center min-h-12 px-6 py-3 rounded-[12px] border border-ps-gold text-ps-white font-semibold hover:bg-ps-midnight transition-colors"
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
