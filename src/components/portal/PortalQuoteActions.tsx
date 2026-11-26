"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, ShoppingBag, X } from "lucide-react";

interface PortalQuoteActionsProps {
  quoteId: string;
  status: string;
  hasOrder: boolean;
}

export function PortalQuoteActions({
  quoteId,
  status,
  hasOrder,
}: PortalQuoteActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleQuoteDecision = async (action: "ACCEPT" | "REJECT") => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/commerce/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId, action }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setErrorMsg(json?.error || "কোটেশন আপডেট করা যায়নি।");
        return;
      }
      router.refresh();
    } catch {
      setErrorMsg("নেটওয়ার্ক ত্রুটি হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToOrder = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/commerce/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setErrorMsg(json?.error || "অর্ডার তৈরি করা যায়নি।");
        return;
      }
      router.refresh();
    } catch {
      setErrorMsg("নেটওয়ার্ক ত্রুটি হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-1.5 text-right">
      {status === "SENT" ? (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuoteDecision("ACCEPT")}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#00865A] text-white text-[11px] font-bold hover:bg-[#006B47] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="w-3 h-3" aria-hidden="true" />
            )}
            <span>গ্রহণ করুন</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuoteDecision("REJECT")}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-rose-300 bg-white text-rose-700 text-[11px] font-bold hover:bg-rose-50 disabled:opacity-50 cursor-pointer"
          >
            <X className="w-3 h-3" aria-hidden="true" />
            <span>প্রত্যাখ্যান</span>
          </button>
        </div>
      ) : null}

      {status === "ACCEPTED" && !hasOrder ? (
        <button
          type="button"
          disabled={loading}
          onClick={handleConvertToOrder}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#51406F] text-white text-[11px] font-bold hover:bg-[#3F315A] disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
          ) : (
            <ShoppingBag className="w-3 h-3" aria-hidden="true" />
          )}
          <span>অর্ডার নিশ্চিত করুন</span>
        </button>
      ) : null}

      {errorMsg ? (
        <p className="text-[11px] text-rose-700 font-medium">{errorMsg}</p>
      ) : null}
    </div>
  );
}
