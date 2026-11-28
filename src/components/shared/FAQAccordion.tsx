import { ChevronDown } from "lucide-react";
import type { PublicFaqItem } from "@/types/domain";
import { formatIsoDateBn } from "@/lib/content/helpers";

interface FAQAccordionProps {
  items: PublicFaqItem[];
  headingId?: string;
}

export function FAQAccordion({ items, headingId }: FAQAccordionProps) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3" aria-labelledby={headingId}>
      {items.map((faq) => {
        const verifiedDate = formatIsoDateBn(faq.lastVerifiedAt);
        return (
          <details
            key={faq.id}
            className="ps-disclosure group rounded-[16px] border border-[#E1E4F2] bg-white shadow-[0_1px_6px_rgba(81,64,111,0.04)] open:border-[#243FBA]/55"
          >
            <summary className="flex items-start justify-between gap-4 p-5 sm:p-6 text-base sm:text-lg font-semibold text-[#081838] select-none hover:bg-[#FBFAFF]/60 rounded-[16px] transition-colors cursor-pointer">
              <span className="flex-1 leading-snug">{faq.questionBn}</span>
              <ChevronDown
                className="w-5 h-5 text-[#243FBA] shrink-0 mt-0.5 transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>

            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-3 space-y-3 text-sm sm:text-base text-[#181D26]/90 leading-relaxed border-t border-[#E1E4F2]/70">
              <p>{faq.answerBn}</p>
              {faq.isRegulatory ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#596775]">
                  <span className="font-semibold text-[#243FBA]">
                    রেগুলেটরি তথ্য ও নীতিমালা
                  </span>
                  {verifiedDate ? (
                    <>
                      <span aria-hidden="true" className="text-[#E1E4F2]">
                        ·
                      </span>
                      <span>সর্বশেষ পর্যালোচনা: {verifiedDate}</span>
                    </>
                  ) : null}
                </div>
              ) : null}
            </div>
          </details>
        );
      })}
    </div>
  );
}
