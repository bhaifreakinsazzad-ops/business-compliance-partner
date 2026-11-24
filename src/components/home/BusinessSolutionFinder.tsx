"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Compass, RotateCcw } from "lucide-react";

const GOALS = [
  { value: "start", label: "নতুন ব্যবসা শুরু করতে চাই" },
  { value: "register", label: "ব্যবসা নিবন্ধন বা লাইসেন্স প্রয়োজন" },
  { value: "comply", label: "ট্যাক্স, VAT বা কমপ্লায়েন্স গুছাতে চাই" },
  { value: "learn", label: "পেশাদার দক্ষতা শিখতে চাই" },
  { value: "grow", label: "ব্যবসা সম্প্রসারণে বিশেষজ্ঞ সহায়তা চাই" },
] as const;

const ROUTES = {
  start: {
    href: "/services?category=business-formation-and-rjsc",
    title: "ব্যবসা গঠন ও নিবন্ধন সেবা দেখুন",
    reason: "শুরুর পর্যায়ে ব্যবসার ধরন, নিবন্ধন ও প্রাথমিক কমপ্লায়েন্স একসঙ্গে বিবেচনা করা প্রয়োজন।",
  },
  register: {
    href: "/licensing",
    title: "লাইসেন্সিং ও নিবন্ধন নির্দেশিকা দেখুন",
    reason: "কর্তৃপক্ষ, প্রয়োজনীয় নথি ও সহায়তার সীমা যাচাই করে সঠিক পথ বেছে নিতে পারবেন।",
  },
  comply: {
    href: "/services?category=tax-vat-and-compliance",
    title: "ট্যাক্স, VAT ও কমপ্লায়েন্স সেবা দেখুন",
    reason: "চলমান ব্যবসার নিয়মিত রিটার্ন, হিসাব ও নিয়ন্ত্রক কাজগুলো সমন্বিতভাবে দেখা দরকার।",
  },
  learn: {
    href: "/courses",
    title: "পেশাদার কোর্স ও শেখার পথ দেখুন",
    reason: "প্রকাশিত কোর্সের সিলেবাস ও প্রাপ্যতা দেখে আগ্রহ নিবন্ধন করতে পারবেন।",
  },
  grow: {
    href: "/consultancy",
    title: "কনসালটেন্সি অনুরোধ পাঠান",
    reason: "সম্প্রসারণের সিদ্ধান্ত ব্যবসার ধরন, বর্তমান পর্যায় ও নির্দিষ্ট সমস্যার ওপর নির্ভর করে।",
  },
} as const;

export function BusinessSolutionFinder() {
  const [goal, setGoal] = useState<keyof typeof ROUTES | "">("");
  const [businessType, setBusinessType] = useState("");
  const [stage, setStage] = useState("");
  const recommendation = useMemo(() => (goal ? ROUTES[goal] : null), [goal]);

  const reset = () => {
    setGoal("");
    setBusinessType("");
    setStage("");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[16px] border border-ps-border bg-ps-white p-6 sm:p-8">
        <div className="mb-6 flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-ps-navy text-ps-white">
            <Compass className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-en text-xs font-semibold uppercase tracking-[0.18em] text-ps-muted">Guided discovery</p>
            <h2 className="text-xl font-bold text-ps-navy sm:text-2xl">আপনার ব্যবসার জন্য সঠিক পথ খুঁজুন</h2>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-semibold text-ps-navy">
            আপনার প্রধান লক্ষ্য
            <select value={goal} onChange={(event) => setGoal(event.target.value as keyof typeof ROUTES | "")} className="mt-1.5 min-h-12 w-full rounded-[12px] border border-ps-border bg-ps-white px-3 text-ps-ink">
              <option value="">একটি লক্ষ্য নির্বাচন করুন</option>
              {GOALS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ps-navy">
              ব্যবসার ধরন
              <select value={businessType} onChange={(event) => setBusinessType(event.target.value)} className="mt-1.5 min-h-12 w-full rounded-[12px] border border-ps-border bg-ps-white px-3 text-ps-ink">
                <option value="">নির্বাচন করুন</option>
                <option value="individual">ব্যক্তি বা পেশাজীবী</option>
                <option value="sme">SME / ছোট ব্যবসা</option>
                <option value="company">কোম্পানি / কর্পোরেট</option>
                <option value="import-export">আমদানি–রপ্তানি</option>
              </select>
            </label>
            <label className="block text-sm font-semibold text-ps-navy">
              বর্তমান পর্যায়
              <select value={stage} onChange={(event) => setStage(event.target.value)} className="mt-1.5 min-h-12 w-full rounded-[12px] border border-ps-border bg-ps-white px-3 text-ps-ink">
                <option value="">নির্বাচন করুন</option>
                <option value="idea">পরিকল্পনা পর্যায়</option>
                <option value="start">শুরু করছি</option>
                <option value="operate">ব্যবসা পরিচালনা করছি</option>
                <option value="grow">সম্প্রসারণ করছি</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="flex min-h-72 flex-col justify-between rounded-[16px] border border-ps-gold/35 bg-ps-midnight p-6 text-ps-white sm:p-8">
        {recommendation ? (
          <>
            <div className="space-y-4" aria-live="polite">
              <p className="font-en text-xs font-semibold uppercase tracking-[0.18em] text-ps-gold">Recommended next step</p>
              <h3 className="text-2xl font-bold leading-snug">{recommendation.title}</h3>
              <p className="max-w-xl text-sm leading-relaxed text-white/80">{recommendation.reason}</p>
              {(businessType || stage) ? <p className="text-xs text-white/65">আপনার নির্বাচিত ব্যবসার ধরন ও পর্যায় পরবর্তী ক্যাটালগ ফিল্টার বা পরামর্শ আলোচনায় প্রাসঙ্গিক হবে।</p> : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={recommendation.href} className="inline-flex min-h-12 items-center gap-2 rounded-[12px] bg-ps-ivory px-5 font-semibold text-ps-midnight">পরবর্তী ধাপে যান <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <button type="button" onClick={reset} className="inline-flex min-h-12 items-center gap-2 px-3 text-sm font-semibold text-ps-gold"><RotateCcw className="h-4 w-4" aria-hidden="true" /> আবার শুরু করুন</button>
            </div>
          </>
        ) : (
          <div className="m-auto max-w-md text-center">
            <p className="text-xl font-bold">একটি লক্ষ্য নির্বাচন করুন</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">গোপন তথ্য ছাড়াই কাঠামোবদ্ধ নিয়মের ভিত্তিতে প্রাসঙ্গিক কোর্স, সেবা, লাইসেন্সিং বা কনসালটেন্সি পথ দেখানো হবে।</p>
          </div>
        )}
      </div>
    </div>
  );
}
