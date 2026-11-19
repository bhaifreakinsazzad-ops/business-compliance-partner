import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { LeadSubmissionReceipt } from "@/types/domain";

interface LeadSuccessReceiptProps {
  receipt: LeadSubmissionReceipt;
  onReset?: () => void;
}

export function LeadSuccessReceipt({
  receipt,
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
