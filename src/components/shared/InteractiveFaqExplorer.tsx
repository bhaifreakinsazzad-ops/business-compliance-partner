"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import type { Pillar, PublicFaqItem } from "@/types/domain";
import { FAQAccordion } from "@/components/shared/FAQAccordion";
import { cn } from "@/lib/utils";

interface InteractiveFaqExplorerProps {
  items: PublicFaqItem[];
}

const PILLAR_TABS: ReadonlyArray<{ id: "ALL" | Pillar; labelBn: string }> = [
  { id: "ALL", labelBn: "সব প্রশ্ন" },
  { id: "COURSES", labelBn: "কোর্স" },
  { id: "SERVICES", labelBn: "পেশাদার সেবা" },
  { id: "LICENSING", labelBn: "লাইসেন্সিং" },
  { id: "CONSULTANCY", labelBn: "কনসালটেন্সি" },
];

export function InteractiveFaqExplorer({ items }: InteractiveFaqExplorerProps) {
  const [selectedPillar, setSelectedPillar] = useState<"ALL" | Pillar>("ALL");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (selectedPillar !== "ALL" && item.pillar !== selectedPillar) {
        return false;
      }
      if (!q) return true;
      return (
        item.questionBn.toLowerCase().includes(q) ||
        item.answerBn.toLowerCase().includes(q)
      );
    });
  }, [items, selectedPillar, query]);

  return (
    <div className="space-y-6">
      <div className="rounded-[16px] border border-[#D4CCE3] bg-white p-5 space-y-4 shadow-sm">
        <div className="relative">
          <Search
            className="w-4 h-4 text-[#51406F] absolute start-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="প্রশ্ন বা বিষয় লিখুন (যেমন: ফি, WhatsApp, অনুমোদন, ডকুমেন্ট)..."
            aria-label="প্রশ্নোত্তর খুঁজুন"
            className="w-full min-h-12 ps-11 pe-10 py-2.5 rounded-[12px] border border-[#D4CCE3] bg-[#F2EFF8]/50 text-[#181D26] text-base placeholder:text-[#596775]/75 focus:border-[#51406F]"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="অনুসন্ধান মুছুন"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[#596775] hover:text-[#081838] hover:bg-[#F2EFF8] absolute end-2 top-1/2 -translate-y-1/2 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        <div
          role="tablist"
          aria-label="প্রশ্নোত্তর বিভাগ"
          className="flex flex-wrap gap-2"
        >
          {PILLAR_TABS.map((tab) => {
            const active = selectedPillar === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedPillar(tab.id)}
                className={cn(
                  "inline-flex items-center min-h-10 px-4 rounded-[8px] text-xs sm:text-sm font-semibold border transition-colors cursor-pointer",
                  active
                    ? "bg-[#51406F] text-white border-[#51406F]"
                    : "bg-[#F2EFF8] text-[#081838] border-[#D4CCE3] hover:bg-[#DDD6EB]",
                )}
              >
                {tab.labelBn}
              </button>
            );
          })}
        </div>
      </div>

      {filteredItems.length > 0 ? (
        <FAQAccordion items={filteredItems} />
      ) : (
        <div className="rounded-[16px] border border-[#D4CCE3] bg-white p-8 text-center space-y-3">
          <p className="text-base font-bold text-[#081838]">
            এই ফিল্টারে কোনো প্রশ্নোত্তর পাওয়া যায়নি
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedPillar("ALL");
              setQuery("");
            }}
            className="ps-secondary-button text-sm"
          >
            সব প্রশ্নোত্তর দেখুন
          </button>
        </div>
      )}
    </div>
  );
}
