"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";

interface PortalOrderCancelButtonProps {
  orderId: string;
  orderReference: string;
}

export function PortalOrderCancelButton({
  orderId,
  orderReference,
}: PortalOrderCancelButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCancel = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(
        `/api/commerce/orders/${encodeURIComponent(orderId)}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: "কাস্টমার পোর্টাল থেকে বাতিলকৃত" }),
        },
      );
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setErrorMsg(json?.error || "অর্ডার বাতিল করা সম্ভব হয়নি।");
        return;
      }
      setConfirming(false);
      router.refresh();
    } catch {
      setErrorMsg("নেটওয়ার্ক ত্রুটি হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 hover:underline cursor-pointer"
      >
        <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
        <span>অর্ডার বাতিল করুন</span>
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-medium text-rose-800">
        #{orderReference} বাতিল করবেন?
      </span>
      <button
        type="button"
        disabled={loading}
        onClick={handleCancel}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-700 text-white text-[11px] font-bold hover:bg-rose-800 disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
        ) : null}
        <span>হ্যাঁ, বাতিল করুন</span>
      </button>
      <button
        type="button"
        disabled={loading}
        onClick={() => setConfirming(false)}
        className="px-2 py-1 rounded border border-[#E1E4F2] bg-white text-[11px] font-semibold text-[#243FBA] hover:bg-[#FBFAFF] cursor-pointer"
      >
        না
      </button>
      {errorMsg ? (
        <span className="text-[11px] text-rose-700 font-medium">{errorMsg}</span>
      ) : null}
    </div>
  );
}
