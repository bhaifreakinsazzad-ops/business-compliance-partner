"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Lock,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import type { PublicBookPreview } from "@/types/domain";
import { trackEvent } from "@/lib/analytics/events";
import {
  computeLineItemTotalPaisa,
  formatBdtFromPaisa,
} from "@/lib/commerce/payments";

interface BookCheckoutPanelProps {
  book: PublicBookPreview;
}

function createCheckoutIntentKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `bko-${crypto.randomUUID()}`;
  }
  return `bko-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function BookCheckoutPanel({ book }: BookCheckoutPanelProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [checkoutIntentKey, setCheckoutIntentKey] = useState(createCheckoutIntentKey);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{
    reference: string;
    totalPaisa: number;
    invoiceNumber: string;
  } | null>(null);

  const unitPricePaisa = book.pricePaisa ?? 0;
  const totalPaisa =
    unitPricePaisa > 0
      ? computeLineItemTotalPaisa(unitPricePaisa, quantity)
      : 0;
  const inStock = (book.stockQuantity ?? 0) > 0;
  const maxAvailable = Math.min(book.stockQuantity ?? 5, 10);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setErrorMsg("অনুগ্রহ করে আপনার পূর্ণাঙ্গ ডেলিভারি ঠিকানা দিন।");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    trackEvent("checkout_start", {
      slug: book.slug,
      quantity,
      orderKind: "BOOKSTORE",
    });

    try {
      const res = await fetch("/api/commerce/books/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ bookId: book.id, quantity }],
          shippingAddress: shippingAddress.trim(),
          notes: notes.trim() || undefined,
          idempotencyKey: checkoutIntentKey,
        }),
      });

      const json = await res.json().catch(() => null);

      if (res.status === 401) {
        router.push(
          `/portal/login?redirect=${encodeURIComponent(`/books/${book.slug}`)}`,
        );
        return;
      }

      if (!res.ok || !json?.success) {
        setErrorMsg(
          json?.error ||
            "অর্ডার প্রক্রিয়া সম্পন্ন করা সম্ভব হয়নি। অনুগ্রহ করে পরে চেষ্টা করুন।",
        );
        return;
      }

      setSuccessOrder({
        reference: json.order.publicReference,
        totalPaisa:
          typeof json.order.totalPaisa === "number"
            ? json.order.totalPaisa
            : totalPaisa,
        invoiceNumber: json.invoice?.invoiceNumber ?? "INV-PENDING",
      });
    } catch {
      setErrorMsg("নেটওয়ার্ক সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="rounded-[16px] border border-action-whatsapp/50 bg-[#E8F6F0] p-6 space-y-4">
        <div className="flex items-center gap-3 text-action-whatsapp">
          <CheckCircle2 className="w-6 h-6 shrink-0" aria-hidden="true" />
          <h3 className="text-lg font-bold text-text-primary">
            অর্ডার সফলভাবে গৃহীত হয়েছে!
          </h3>
        </div>
        <div className="space-y-1.5 text-xs text-text-body/90 border-y border-action-whatsapp/30 py-3">
          <p>
            অর্ডার রেফারেন্স:{" "}
            <strong className="font-mono text-text-primary">
              {successOrder.reference}
            </strong>
          </p>
          <p>
            ইনভয়েস নম্বর:{" "}
            <strong className="font-mono text-text-primary">
              {successOrder.invoiceNumber}
            </strong>
          </p>
          <p>
            মোট প্রদেয় মূল্য:{" "}
            <strong className="text-action-whatsapp tabular-nums text-sm">
              {formatBdtFromPaisa(successOrder.totalPaisa, "en-US")}
            </strong>
          </p>
        </div>
        <p className="text-xs text-text-muted leading-relaxed">
          আপনার কাস্টমার পোর্টালে ইনভয়েস ও রসিদ তৈরি করা হয়েছে। আমাদের ডেলিভারি
          টিম দ্রুতই আপনার সাথে যোগাযোগ করবে।
        </p>
        <div className="flex flex-wrap gap-2.5 pt-1">
          <Link
            href="/portal"
            className="inline-flex items-center justify-center min-h-10 px-4 rounded-[10px] bg-action-primary hover:bg-action-primary-hover text-white text-xs font-semibold"
          >
            কাস্টমার পোর্টালে যান
          </Link>
          <button
            type="button"
            onClick={() => {
              setSuccessOrder(null);
              setCheckoutIntentKey(createCheckoutIntentKey());
            }}
            className="inline-flex items-center justify-center min-h-10 px-4 rounded-[10px] border border-border-subtle bg-white text-xs font-semibold text-text-accent hover:bg-surface-lavender"
          >
            আরেকটি অর্ডার করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[16px] border border-border-subtle bg-white p-6 space-y-5 shadow-sm">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-action-whatsapp uppercase tracking-wider">
          <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>অনলাইন বুকস্টোর অর্ডার</span>
        </div>
        <h2 className="text-lg font-bold text-text-primary">
          সরাসরি বই অর্ডার করুন
        </h2>
        <p className="text-xs text-text-muted">
          কাস্টমার অ্যাকাউন্টে লগইন করে নিরাপদ ডেলিভারির জন্য ঠিকানা দিন।
        </p>
      </div>

      <div className="rounded-[12px] bg-surface-lavender border border-border-subtle p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">প্রতি কপির মূল্য:</span>
          <span className="text-sm font-extrabold text-action-whatsapp tabular-nums">
            {formatBdtFromPaisa(unitPricePaisa, "en-US")}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-muted">স্টক অবস্থা:</span>
          <span
            className={`font-semibold ${inStock ? "text-action-whatsapp" : "text-rose-600"}`}
          >
            {inStock ? `উপলব্ধ (${book.stockQuantity} কপি)` : "স্টক শেষ"}
          </span>
        </div>
      </div>

      {inStock ? (
        <form onSubmit={handleSubmitOrder} className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-primary">কপি সংখ্যা:</span>
            <div className="inline-flex items-center rounded-[10px] border border-border-subtle bg-surface-lavender overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="কপি সংখ্যা কমান"
                className="w-9 h-9 flex items-center justify-center text-text-accent hover:bg-surface-lavender-muted transition-colors cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span className="w-10 text-center text-xs font-bold tabular-nums text-text-primary">
                {quantity}
              </span>
              <button
                type="button"
                disabled={quantity >= maxAvailable}
                onClick={() =>
                  setQuantity((q) => Math.min(maxAvailable, q + 1))
                }
                aria-label="কপি সংখ্যা বাড়ান"
                className="w-9 h-9 flex items-center justify-center text-text-accent hover:bg-surface-lavender-muted transition-colors cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <label className="block space-y-1.5 text-xs">
            <span className="font-bold text-text-primary">
              ডেলিভারি ঠিকানা <span className="text-rose-600">*</span>
            </span>
            <textarea
              required
              rows={2}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="বাড়ি/রোড নম্বর, এলাকা, থানা ও জেলা লিখুন..."
              className="w-full rounded-[10px] border border-border-subtle bg-[#F8F7FB] p-2.5 text-xs text-text-body placeholder:text-text-muted/70 focus:outline-ps-gold"
            />
          </label>

          <label className="block space-y-1 text-xs">
            <span className="font-medium text-text-muted">বিশেষ নোট (ঐচ্ছিক)</span>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="কুরিয়ার বা ডেলিভারি সংক্রান্ত বিশেষ অনুরোধ..."
              className="w-full rounded-[10px] border border-border-subtle bg-[#F8F7FB] px-3 py-2 text-xs text-text-body placeholder:text-text-muted/70 focus:outline-ps-gold"
            />
          </label>

          <div className="flex items-center justify-between pt-1 border-t border-border-subtle text-xs">
            <span className="font-bold text-text-primary">সর্বমোট প্রদেয়:</span>
            <span className="text-base font-extrabold text-action-whatsapp tabular-nums">
              {formatBdtFromPaisa(totalPaisa, "en-US")}
            </span>
          </div>

          {errorMsg ? (
            <div
              role="alert"
              className="rounded-[10px] border border-rose-300 bg-rose-50 p-2.5 flex items-start gap-2 text-xs text-rose-800"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-11 rounded-[12px] bg-action-whatsapp hover:bg-action-whatsapp-hover text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>অর্ডার তৈরি হচ্ছে...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" aria-hidden="true" />
                <span>
                  অর্ডার নিশ্চিত করুন ({formatBdtFromPaisa(totalPaisa, "en-US")})
                </span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="rounded-[10px] border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 space-y-2">
          <p className="font-bold">বর্তমানে এই বইটির স্টক শেষ।</p>
          <p className="text-[11px] leading-relaxed">
            পরবর্তী সংস্করণ প্রকাশের সাথে সাথে আপডেট পেতে নিচের বাটনে WhatsApp-এ
            বার্তা পাঠিয়ে রাখুন।
          </p>
        </div>
      )}
    </div>
  );
}
