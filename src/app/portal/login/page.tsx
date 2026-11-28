"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/customer/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "লগইন ব্যর্থ হয়েছে।");
      }

      router.push("/portal");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "লগইন প্রক্রিয়ায় ত্রুটি ঘটেছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFAFF] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#243FBA] hover:text-[#081838] hover:underline underline-offset-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>মূল ওয়েবসাইটে ফিরে যান</span>
        </Link>
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Image
            src="/brand/bcp-master-logo.png"
            alt="Business Compliance Partner"
            width={52}
            height={52}
            referrerPolicy="no-referrer"
            className="rounded-full border border-[#C59028]/60 mx-auto"
          />
        </Link>
        <h1 className="text-2xl font-extrabold text-[#081838]">
          কাস্টমার কমান্ড সেন্টার
        </h1>
        <p className="text-xs sm:text-sm text-[#596775]">
          আপনার ব্যবসার কমপ্লায়েন্স, সেবা অনুরোধ ও কোর্স ড্যাশবোর্ডে প্রবেশ করুন
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-[16px] sm:px-10 border border-[#E1E4F2] space-y-6">
          {error ? (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700"
            >
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-[#081838]"
              >
                ইমেইল ঠিকানা
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#596775]" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-[#E1E4F2] rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[#243FBA]/25 focus:border-[#243FBA]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#081838]"
              >
                পাসওয়ার্ড
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#596775]" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-11 py-2.5 border border-[#E1E4F2] rounded-[10px] text-sm focus:outline-none focus:ring-2 focus:ring-[#243FBA]/25 focus:border-[#243FBA]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-[#596775] hover:text-[#243FBA] cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-[10px] shadow-sm text-sm font-bold text-white bg-[#243FBA] hover:bg-[#1D329B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#243FBA] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <span>{loading ? "যাচাই করা হচ্ছে..." : "লগইন করুন"}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <div className="border-t border-[#E1E4F2] pt-4 text-center space-y-2">
            <p className="text-xs text-[#596775]">
              অ্যাকাউন্ট নেই?{" "}
              <Link
                href="/portal/register"
                className="font-bold text-[#243FBA] hover:text-[#1D329B] hover:underline"
              >
                নতুন অ্যাকাউন্ট খুলুন
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#596775]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00865A]" aria-hidden="true" />
              <span>নিরাপদ ও এনক্রিপ্টেড গ্রাহক ডেটাবেজ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
