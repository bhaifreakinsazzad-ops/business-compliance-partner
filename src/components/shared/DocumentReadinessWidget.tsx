"use client";

import { useState } from "react";
import { CheckCircle2, FileText, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentReadinessWidgetProps {
  documents: string[];
  headingBn?: string;
}

export function DocumentReadinessWidget({
  documents,
  headingBn = "প্রাথমিক প্রয়োজনীয় নথিপত্র (পেশাদার পর্যালোচনা সাপেক্ষ)",
}: DocumentReadinessWidgetProps) {
  const [checkedIndices, setCheckedIndices] = useState<Set<number>>(
    () => new Set(),
  );

  const toggle = (idx: number) => {
    setCheckedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const total = documents.length;
  const readyCount = checkedIndices.size;
  const percent = total > 0 ? Math.round((readyCount / total) * 100) : 0;

  return (
    <div className="rounded-[16px] border border-[#D4CCE3] bg-white p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#081838] inline-flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#51406F] shrink-0" aria-hidden="true" />
            <span>{headingBn}</span>
          </h2>
          <p className="text-xs text-[#596775]">
            আপনার কাছে থাকা নথিগুলো টিক দিয়ে প্রস্তুতি যাচাই করুন (তথ্য কেবল আপনার ব্রাউজারেই থাকে)।
          </p>
        </div>

        {readyCount > 0 ? (
          <button
            type="button"
            onClick={() => setCheckedIndices(new Set())}
            className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-[8px] border border-[#D4CCE3] bg-[#F2EFF8] text-xs font-semibold text-[#51406F] hover:bg-[#DDD6EB] cursor-pointer shrink-0 self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>রিসেট</span>
          </button>
        ) : null}
      </div>

      {total > 0 ? (
        <div className="rounded-[12px] bg-[#F2EFF8]/80 border border-[#D4CCE3] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#081838]">
            <span>
              প্রস্তুতি: {readyCount} / {total}টি নথি
            </span>
            <span className="tabular-nums">{percent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#D4CCE3] overflow-hidden">
            <div
              className="h-full bg-[#00865A] transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          {readyCount > 0 && readyCount < total ? (
            <p className="text-xs text-[#181D26]/80">
              আংশিক নথি প্রস্তুত থাকলেও আমাদের টিম বাকি নথি ও বিকল্প প্রক্রিয়া সম্পর্কে সহায়তা করতে পারবে।
            </p>
          ) : readyCount === total ? (
            <p className="text-xs font-semibold text-[#00865A] inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>আপনার প্রাথমিক নথিপত্র সম্পূর্ণ প্রস্তুত! এখনই যোগাযোগ করতে পারেন।</span>
            </p>
          ) : null}
        </div>
      ) : null}

      <ul className="space-y-2">
        {documents.map((doc, idx) => {
          const isChecked = checkedIndices.has(idx);
          return (
            <li key={idx}>
              <label
                className={cn(
                  "flex items-start gap-3 min-h-11 p-3 rounded-[10px] border cursor-pointer transition-colors",
                  isChecked
                    ? "bg-[#00865A]/5 border-[#00865A]/40"
                    : "bg-[#F2EFF8]/45 border-[#D4CCE3] hover:bg-[#F2EFF8]",
                )}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(idx)}
                  className="mt-1 w-4 h-4 rounded accent-[#00865A] shrink-0 cursor-pointer"
                />
                <span
                  className={cn(
                    "text-sm sm:text-base leading-relaxed",
                    isChecked ? "text-[#081838] font-medium" : "text-[#181D26]/90",
                  )}
                >
                  {doc}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
