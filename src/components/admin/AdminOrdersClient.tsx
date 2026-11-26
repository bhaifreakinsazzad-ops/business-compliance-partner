"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PackageCheck, ShoppingBag, XCircle } from "lucide-react";
import { formatBdtFromPaisa } from "@/lib/commerce/payments";

export interface AdminOrderRow {
  id: string;
  publicReference: string;
  orderKind: string;
  status: string;
  paymentStatus: string;
  totalPaisa: number;
  customerEmail: string | null;
  customerName: string | null;
  shippingAddress: string | null;
  itemCount: number;
  createdAt: string;
}

interface AdminOrdersClientProps {
  orders: AdminOrderRow[];
  canCancel: boolean;
  dbConfigured: boolean;
}

export function AdminOrdersClient({
  orders,
  canCancel,
  dbConfigured,
}: AdminOrdersClientProps) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleTransition = async (orderId: string, nextStatus: string) => {
    setBusyId(orderId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setFeedback(json?.error || "অর্ডার স্ট্যাটাস আপডেট করা যায়নি।");
        return;
      }
      setFeedback(`অর্ডার স্ট্যাটাস ${nextStatus}-এ উন্নীত হয়েছে।`);
      router.refresh();
    } catch {
      setFeedback("নেটওয়ার্ক ত্রুটি হয়েছে।");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ps-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-ps-gold" aria-hidden="true" />
            <span>অর্ডার ও ডেলিভারি ব্যবস্থাপনা</span>
          </h1>
          <p className="text-xs sm:text-sm text-ps-ivory/75 mt-1">
            বুকস্টোর ও সেবা অর্ডারগুলোর স্ট্যাটাস পরিচালনা, ডেলিভারি নিশ্চিতকরণ এবং বাতিলকৃত অর্ডারের স্টক পুনরুদ্ধার।
          </p>
        </div>
      </div>

      {!dbConfigured ? (
        <div className="rounded-xl border border-ps-gold/40 bg-ps-navy p-4 text-xs text-ps-ivory/90">
          ডাটাবেজ সংযুক্ত নেই — লাইভ পরিবেশে DATABASE_URL কনফিগার করার পর অর্ডার তালিকা দেখা যাবে।
        </div>
      ) : null}

      {feedback ? (
        <div className="rounded-xl border border-ps-gold/40 bg-ps-navy px-4 py-3 text-xs text-ps-gold">
          {feedback}
        </div>
      ) : null}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-ps-white/15 bg-ps-navy p-8 text-center text-sm text-ps-ivory/70">
          এখনও কোনো অর্ডার পাওয়া যায়নি।
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-ps-white/15 bg-ps-navy p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono font-bold text-ps-gold">
                    #{order.publicReference}
                  </span>
                  <span className="text-ps-ivory/60">·</span>
                  <span className="font-semibold text-ps-white">
                    {order.orderKind}
                  </span>
                  <span className="text-ps-ivory/60">·</span>
                  <span className="font-semibold text-emerald-300">
                    {order.paymentStatus}
                  </span>
                  <span className="text-ps-ivory/60">·</span>
                  <span className="font-semibold text-amber-300">
                    {order.status}
                  </span>
                </div>
                <p className="text-sm font-bold text-ps-white">
                  {order.customerName || "অতিথি কাস্টমার"}{" "}
                  {order.customerEmail ? `(${order.customerEmail})` : ""}
                </p>
                <p className="text-xs text-ps-ivory/75">
                  মোট মূল্য:{" "}
                  <strong className="text-ps-gold tabular-nums">
                    {formatBdtFromPaisa(order.totalPaisa, "en-US")}
                  </strong>{" "}
                  · আইটেম: {order.itemCount}
                </p>
                {order.shippingAddress ? (
                  <p className="text-xs text-ps-ivory/70">
                    ঠিকানা: {order.shippingAddress}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {order.status === "CONFIRMED" || order.status === "IN_FULFILLMENT" ? (
                  <button
                    type="button"
                    disabled={busyId === order.id}
                    onClick={() => handleTransition(order.id, "SHIPPED")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    {busyId === order.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <PackageCheck className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                    <span>SHIPPED চিহ্নিত করুন</span>
                  </button>
                ) : null}

                {order.status === "SHIPPED" ? (
                  <button
                    type="button"
                    disabled={busyId === order.id}
                    onClick={() => handleTransition(order.id, "DELIVERED")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    <span>DELIVERED চিহ্নিত করুন</span>
                  </button>
                ) : null}

                {canCancel &&
                order.status !== "CANCELLED" &&
                order.status !== "REFUNDED" &&
                order.status !== "DELIVERED" ? (
                  <button
                    type="button"
                    disabled={busyId === order.id}
                    onClick={() => handleTransition(order.id, "CANCELLED")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-400/50 bg-rose-950/50 hover:bg-rose-900/70 text-rose-200 text-xs font-semibold disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>বাতিল ও স্টক ফেরত</span>
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
