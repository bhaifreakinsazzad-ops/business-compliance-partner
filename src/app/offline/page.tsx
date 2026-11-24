import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff } from "lucide-react";

export const metadata: Metadata = {
  title: "অফলাইন | Business Compliance Partner",
  description: "ইন্টারনেট সংযোগ না থাকলে প্রদর্শিত নিরাপদ অফলাইন পাতা।",
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-ps-midnight px-4 py-16 text-ps-white grid place-items-center"
    >
      <section className="w-full max-w-xl rounded-[16px] border border-ps-gold/35 bg-ps-navy p-8 text-center shadow-2xl sm:p-12">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-ps-ivory text-ps-midnight">
          <WifiOff className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-6 font-en text-xs font-semibold uppercase tracking-[0.18em] text-ps-gold">
          Connection unavailable
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          ইন্টারনেট সংযোগ পাওয়া যাচ্ছে না
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
          সংযোগ ফিরে এলে আবার চেষ্টা করুন। নিরাপত্তার স্বার্থে অ্যাকাউন্ট, অ্যাডমিন,
          আর্থিক বা ব্যক্তিগত তথ্য অফলাইনে সংরক্ষণ করা হয় না।
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[12px] bg-ps-ivory px-6 font-semibold text-ps-midnight"
        >
          আবার চেষ্টা করুন
        </Link>
      </section>
    </main>
  );
}
