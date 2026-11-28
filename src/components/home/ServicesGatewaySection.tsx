"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CheckCircle2,
  FileCheck2,
  Lock,
  ReceiptText,
} from "lucide-react";
import { ConsultancyForm } from "@/components/forms/ConsultancyForm";
import { WhatsAppEnquiryButton } from "@/components/shared/WhatsAppEnquiryButton";
import { resolveServiceTrackAsset } from "@/lib/config/media-manifest";
import { cn } from "@/lib/utils";

interface ServiceTrackHighlight {
  id: "tax" | "vat" | "rjsc" | "licensing";
  tabLabelBn: string;
  titleBn: string;
  href: string;
  icon: "tax" | "vat" | "rjsc" | "licensing";
  checklistBn: string[];
}

const SERVICE_HIGHLIGHTS: readonly ServiceTrackHighlight[] = [
  {
    id: "tax",
    tabLabelBn: "আয়কর ও ট্যাক্স",
    titleBn: "ব্যক্তিগত ও কর্পোরেট আয়কর কমপ্লায়েন্স সেবা",
    href: "/services?category=income-tax-solutions",
    icon: "tax",
    checklistBn: [
      "নতুন e-TIN নিবন্ধন ও প্রোফাইল সংশোধন সহায়তা",
      "ব্যক্তিগত, ফার্ম ও কোম্পানি আয়কর রিটার্ন প্রস্তুত",
      "উৎস কর (TDS) সমন্বয় ও ট্যাক্স চালান যাচাই",
      "অডিট নোটিশ ও কর শুনানির নথিপত্র প্রস্তুতি",
      "বার্ষিক ট্যাক্স ক্লিয়ারেন্স ও PSR ডকুমেন্ট সহায়তা",
    ],
  },
  {
    id: "vat",
    tabLabelBn: "ভ্যাট ও মূসক ৯.১",
    titleBn: "ভ্যাট (BIN) নিবন্ধন ও মাসিক মূসক কমপ্লায়েন্স",
    href: "/services?category=vat-mushak-solutions",
    icon: "vat",
    checklistBn: [
      "অনলাইন ভ্যাট/BIN নিবন্ধন ও তথ্য হালনাগাদ",
      "মাসিক মূসক ৯.১ রিটার্ন প্রস্তুত ও দাখিল সহায়তা",
      "মূসক ৬.১, ৬.২ ও ৬.৩ রেজিস্টার ব্যবস্থাপনা",
      "উপকরণ কর রেয়াত ও VDS সার্টিফিকেট সমন্বয়",
      "ভ্যাট অডিট প্রস্তুতি ও রেগুলেটরি নথি যাচাই",
    ],
  },
  {
    id: "rjsc",
    tabLabelBn: "Smart RJSC ও কোম্পানি",
    titleBn: "কোম্পানি নিবন্ধন ও কর্পোরেট সেক্রেটারিয়াল সেবা",
    href: "/services?category=company-secretarial-compliance",
    icon: "rjsc",
    checklistBn: [
      "Smart RJSC নেম ক্লিয়ারেন্স ও কোম্পানি গঠন",
      "MoA, AoA ও Form XII কর্পোরেট ডকুমেন্টেশন",
      "শেয়ার ট্রান্সফার ও পরিচালক পরিবর্তন প্রক্রিয়া",
      "বার্ষিক রিটার্ন (Schedule X) ও AGM কমপ্লায়েন্স",
      "ট্রেড ও পার্টনারশিপ থেকে লিমিটেড রূপান্তর সহায়তা",
    ],
  },
  {
    id: "licensing",
    tabLabelBn: "লাইসেন্সিং ও e-GP",
    titleBn: "ট্রেড লাইসেন্স, DIFE, ফায়ার, IRC ও e-GP সহায়তা",
    href: "/licensing",
    icon: "licensing",
    checklistBn: [
      "সিটি কর্পোরেশন ট্রেড লাইসেন্স ও নবায়ন সহায়তা",
      "DIFE LIMA ফ্যাক্টরি লাইসেন্স ও ফায়ার সার্ভিস",
      "আমদানি ও রপ্তানি নিবন্ধন (IRC / ERC)",
      "BPPA e-GP টেন্ডার নিবন্ধন ও ডকুমেন্ট ভল্ট",
      "ই-কমার্স DBID ও অন্যান্য ব্যবসা নিবন্ধন",
    ],
  },
] as const;

interface ServicesGatewaySectionProps {
  verifiedWhatsapp: string | null;
  canonicalBaseUrl: string | null;
}

function getTrackIcon(icon: ServiceTrackHighlight["icon"]) {
  switch (icon) {
    case "tax":
      return Calculator;
    case "vat":
      return ReceiptText;
    case "rjsc":
      return Building2;
    case "licensing":
      return FileCheck2;
  }
}

export function ServicesGatewaySection({
  verifiedWhatsapp,
  canonicalBaseUrl,
}: ServicesGatewaySectionProps) {
  const [selectedId, setSelectedId] =
    useState<ServiceTrackHighlight["id"]>("tax");
  const activeTrack =
    SERVICE_HIGHLIGHTS.find((item) => item.id === selectedId) ??
    SERVICE_HIGHLIGHTS[0]!;
  const TrackIcon = getTrackIcon(activeTrack.icon);
  const trackAsset = resolveServiceTrackAsset(activeTrack.id);

  return (
    <section
      id="pillar-services"
      data-home-pillar="services"
      aria-label="02. Services — আমাদের পেশাদার সেবাসমূহ"
      className="py-12 sm:py-16 bg-white border-b border-[#E1E4F2]"
    >
      <div className="ps-container">
        <div className="bcp-periwinkle-service-frame rounded-[24px] border border-[#B8BBFF] p-5 sm:p-9 lg:p-12 shadow-[0_18px_48px_rgba(36,63,186,0.08)] space-y-8">
          {/* Centered Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <p className="inline-flex items-center gap-1.5 font-en text-xs font-bold uppercase tracking-[0.16em] text-[#243FBA]">
              <BriefcaseBusiness className="w-3.5 h-3.5" aria-hidden="true" />
              <span>02 · Services · Professional Compliance</span>
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-[2.15rem] font-extrabold text-[#081838] leading-tight">
              আমাদের <span className="text-[#243FBA]">পেশাদার</span> সেবাসমূহ
            </h2>
            <div className="flex items-center justify-center gap-2" aria-hidden="true">
              <span className="h-[1.5px] w-10 bg-[#243FBA]/50" />
              <span className="w-2 h-2 rotate-45 bg-[#C59028]" />
              <span className="h-[1.5px] w-10 bg-[#243FBA]/50" />
            </div>
            <p className="text-sm sm:text-base text-[#596775] leading-relaxed">
              আপনার ব্যবসার আয়কর, ভ্যাট, কোম্পানি সেক্রেটারিয়াল ও লাইসেন্সিংয়ের
              প্রয়োজনে পেশাদার এবং আইনানুগ সহায়তা প্রদান করি।
            </p>
          </div>

          {/* Interactive Service Track Switcher */}
          <div
            role="tablist"
            aria-label="প্রধান সেবা বিভাগ নির্বাচন করুন"
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {SERVICE_HIGHLIGHTS.map((track) => {
              const isSelected = track.id === activeTrack.id;
              return (
                <button
                  key={track.id}
                  id={`services-tab-${track.id}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="services-gateway-panel"
                  onClick={() => setSelectedId(track.id)}
                  className={cn(
                    "min-h-10 px-4 py-2 rounded-[10px] text-xs sm:text-sm font-semibold border transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[#243FBA] text-white border-[#243FBA] shadow-xs"
                      : "bg-white/95 text-[#081838] border-[#B8BBFF] hover:bg-[#E2E3FF]",
                  )}
                >
                  {track.tabLabelBn}
                </button>
              );
            })}
          </div>

          {/* Inner Split Container: Left Editorial Visual + Checklist, Right White Enquiry Form Card */}
          <div
            id="services-gateway-panel"
            role="tabpanel"
            aria-labelledby={`services-tab-${activeTrack.id}`}
            className="rounded-[20px] border border-white bg-white/95 p-5 sm:p-7 lg:p-9 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-start"
          >
            <div className="lg:col-span-6 space-y-5">
              {/* Track-Specific Editorial Artwork Header */}
              <div className="overflow-hidden rounded-[14px] border border-[#E1E4F2] bg-[#F4F5FF] shadow-xs">
                <Image
                  src={trackAsset.publicPath}
                  alt={trackAsset.altBn}
                  width={trackAsset.width}
                  height={trackAsset.height}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="flex items-start gap-3.5">
                <span className="inline-flex items-center justify-center w-11 h-11 rounded-[12px] bg-[#243FBA] text-white shrink-0 shadow-xs">
                  <TrackIcon className="w-5 h-5" aria-hidden="true" />
                </span>
                <div className="space-y-1">
                  <p className="font-en text-[11px] font-bold uppercase tracking-[0.14em] text-[#243FBA]">
                    Services Gateway
                  </p>
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#081838] leading-snug">
                    {activeTrack.titleBn}
                  </h3>
                </div>
              </div>

              <ul className="space-y-2.5 text-sm text-[#181D26]">
                {activeTrack.checklistBn.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckCircle2
                      className="w-4 h-4 text-[#243FBA] shrink-0 mt-1"
                      aria-hidden="true"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-1 flex flex-wrap items-center gap-3">
                <Link
                  href={activeTrack.href}
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-[#243FBA] hover:text-[#1D329B] hover:underline underline-offset-4"
                >
                  <span>বিস্তারিত দেখুন</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <span className="text-[#E1E4F2]" aria-hidden="true">
                  |
                </span>
                <Link
                  href="/services"
                  className="text-sm font-semibold text-[#081838] hover:text-[#243FBA] hover:underline underline-offset-4"
                >
                  সকল সেবাসমূহ (১১টি বিভাগ)
                </Link>
              </div>

              <div className="pt-2 space-y-3">
                <WhatsAppEnquiryButton
                  verifiedWhatsapp={verifiedWhatsapp}
                  serviceName={activeTrack.titleBn}
                  servicePath={activeTrack.href}
                  canonicalBaseUrl={canonicalBaseUrl}
                  fallbackHref="/consultancy"
                  fallbackLabelBn="অনলাইনে পরামর্শ অনুরোধ করুন"
                  size="md"
                />

                <p className="inline-flex items-center gap-2 text-xs text-[#596775]">
                  <Lock className="w-3.5 h-3.5 text-[#00865A] shrink-0" aria-hidden="true" />
                  <span>আপনার ব্যবসায়িক তথ্য প্রযোজ্য গোপনীয়তা নীতিমালা অনুযায়ী সংরক্ষিত থাকে</span>
                </p>
              </div>
            </div>

            <div className="lg:col-span-6">
              <ConsultancyForm
                compact
                defaultPillar="SERVICES"
                sourcePage="/"
                verifiedWhatsapp={verifiedWhatsapp}
                targetTitle={activeTrack.tabLabelBn}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
