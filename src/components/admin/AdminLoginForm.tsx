"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { sanitizeAdminRedirectPath } from "@/components/admin/admin-redirect";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = sanitizeAdminRedirectPath(searchParams.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
      } | null;

      if (!res.ok || !data?.success) {
        setError(
          data?.error ||
            "লগইন করতে সমস্যা হয়েছে। অনুগ্রহ করে তথ্য যাচাই করুন।",
        );
        setIsLoading(false);
        return;
      }

      router.push(nextUrl);
      router.refresh();
    } catch {
      setError("নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে পরে চেষ্টা করুন।");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-ps-navy border border-ps-white/15 rounded-[16px] p-6 sm:p-8 shadow-2xl">
      <div aria-live="assertive">
        {error && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-[12px] bg-rose-950/90 border border-rose-400/60 text-rose-100 text-sm flex items-start gap-3"
          >
            <AlertCircle
              className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-300"
              aria-hidden="true"
            />
            <span>{error}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="admin-email"
            className="block text-xs font-semibold uppercase tracking-wider text-ps-ivory/90 mb-2"
          >
            অফিসিয়াল ইমেইল
          </label>
          <div className="relative">
            <Mail
              className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ps-ivory/70 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="admin-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@paperworksquad.com"
              autoComplete="email"
              className="w-full min-h-12 pl-11 pr-4 py-3 bg-ps-midnight border border-ps-white/25 rounded-[12px] text-ps-white placeholder:text-ps-ivory/60 text-sm focus:border-ps-gold transition-colors"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="block text-xs font-semibold uppercase tracking-wider text-ps-ivory/90 mb-2"
          >
            পাসওয়ার্ড
          </label>
          <div className="relative">
            <Lock
              className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-ps-ivory/70 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="admin-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              className="w-full min-h-12 pl-11 pr-12 py-3 bg-ps-midnight border border-ps-white/25 rounded-[12px] text-ps-white placeholder:text-ps-ivory/60 text-sm focus:border-ps-gold transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-pressed={showPassword}
              aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-ps-ivory/80 hover:text-ps-white transition-colors cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 min-h-12 py-3 px-4 bg-ps-gold hover:bg-ps-gold/90 text-ps-midnight font-semibold rounded-[12px] shadow-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span>যাচাই করা হচ্ছে...</span>
            </>
          ) : (
            <>
              <span>লগইন করুন</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-ps-white/15 text-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center min-h-[40px] px-3 text-xs text-ps-ivory/85 hover:text-ps-gold transition-colors"
        >
          ← মূল ওয়েবসাইটে ফিরে যান
        </Link>
      </div>
    </div>
  );
}
