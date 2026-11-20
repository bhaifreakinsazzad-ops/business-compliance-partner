"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";

export function AdminLogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/logout", {
        method: "POST",
      });

      // Only surface an error on 5xx; 200 or 401 (already expired) proceed to login.
      if (res.status >= 500) {
        setError("লগআউট করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
        setIsLoggingOut(false);
        return;
      }

      router.push("/admin/login");
      router.refresh();
    } catch {
      setError("নেটওয়ার্ক ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-[12px] bg-rose-950/70 hover:bg-rose-900/80 border border-rose-400/40 text-rose-100 transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            <span>লগআউট হচ্ছে...</span>
          </>
        ) : (
          <>
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>লগআউট করুন</span>
          </>
        )}
      </button>

      {error && (
        <p
          role="alert"
          className="text-[11px] text-rose-200 bg-rose-950/80 border border-rose-400/40 rounded-lg px-2.5 py-1.5"
        >
          {error}
        </p>
      )}
    </div>
  );
}
