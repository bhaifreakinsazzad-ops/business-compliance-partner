"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";

export default function CustomerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <div className="min-h-screen bg-ps-pearl flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <Image
            src="/brand/bcp-master-logo.png"
            alt="Business Compliance Partner"
            width={52}
            height={52}
            className="rounded-full border border-ps-gold/60 mx-auto"
          />
        </Link>
        <h1 className="text-2xl font-extrabold text-ps-midnight">
          কাস্টমার কমান্ড সেন্টার
        </h1>
        <p className="text-xs sm:text-sm text-ps-slate">
          আপনার ব্যবসার কমপ্লায়েন্স, সেবা অনুরোধ ও কোর্স ড্যাশবোর্ডে প্রবেশ করুন
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-[16px] sm:px-10 border border-ps-border space-y-6">
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
                className="block text-xs font-semibold text-ps-navy"
              >
                ইমেইল ঠিকানা
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-ps-slate" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full pl-10 pr-3 py-2.5 border border-ps-border rounded-[10px] text-sm focus:ring-ps-gold focus:border-ps-gold"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-ps-navy"
              >
                পাসওয়ার্ড
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-ps-slate" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-2.5 border border-ps-border rounded-[10px] text-sm focus:ring-ps-gold focus:border-ps-gold"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-[10px] shadow-sm text-sm font-bold text-ps-ivory bg-ps-midnight hover:bg-ps-navy focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ps-gold disabled:opacity-50 transition-colors"
            >
              <span>{loading ? "যাচাই করা হচ্ছে..." : "লগইন করুন"}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>

          <div className="border-t border-ps-border pt-4 text-center space-y-2">
            <p className="text-xs text-ps-slate">
              অ্যাকাউন্ট নেই?{" "}
              <Link
                href="/portal/register"
                className="font-bold text-ps-gold hover:underline"
              >
                নতুন অ্যাকাউন্ট খুলুন
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-ps-slate">
              <ShieldCheck className="w-3.5 h-3.5 text-ps-gold" aria-hidden="true" />
              <span>নিরাপদ ও এনক্রিপ্টেড গ্রাহক ডেটাবেজ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
