import Link from "next/link";
import { CheckCircle2, ExternalLink, MessageCircle } from "lucide-react";
import type { LeadSubmissionReceipt } from "@/types/domain";

interface LeadSuccessReceiptProps {
  receipt: LeadSubmissionReceipt;
  whatsappUrl?: string | null;
  whatsappDisplay?: string | null;
  onReset?: () => void;
}

export function LeadSuccessReceipt({
  receipt,
  whatsappUrl = null,
  whatsappDisplay = null,
  onReset,
}: LeadSuccessReceiptProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-[16px] border-2 border-ps-success/40 bg-ps-white p-6 sm:p-8 space-y-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <CheckCircle2
          className="w-7 h-7 text-ps-success shrink-0 mt-0.5"
          aria-hidden="true"
        />
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-ps-navy">
            আপনার অনুরোধটি সফলভাবে সংরক্ষিত হয়েছে
          </h3>
          <p className="text-sm text-ps-ink/90 leading-relaxed">
            আমাদের টিম আপনার তথ্য পর্যালোচনা করে উপযুক্ত সময়ে আপনার সঙ্গে যোগাযোগ করবে।
          </p>
        </div>
      </div>

      <div className="rounded-[12px] bg-ps-cool border border-ps-border p-4 space-y-1">
        <p className="text-xs font-medium text-ps-muted">আপনার রেফারেন্স নম্বর</p>
        <p
          className="font-en text-xl sm:text-2xl font-bold tracking-wider text-ps-navy select-all"
          lang="en"
        >
          {receipt.publicReference}
        </p>
      </div>

      {whatsappUrl ? (
        <div className="rounded-[14px] border border-ps-success/35 bg-ps-success/5 p-4 sm:p-5 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-bold text-ps-navy">
              দ্রুত সমাধানের জন্য সরাসরি আমাদের অ্যাডমিনের WhatsApp-এ যুক্ত হোন
            </p>
            <p className="text-xs sm:text-sm text-ps-ink/85 leading-relaxed">
              নিচের বাটনে ক্লিক করলে আপনার রেফারেন্স নম্বর ও প্রদত্ত তথ্যসহ বার্তাটি সরাসরি
              অফিশিয়াল WhatsApp নম্বরে{" "}
              {whatsappDisplay ? (
                <span className="font-en font-semibold text-ps-navy" dir="ltr">
                  ({whatsappDisplay})
                </span>
              ) : null}{" "}
              পাঠানোর জন্য প্রস্তুত হয়ে যাবে।
            </p>
          </div>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-whatsapp-cta="true"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-12 px-5 py-3 rounded-[12px] bg-gradient-to-r from-[#00865a] to-[#009c68] text-ps-white font-bold text-sm sm:text-base shadow-[0_4px_14px_rgba(0,134,90,0.22)] hover:from-[#006d49] hover:to-[#00865a] hover:-translate-y-0.5 transition-[transform,box-shadow,background-color] duration-200 focus-visible:outline-3 focus-visible:outline-ps-gold focus-visible:outline-offset-2"
          >
            <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>
              WhatsApp-এ অ্যাডমিনের সাথে কথা বলুন
              {whatsappDisplay ? ` (${whatsappDisplay})` : ""}
            </span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-85" aria-hidden="true" />
          </a>
        </div>
      ) : null}

      <p className="text-xs text-ps-muted leading-relaxed">
        নোট: ভবিষ্যতে অনুসন্ধানের জন্য রেফারেন্স নম্বরটি সংরক্ষণ করতে পারেন। এটি কোনো সরকারি
        আবেদনের প্রাপ্তি স্বীকার নয়—এটি আমাদের টিমের অভ্যন্তরীণ অনুসন্ধান নম্বর।
      </p>

      <div className="flex flex-wrap gap-3 pt-1">
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="ps-secondary-button text-sm"
          >
            আরেকটি অনুরোধ পাঠান
          </button>
        ) : null}
        <Link href="/" className="ps-primary-button text-sm">
          মূল পাতায় ফিরে যান
        </Link>
      </div>
    </div>
  );
}

