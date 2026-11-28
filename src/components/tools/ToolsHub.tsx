"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckSquare,
  Compass,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  READINESS_QUESTIONS,
  evaluateReadiness,
  type ReadinessAnswer,
} from "@/lib/tools/readiness";
import {
  CHECKLIST_TEMPLATES,
  calculateChecklistProgress,
  getChecklistTemplate,
  type ChecklistTemplateId,
} from "@/lib/tools/checklist";
import {
  buildRoadmap,
  type BusinessStage,
  type RoadmapGoal,
} from "@/lib/tools/roadmap";

export function ToolsHub() {
  const [activeTab, setActiveTab] = useState<"readiness" | "checklists" | "roadmap">(
    "readiness",
  );

  // 1. Readiness Assessment state
  const [readinessAnswers, setReadinessAnswers] = useState<
    Record<string, ReadinessAnswer | undefined>
  >({});
  const readinessResult = evaluateReadiness(readinessAnswers);

  const handleReadinessAnswer = (questionId: string, answer: ReadinessAnswer) => {
    setReadinessAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const resetReadiness = () => setReadinessAnswers({});

  // 2. Checklist state
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<ChecklistTemplateId>("business-start");
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const currentTemplate = getChecklistTemplate(selectedTemplateId);
  const checklistProgress = calculateChecklistProgress(currentTemplate, checkedItems);

  const toggleChecklistItem = (id: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resetChecklist = () => setCheckedItems(new Set());

  // 3. Roadmap state
  const [roadmapGoal, setRoadmapGoal] = useState<RoadmapGoal>("start");
  const [roadmapStage, setRoadmapStage] = useState<BusinessStage>("idea");
  const roadmapSteps = buildRoadmap(roadmapGoal, roadmapStage);

  const baseId = useId();

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div
        role="tablist"
        aria-label="ব্যবসায়িক টুলস"
        className="flex flex-wrap gap-2 rounded-xl bg-white p-2 border border-[#E1E4F2] shadow-sm"
      >
        <button
          type="button"
          role="tab"
          id={`${baseId}-tab-readiness`}
          aria-selected={activeTab === "readiness"}
          aria-controls={`${baseId}-panel-readiness`}
          onClick={() => setActiveTab("readiness")}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === "readiness"
              ? "bg-[#243FBA] text-white shadow-sm"
              : "text-[#596775] hover:text-[#081838] hover:bg-[#FBFAFF]"
          }`}
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span>প্রস্তুতি মূল্যায়ন</span>
        </button>

        <button
          type="button"
          role="tab"
          id={`${baseId}-tab-checklists`}
          aria-selected={activeTab === "checklists"}
          aria-controls={`${baseId}-panel-checklists`}
          onClick={() => setActiveTab("checklists")}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === "checklists"
              ? "bg-[#243FBA] text-white shadow-sm"
              : "text-[#596775] hover:text-[#081838] hover:bg-[#FBFAFF]"
          }`}
        >
          <CheckSquare className="w-4 h-4" aria-hidden="true" />
          <span>স্মার্ট চেকলিস্ট</span>
        </button>

        <button
          type="button"
          role="tab"
          id={`${baseId}-tab-roadmap`}
          aria-selected={activeTab === "roadmap"}
          aria-controls={`${baseId}-panel-roadmap`}
          onClick={() => setActiveTab("roadmap")}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
            activeTab === "roadmap"
              ? "bg-[#243FBA] text-white shadow-sm"
              : "text-[#596775] hover:text-[#081838] hover:bg-[#FBFAFF]"
          }`}
        >
          <Compass className="w-4 h-4" aria-hidden="true" />
          <span>ব্যবসায়িক রোডম্যাপ</span>
        </button>
      </div>

      {/* Tab Panels */}
      {/* 1. Readiness Assessment */}
      <div
        role="tabpanel"
        id={`${baseId}-panel-readiness`}
        aria-labelledby={`${baseId}-tab-readiness`}
        hidden={activeTab !== "readiness"}
        className="space-y-6"
      >
        <div className="bg-white rounded-2xl border border-[#E1E4F2] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E4F2] pb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
                ব্যবসায়িক কমপ্লায়েন্স ও প্রস্তুতি মূল্যায়ন
              </h2>
              <p className="text-sm text-[#596775] mt-1">
                ৬টি প্রাথমিক প্রশ্নের মাধ্যমে আপনার ব্যবসার ডকুমেন্টেশন ও দায়িত্ব পর্যালোচনার ক্ষেত্র চিহ্নিত করুন।
              </p>
            </div>
            {readinessResult.answered > 0 && (
              <button
                type="button"
                onClick={resetReadiness}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#596775] hover:text-[#243FBA] transition-colors self-start cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>পুনরায় শুরু করুন</span>
              </button>
            )}
          </div>

          <div className="mt-6 space-y-6">
            {READINESS_QUESTIONS.map((question, index) => {
              const currentAnswer = readinessAnswers[question.id];
              return (
                <div
                  key={question.id}
                  className="p-5 rounded-xl border border-[#E1E4F2] bg-[#FBFAFF]/50 space-y-3"
                >
                  <p className="text-sm sm:text-base font-semibold text-[#081838]">
                    {index + 1}. {question.promptBn}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(
                      [
                        { value: "yes", label: "হ্যাঁ, নির্ধারিত আছে" },
                        { value: "no", label: "না, প্রস্তুত নয়" },
                        { value: "unsure", label: "নিশ্চিত নই" },
                      ] as const
                    ).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleReadinessAnswer(question.id, option.value)}
                        className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors border cursor-pointer ${
                          currentAnswer === option.value
                            ? "bg-[#243FBA] text-white border-[#243FBA] shadow-xs"
                            : "bg-white text-[#181D26] border-[#E1E4F2] hover:bg-[#FBFAFF]"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assessment Summary & Recommendations */}
          <div className="mt-8 pt-6 border-t border-[#E1E4F2]">
            <div className="flex items-center justify-between gap-4 text-xs font-semibold text-[#596775] uppercase tracking-wider mb-2 tabular-nums">
              <span>অগ্রগতি: {readinessResult.answered}/{readinessResult.total} টি সম্পন্ন</span>
              <span>{readinessResult.progressPercent}%</span>
            </div>
            <div className="h-2 w-full bg-[#E2E3FF] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00865A] transition-all duration-300"
                style={{ width: `${readinessResult.progressPercent}%` }}
              />
            </div>

            <p className="text-sm text-[#081838] font-medium mt-4">
              {readinessResult.summaryBn}
            </p>

            {readinessResult.recommendations.length > 0 && (
              <div className="mt-5 space-y-3">
                <h3 className="text-xs font-bold text-[#596775] uppercase tracking-wider">
                  প্রস্তাবিত পর্যালোচনার ক্ষেত্রসমূহ:
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {readinessResult.recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl border border-[#E1E4F2] bg-[#FBFAFF]/65 flex flex-col justify-between gap-3"
                    >
                      <p className="text-xs sm:text-sm text-[#181D26] leading-relaxed">
                        {rec.reviewBn}
                      </p>
                      <Link
                        href={rec.href}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#243FBA] hover:text-[#081838] transition-colors self-start"
                      >
                        <span>সম্পর্কিত সেবা দেখুন</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Smart Checklists */}
      <div
        role="tabpanel"
        id={`${baseId}-panel-checklists`}
        aria-labelledby={`${baseId}-tab-checklists`}
        hidden={activeTab !== "checklists"}
        className="space-y-6"
      >
        <div className="bg-white rounded-2xl border border-[#E1E4F2] p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E1E4F2] pb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
                স্মার্ট ডকুমেন্টেশন ও প্রস্তুতি চেকলিস্ট
              </h2>
              <p className="text-sm text-[#596775] mt-1">
                বিভিন্ন ব্যবসায়িক পদক্ষেপের আগে প্রয়োজনীয় নথি ও প্রাথমিক বিষয়গুলো টিক দিয়ে গুছিয়ে রাখুন।
              </p>
            </div>
            {checkedItems.size > 0 && (
              <button
                type="button"
                onClick={resetChecklist}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#596775] hover:text-[#243FBA] transition-colors self-start cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>চেকলিস্ট রিসেট</span>
              </button>
            )}
          </div>

          {/* Template Selector */}
          <div className="mt-6 flex flex-wrap gap-2">
            {CHECKLIST_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setSelectedTemplateId(tpl.id)}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors border cursor-pointer ${
                  selectedTemplateId === tpl.id
                    ? "bg-[#243FBA] text-white border-[#243FBA]"
                    : "bg-[#FBFAFF]/60 text-[#181D26] border-[#E1E4F2] hover:bg-[#E2E3FF]/50"
                }`}
              >
                {tpl.titleBn}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-[#FBFAFF]/60 border border-[#E1E4F2] flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-[#081838] text-sm sm:text-base">
                {currentTemplate.titleBn}
              </h3>
              <p className="text-xs text-[#596775] mt-0.5">
                {currentTemplate.descriptionBn}
              </p>
            </div>
            <div className="text-right shrink-0 tabular-nums">
              <span className="text-xs font-bold text-[#081838]">
                {checklistProgress.completed}/{checklistProgress.total} সম্পন্ন
              </span>
              <span className="block text-[11px] text-[#243FBA] font-semibold">
                {checklistProgress.percent}%
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="mt-6 space-y-3">
            {currentTemplate.items.map((item) => {
              const isChecked = checkedItems.has(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-colors cursor-pointer ${
                    isChecked
                      ? "bg-[#FBFAFF]/70 border-[#243FBA]/45"
                      : "bg-white border-[#E1E4F2] hover:bg-[#FBFAFF]/35"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleChecklistItem(item.id)}
                    className="mt-1 h-4 w-4 rounded border-[#E1E4F2] accent-[#243FBA]"
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        isChecked ? "line-through text-[#596775]" : "text-[#181D26]"
                      }`}
                    >
                      {item.labelBn}
                    </p>
                    {item.noteBn && (
                      <p className="text-xs text-[#596775] mt-1">{item.noteBn}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-[#E1E4F2] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#596775]">
              নোট: এই চেকলিস্ট আপনার ব্রাউজারে সুরক্ষিত থাকে। কোনো ব্যক্তিগত বা গোপনীয় তথ্য সংরক্ষণ করা হয় না।
            </p>
            <Link
              href="/consultancy"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#243FBA] text-white text-xs sm:text-sm font-semibold hover:bg-[#1D329B] transition-colors shrink-0"
            >
              <span>পেশাদার পরামর্শের অনুরোধ পাঠান</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Business Roadmap */}
      <div
        role="tabpanel"
        id={`${baseId}-panel-roadmap`}
        aria-labelledby={`${baseId}-tab-roadmap`}
        hidden={activeTab !== "roadmap"}
        className="space-y-6"
      >
        <div className="bg-white rounded-2xl border border-[#E1E4F2] p-6 sm:p-8 shadow-sm">
          <div className="border-b border-[#E1E4F2] pb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[#081838]">
              ব্যবসায়িক রোডম্যাপ ও ধারাবাহিক পরিকল্পনা
            </h2>
            <p className="text-sm text-[#596775] mt-1">
              আপনার বর্তমান পর্যায় ও প্রধান লক্ষ্যের ভিত্তিতে কাজের যৌক্তিক ধারাবাহিকতা দেখুন।
            </p>
          </div>

          {/* Selectors */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-[#081838] uppercase tracking-wider mb-2">
                প্রধান লক্ষ্য
              </label>
              <select
                value={roadmapGoal}
                onChange={(e) => setRoadmapGoal(e.target.value as RoadmapGoal)}
                className="w-full min-h-12 rounded-xl border border-[#E1E4F2] bg-white px-3 text-sm text-[#181D26] focus:border-[#243FBA] focus:outline-none focus:ring-2 focus:ring-[#243FBA]/20"
              >
                <option value="start">নতুন ব্যবসা শুরু (Start)</option>
                <option value="comply">নিয়মিত কমপ্লায়েন্স ও ট্যাক্স (Comply)</option>
                <option value="license">লাইসেন্সিং ও নিবন্ধন (License)</option>
                <option value="learn">দক্ষতা উন্নয়ন ও শেখা (Learn)</option>
                <option value="grow">ব্যবসা বৃদ্ধি ও রূপান্তর (Grow)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#081838] uppercase tracking-wider mb-2">
                বর্তমান ব্যবসার পর্যায়
              </label>
              <select
                value={roadmapStage}
                onChange={(e) => setRoadmapStage(e.target.value as BusinessStage)}
                className="w-full min-h-12 rounded-xl border border-[#E1E4F2] bg-white px-3 text-sm text-[#181D26] focus:border-[#243FBA] focus:outline-none focus:ring-2 focus:ring-[#243FBA]/20"
              >
                <option value="idea">পরিকল্পনা / আইডিয়া পর্যায় (Idea)</option>
                <option value="starting">শুরুর প্রস্তুতি চলছে (Starting)</option>
                <option value="operating">চলমান ব্যবসা পরিচালনা (Operating)</option>
                <option value="expanding">সম্প্রসারণ পর্যায় (Expanding)</option>
              </select>
            </div>
          </div>

          {/* Sequenced Steps */}
          <div className="mt-8 space-y-4">
            <h3 className="text-xs font-bold text-[#596775] uppercase tracking-wider">
              ধারাবাহিক পদক্ষেপসমূহ:
            </h3>

            <div className="space-y-4">
              {roadmapSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="p-5 rounded-xl border border-[#E1E4F2] bg-[#FBFAFF]/45 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#243FBA] text-xs font-bold text-white tabular-nums">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-[#081838]">
                        {step.titleBn}
                      </h4>
                      <p className="text-xs sm:text-sm text-[#596775] mt-1 leading-relaxed">
                        {step.reasonBn}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={step.href}
                    className="inline-flex items-center justify-center gap-1.5 min-h-10 px-4 py-2 rounded-lg bg-white border border-[#E1E4F2] text-xs sm:text-sm font-semibold text-[#243FBA] hover:bg-[#E2E3FF]/50 hover:border-[#243FBA] transition-colors shrink-0 self-start sm:self-center"
                  >
                    <span>{step.ctaBn}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
