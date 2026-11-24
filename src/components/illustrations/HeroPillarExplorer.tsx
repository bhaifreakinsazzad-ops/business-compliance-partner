"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  Box,
  FileCheck2,
  FileText,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";
import type { Pillar } from "@/types/domain";
import { cn } from "@/lib/utils";
import { HeroCanvas3D } from "@/components/ui/HeroCanvas3D";

interface ExplorerTab {
  id: Pillar;
  labelBn: string;
  eyebrowEn: string;
  titleBn: string;
  bulletsBn: string[];
  ctaHref: string;
  ctaLabelBn: string;
  icon: typeof BookOpen;
}

const TABS: ExplorerTab[] = [
  {
    id: "COURSES",
    labelBn: "কোর্স",
    eyebrowEn: "Priority 01 • Courses & Learning",
    titleBn: "ব্যবহারিক ব্যবসা ও কমপ্লায়েন্স প্রশিক্ষণ",
    bulletsBn: [
      "Income Tax, VAT & Mushak, e-GP, Customs ও Accounting-এর ১০টি প্রস্তাবিত ট্র্যাক",
      "স্পষ্ট সিলেবাস, লক্ষ্য দর্শক ও আগ্রহ নিবন্ধনের সহজ সুযোগ",
      "অবাস্তব সার্টিফিকেট বা অযাচাইকৃত প্রতিশ্রুতি ছাড়া স্বচ্ছ ক্যাটালগ",
    ],
    ctaHref: "/courses",
    ctaLabelBn: "সব কোর্স দেখুন",
    icon: BookOpen,
  },
  {
    id: "SERVICES",
    labelBn: "পেশাদার সেবা",
    eyebrowEn: "Priority 01 • Professional Services",
    titleBn: "সুসংগঠিত কর্পোরেট ও কমপ্লায়েন্স সহায়তা",
    bulletsBn: [
      "e-TIN, BIN, মূসক ৯.১, Smart RJSC এবং e-GP দরপত্র নথি প্রস্তুতি",
      "প্রতিটি সেবায় কাজের পরিধি, সীমাবদ্ধতা ও প্রয়োজনীয় নথির প্রাথমিক ধারণা",
      "সরকারি ফি ও পেশাদার সহায়তা চার্জের স্বচ্ছ বিভাজন নীতি",
    ],
    ctaHref: "/services",
    ctaLabelBn: "সেবাসমূহ দেখুন",
    icon: BriefcaseBusiness,
  },
  {
    id: "LICENSING",
    labelBn: "লাইসেন্সিং",
    eyebrowEn: "Priority 02 • Licensing & Registration",
    titleBn: "ব্যবসা, কারখানা ও অনুমোদন নির্দেশিকা",
    bulletsBn: [
      "ট্রেড লাইসেন্স, Smart RJSC, DIFE LIMA, e-Fire লাইসেন্স ও IRC/ERC",
      "সংশ্লিষ্ট সরকারি কর্তৃপক্ষের সঠিক নাম ও রেফারেন্স সূত্র উল্লেখ",
      "স্বাধীন প্ল্যাটফর্ম ডিসক্লেইমারসহ বাস্তবসম্মত নির্দেশনা",
    ],
    ctaHref: "/licensing",
    ctaLabelBn: "লাইসেন্সিং দেখুন",
    icon: FileCheck2,
  },
  {
    id: "CONSULTANCY",
    labelBn: "কনসালটেন্সি",
    eyebrowEn: "Priority 02 • Advisory Intake",
    titleBn: "আপনার সমস্যা লিখুন, টিম যোগাযোগ করবে",
    bulletsBn: [
      "সংবেদনশীল NID বা ব্যাংক ফাইল ছাড়াই নিরাপদ প্রাথমিক অনুরোধ",
      "ডাটাবেজে সংরক্ষণের পর তাৎক্ষণিক বাস্তব রেফারেন্স নম্বর (BCP-2026-...)",
      "তথ্য পর্যালোচনা শেষে টিম উপযুক্ত সময়ে আপনার সাথে যোগাযোগ করবে",
    ],
    ctaHref: "/consultancy",
    ctaLabelBn: "পরামর্শের অনুরোধ করুন",
    icon: MessageSquareText,
  },
];

export function HeroPillarExplorer({ disclaimerBn }: { disclaimerBn: string }) {
  const [viewMode, setViewMode] = useState<"dossier" | "3d">("dossier");
  const [activeId, setActiveId] = useState<Pillar>("COURSES");
  const activeTab = TABS.find((t) => t.id === activeId) ?? TABS[0]!;
  const ActiveIcon = activeTab.icon;

  return (
    <div className="rounded-[16px] bg-ps-navy/95 border border-ps-gold/35 p-5 sm:p-7 shadow-2xl space-y-5">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        <span
          className="font-editorial text-xs sm:text-sm tracking-widest uppercase text-ps-gold"
          lang="en"
        >
          {viewMode === "3d" ? "3D Compliance Ecosystem" : "Interactive Platform Dossier"}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "dossier" ? "3d" : "dossier")}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-ps-navy border border-ps-gold/60 text-ps-gold hover:bg-ps-gold hover:text-ps-midnight transition-colors"
            title="৩ডি ইকোসিস্টেম ও ডসিয়ার মোড পরিবর্তন করুন"
          >
            {viewMode === "dossier" ? (
              <>
                <Box className="w-3.5 h-3.5" aria-hidden="true" />
                <span>৩ডি ভিউ</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5" aria-hidden="true" />
                <span>ডসিয়ার ভিউ</span>
              </>
            )}
          </button>
          <ShieldCheck className="w-5 h-5 text-ps-gold shrink-0" aria-hidden="true" />
        </div>
      </div>

      {viewMode === "3d" ? (
        <div className="space-y-4">
          <div className="relative rounded-[12px] bg-ps-midnight/80 border border-white/10 overflow-hidden">
            <HeroCanvas3D />
            <div className="absolute bottom-3 inset-x-3 rounded-lg bg-ps-midnight/90 backdrop-blur border border-white/10 p-3 text-xs text-white/85 flex items-center justify-between">
              <div>
                <p className="font-semibold text-ps-gold">ইন্টারেক্টিভ ৩ডি রেগুলেটরি নেটওয়ার্ক</p>
                <p className="text-[11px] text-white/70">মাউস বা স্পর্শের মাধ্যমে ঘোরান • ৪৩৭টি সেবা নোড</p>
              </div>
              <button
                type="button"
                onClick={() => setViewMode("dossier")}
                className="text-xs text-ps-ivory underline underline-offset-2 hover:text-ps-gold shrink-0"
              >
                ডসিয়ারে ফিরুন
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Interactive Pillar Switcher */}
          <div
            role="tablist"
            aria-label="প্ল্যাটফর্মের চারটি স্তম্ভ প্রিভিউ"
            className="grid grid-cols-2 sm:grid-cols-4 gap-2"
          >
            {TABS.map((tab) => {
              const isSelected = tab.id === activeId;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveId(tab.id)}
                  className={cn(
                    "min-h-11 px-3 py-2 rounded-[10px] text-xs sm:text-sm font-semibold transition-all text-center",
                    isSelected
                      ? "bg-ps-ivory text-ps-midnight shadow-sm"
                      : "bg-ps-midnight/70 text-white/80 border border-white/10 hover:text-ps-white hover:border-ps-gold/50",
                  )}
                >
                  {tab.labelBn}
                </button>
              );
            })}
          </div>

          {/* Active Dossier Panel */}
          <div
            role="tabpanel"
            aria-label={activeTab.labelBn}
            className="rounded-[12px] bg-ps-midnight/75 border border-white/10 p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="font-editorial text-xs tracking-wider uppercase text-ps-gold" lang="en">
                  {activeTab.eyebrowEn}
                </p>
                <h2 className="text-lg sm:text-xl font-bold text-ps-white leading-snug">
                  {activeTab.titleBn}
                </h2>
              </div>
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] bg-ps-navy border border-ps-gold/40 text-ps-gold shrink-0">
                <ActiveIcon className="w-5 h-5" aria-hidden="true" />
              </span>
            </div>

            <ul className="space-y-2.5 text-sm text-white/85">
              {activeTab.bulletsBn.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span
                    className="mt-2 w-1.5 h-1.5 rounded-full bg-ps-gold shrink-0"
                    aria-hidden="true"
                  />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="pt-1">
              <Link
                href={activeTab.ctaHref}
                className="inline-flex items-center gap-2 text-sm font-semibold text-ps-gold hover:text-ps-ivory hover:underline underline-offset-4"
              >
                <span>{activeTab.ctaLabelBn}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </>
      )}

      <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed">
        {disclaimerBn}
      </p>
    </div>
  );
}
