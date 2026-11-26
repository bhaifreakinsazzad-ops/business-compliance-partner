"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EcosystemDomainSpec {
  id: string;
  labelEn: string;
  labelBn: string;
  courseTitleBn: string;
  courseHref: string;
  serviceTitleBn: string;
  serviceHref: string;
  bookTitleBn: string;
  bookHref: string;
}

const CONNECTED_DOMAINS: readonly EcosystemDomainSpec[] = [
  {
    id: "tax",
    labelEn: "Income Tax",
    labelBn: "আয়কর ও রিটার্ন",
    courseTitleBn: "সম্পূর্ণ আয়কর (Income Tax) ব্যবহারিক কোর্স",
    courseHref: "/courses?category=income-tax",
    serviceTitleBn: "e-TIN, আয়কর রিটার্ন ও কর কমপ্লায়েন্স সহায়তা",
    serviceHref: "/services?category=income-tax-solutions",
    bookTitleBn: "আয়কর ও ট্যাক্স হ্যান্ডবুক (প্রিভিউ)",
    bookHref: "/books?category=tax",
  },
  {
    id: "vat",
    labelEn: "VAT & Mushak",
    labelBn: "ভ্যাট ও মূসক",
    courseTitleBn: "ভ্যাট ও মূসক ৯.১ ব্যবহারিক প্রশিক্ষণ",
    courseHref: "/courses?category=vat-and-mushak",
    serviceTitleBn: "BIN নিবন্ধন ও মাসিক মূসক রিটার্ন সহায়তা",
    serviceHref: "/services?category=vat-mushak-solutions",
    bookTitleBn: "ভ্যাট ও মূসক ৯.১ গাইড (প্রিভিউ)",
    bookHref: "/books?category=vat-mushak",
  },
  {
    id: "egp",
    labelEn: "e-GP & Tender",
    labelBn: "ই-জিপি ও টেন্ডার",
    courseTitleBn: "e-GP ও সরকারি দরপত্র প্রস্তুতি কোর্স",
    courseHref: "/courses?category=egp-and-tender",
    serviceTitleBn: "e-GP নিবন্ধন ও বিডিং ডকুমেন্ট সহায়তা",
    serviceHref: "/services?category=egp-government-tender",
    bookTitleBn: "e-GP ও টেন্ডার ম্যানুয়াল (প্রিভিউ)",
    bookHref: "/books?category=egp-tender",
  },
  {
    id: "rjsc",
    labelEn: "Smart RJSC",
    labelBn: "কোম্পানি ও RJSC",
    courseTitleBn: "কোম্পানি গঠন ও RJSC সেক্রেটারিয়াল কোর্স",
    courseHref: "/courses?category=company-secretarial",
    serviceTitleBn: "Smart RJSC নিবন্ধন ও বার্ষিক রিটার্ন সেবা",
    serviceHref: "/services?category=company-secretarial-compliance",
    bookTitleBn: "RJSC ও কর্পোরেট আইন গাইড (প্রিভিউ)",
    bookHref: "/books?category=rjsc-corporate",
  },
  {
    id: "ecommerce",
    labelEn: "E-commerce & DBID",
    labelBn: "ই-কমার্স ও ডিজিটাল ব্যবসা",
    courseTitleBn: "ডিজিটাল ব্যবসা ও ই-কমার্স কমপ্লায়েন্স কোর্স",
    courseHref: "/courses?category=digital-business-ecommerce",
    serviceTitleBn: "DBID, ট্রেড ও অনলাইন ব্যবসা কমপ্লায়েন্স",
    serviceHref: "/services?category=digital-business-setup",
    bookTitleBn: "ই-কমার্স ও DBID নির্দেশিকা (প্রিভিউ)",
    bookHref: "/books?category=ecommerce",
  },
];

export function ConnectedEcosystemShowcase() {
  const [selectedId, setSelectedId] = useState<string>(CONNECTED_DOMAINS[0]!.id);
  const active =
    CONNECTED_DOMAINS.find((d) => d.id === selectedId) ?? CONNECTED_DOMAINS[0]!;

  return (
    <div className="rounded-[18px] border border-[#D4CCE3] bg-white p-5 sm:p-7 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#D4CCE3] pb-5">
        <div className="space-y-1">
          <p
            className="font-en text-xs font-bold uppercase tracking-[0.16em] text-[#51406F]"
            lang="en"
          >
            One Business Ecosystem · Three Ways To Grow
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-[#081838]">
            একই বিষয় শিখুন, সেবা নিন এবং বই পড়ুন
          </h3>
        </div>

        <div
          role="tablist"
          aria-label="বিষয়ভিত্তিক সমন্বিত সমাধান নির্বাচন"
          className="flex flex-wrap gap-2"
        >
          {CONNECTED_DOMAINS.map((domain) => {
            const isSelected = domain.id === active.id;
            return (
              <button
                key={domain.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedId(domain.id)}
                className={cn(
                  "px-3.5 py-2 rounded-[10px] text-xs font-semibold border transition-colors cursor-pointer",
                  isSelected
                    ? "bg-[#51406F] text-white border-[#51406F] shadow-xs"
                    : "bg-[#F2EFF8] text-[#081838] border-[#D4CCE3] hover:bg-[#DDD6EB]",
                )}
              >
                <span className="font-en" lang="en">
                  {domain.labelEn}
                </span>{" "}
                <span className="hidden sm:inline opacity-80">
                  · {domain.labelBn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Connected 3-Pillar Journey Cards in Exact Order: Courses -> Services -> Books */}
      <div
        aria-live="polite"
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Link
          href={active.courseHref}
          className="group rounded-[14px] border border-[#D4CCE3] bg-[#F2EFF8]/70 hover:bg-[#DDD6EB]/75 p-5 flex flex-col justify-between gap-4 transition-colors"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className="font-en text-xs font-bold uppercase tracking-[0.12em] text-[#51406F]"
                lang="en"
              >
                01 · Courses
              </span>
              <GraduationCap
                className="w-5 h-5 text-[#51406F]"
                aria-hidden="true"
              />
            </div>
            <p className="text-base font-bold text-[#081838] leading-snug">
              {active.courseTitleBn}
            </p>
            <p className="text-xs text-[#596775]">
              বিষয়টি নিজে শিখতে ও দক্ষতা অর্জন করতে কোর্স ট্র্যাক দেখুন।
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#51406F] group-hover:underline underline-offset-4">
            <span className="font-en" lang="en">
              Explore Courses
            </span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </Link>

        <Link
          href={active.serviceHref}
          className="group rounded-[14px] border border-[#D4CCE3] bg-[#F2EFF8]/70 hover:bg-[#DDD6EB]/75 p-5 flex flex-col justify-between gap-4 transition-colors"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className="font-en text-xs font-bold uppercase tracking-[0.12em] text-[#51406F]"
                lang="en"
              >
                02 · Services
              </span>
              <BriefcaseBusiness
                className="w-5 h-5 text-[#006D49]"
                aria-hidden="true"
              />
            </div>
            <p className="text-base font-bold text-[#081838] leading-snug">
              {active.serviceTitleBn}
            </p>
            <p className="text-xs text-[#596775]">
              সরাসরি পেশাদার সহায়তা, নিবন্ধন ও রিটার্ন কমপ্লায়েন্সের জন্য।
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006D49] group-hover:underline underline-offset-4">
            <span className="font-en" lang="en">
              Explore Services
            </span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </Link>

        <Link
          href={active.bookHref}
          className="group rounded-[14px] border border-[#D4CCE3] bg-[#F2EFF8]/70 hover:bg-[#DDD6EB]/75 p-5 flex flex-col justify-between gap-4 transition-colors"
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span
                className="font-en text-xs font-bold uppercase tracking-[0.12em] text-[#51406F]"
                lang="en"
              >
                03 · Books
              </span>
              <BookOpen className="w-5 h-5 text-[#51406F]" aria-hidden="true" />
            </div>
            <p className="text-base font-bold text-[#081838] leading-snug">
              {active.bookTitleBn}
            </p>
            <p className="text-xs text-[#596775]">
              হাতের নাগালে প্র্যাকটিক্যাল রেফারেন্স গাইড ও প্রকাশনা প্রিভিউ।
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#51406F] group-hover:underline underline-offset-4">
            <span className="font-en" lang="en">
              Explore Books
            </span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </div>
  );
}
