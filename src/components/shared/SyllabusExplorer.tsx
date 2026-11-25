"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronsUpDown, Search } from "lucide-react";
import type { CourseModuleDTO } from "@/types/domain";

interface SyllabusExplorerProps {
  modules: CourseModuleDTO[];
}

export function SyllabusExplorer({ modules }: SyllabusExplorerProps) {
  const [filterText, setFilterText] = useState("");
  const [openIndices, setOpenIndices] = useState<Set<number>>(
    () => new Set(modules.length > 0 ? [0] : []),
  );

  const totalTopics = useMemo(
    () => modules.reduce((acc, mod) => acc + mod.topicsBn.length, 0),
    [modules],
  );

  const filteredModules = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return modules.map((mod, idx) => ({ mod, idx }));
    return modules
      .map((mod, idx) => ({ mod, idx }))
      .filter(
        ({ mod }) =>
          mod.titleBn.toLowerCase().includes(q) ||
          mod.topicsBn.some((t) => t.toLowerCase().includes(q)),
      );
  }, [modules, filterText]);

  const allExpanded =
    filteredModules.length > 0 &&
    filteredModules.every(({ idx }) => openIndices.has(idx));

  const toggleAll = () => {
    if (allExpanded) {
      setOpenIndices(new Set());
    } else {
      setOpenIndices(new Set(filteredModules.map(({ idx }) => idx)));
    }
  };

  return (
    <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ps-navy">
            প্রস্তাবিত মডিউল ও সিলেবাস
          </h2>
          <p className="text-xs text-ps-muted mt-0.5">
            মোট {modules.length}টি মডিউল • {totalTopics}টি ব্যবহারিক বিষয়
          </p>
        </div>

        <button
          type="button"
          onClick={toggleAll}
          className="inline-flex items-center justify-center gap-1.5 min-h-10 px-3.5 rounded-[10px] border border-ps-border bg-ps-cool text-xs font-semibold text-ps-navy hover:bg-ps-ivory transition-colors cursor-pointer self-start sm:self-auto"
        >
          <ChevronsUpDown className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{allExpanded ? "সব সংকুচিত করুন" : "সব মডিউল খুলুন"}</span>
        </button>
      </div>

      {modules.length > 2 ? (
        <div className="relative">
          <Search
            className="w-4 h-4 text-ps-muted absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="সিলেবাসের বিষয় খুঁজুন..."
            aria-label="সিলেবাসের বিষয় খুঁজুন"
            className="w-full min-h-11 ps-10 pe-4 py-2 rounded-[10px] border border-ps-border bg-ps-ivory/40 text-sm text-ps-ink placeholder:text-ps-muted/75"
          />
        </div>
      ) : null}

      {filteredModules.length > 0 ? (
        <div className="space-y-3">
          {filteredModules.map(({ mod, idx }) => {
            const isOpen = filterText.trim() ? true : openIndices.has(idx);
            return (
              <details
                key={idx}
                open={isOpen}
                onToggle={(e) => {
                  const targetOpen = (e.currentTarget as HTMLDetailsElement).open;
                  setOpenIndices((prev) => {
                    const next = new Set(prev);
                    if (targetOpen) {
                      next.add(idx);
                    } else {
                      next.delete(idx);
                    }
                    return next;
                  });
                }}
                className="ps-disclosure group rounded-[12px] border border-ps-border bg-ps-ivory/50 open:border-ps-navy/35"
              >
                <summary className="flex items-center justify-between gap-3 p-4 font-bold text-ps-navy text-sm sm:text-base">
                  <span>{mod.titleBn}</span>
                  <ChevronDown
                    className="w-4 h-4 text-ps-navy shrink-0 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <ul className="px-4 pb-4 space-y-1.5 text-sm text-ps-ink/85 list-disc list-inside border-t border-ps-border/50 pt-3">
                  {mod.topicsBn.map((topic, tIdx) => (
                    <li key={tIdx}>{topic}</li>
                  ))}
                </ul>
              </details>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-ps-muted py-3">
          “{filterText.trim()}” এর সাথে মিলে এমন কোনো মডিউল পাওয়া যায়নি।
        </p>
      )}
    </div>
  );
}
