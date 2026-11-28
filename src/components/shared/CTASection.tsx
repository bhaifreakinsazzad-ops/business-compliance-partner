import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTASectionProps {
  eyebrowEn?: string;
  titleBn: string;
  descriptionBn: string;
  primaryHref: string;
  primaryLabelBn: string;
  secondaryHref?: string;
  secondaryLabelBn?: string;
  tertiaryHref?: string;
  tertiaryLabelBn?: string;
}

export function CTASection({
  eyebrowEn,
  titleBn,
  descriptionBn,
  primaryHref,
  primaryLabelBn,
  secondaryHref,
  secondaryLabelBn,
  tertiaryHref,
  tertiaryLabelBn,
}: CTASectionProps) {
  return (
    <section className="py-12 sm:py-16 bg-[#FBFAFF] border-t border-[#E1E4F2]">
      <div className="ps-container">
        <div className="rounded-[20px] bg-gradient-to-br from-[#202D72] via-[#243FBA] to-[#081838] border border-[#B8BBFF]/40 p-7 sm:p-10 md:p-12 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 text-white shadow-md">
          <div className="space-y-2.5 max-w-2xl">
            {eyebrowEn ? (
              <p
                className="font-en text-xs font-bold uppercase tracking-[0.18em] text-[#DFB15B]"
                lang="en"
              >
                {eyebrowEn}
              </p>
            ) : null}
            <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug [text-wrap:balance]">
              {titleBn}
            </h2>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed">
              {descriptionBn}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 shrink-0">
            <Link
              href={primaryHref}
              className="inline-flex items-center justify-center gap-2 min-h-12 px-5 py-3 rounded-[12px] bg-white text-[#081838] font-semibold text-sm hover:bg-[#E2E3FF] transition-colors shadow-xs whitespace-nowrap"
            >
              <span>{primaryLabelBn}</span>
              <ArrowRight className="w-4 h-4 text-[#243FBA]" aria-hidden="true" />
            </Link>
            {secondaryHref && secondaryLabelBn ? (
              <Link
                href={secondaryHref}
                className="inline-flex items-center justify-center gap-2 min-h-12 px-5 py-3 rounded-[12px] border border-white/45 bg-white/10 text-white font-semibold text-sm hover:bg-white/20 transition-colors whitespace-nowrap"
              >
                <span>{secondaryLabelBn}</span>
                <ArrowRight className="w-4 h-4 text-[#DFB15B]" aria-hidden="true" />
              </Link>
            ) : null}
            {tertiaryHref && tertiaryLabelBn ? (
              <Link
                href={tertiaryHref}
                className="inline-flex items-center justify-center gap-2 min-h-12 px-5 py-3 rounded-[12px] border border-[#DFB15B]/65 bg-[#081838]/40 text-white font-semibold text-sm hover:bg-[#081838]/70 transition-colors whitespace-nowrap"
              >
                <span>{tertiaryLabelBn}</span>
                <ArrowRight className="w-4 h-4 text-[#DFB15B]" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
